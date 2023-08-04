import { ChatCompletionRequestMessage } from 'openai';
import { ChatGpt } from '../libs/Chatgpt';
import { Conversation } from '../model/conversation';
import { RolesSystem } from '../interfaces/roles';
import { Templates } from '../interfaces/templates';
import { ConversationState } from '../interfaces/states';
import moment = require('moment-timezone');
import { Product } from '../model/product';

moment.tz.setDefault('America/Mexico_City');

export class Chat {
  number: string;

  constructor(number: string) {
    this.number = number;
  }

  async messageReceived(content: string): Promise<
    | {
        state: ConversationState;
        messsage?: string;
        image?: string;
      }
    | undefined
  > {
    const newMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content,
    };
    const users = await Conversation.find({ number: this.number });
    const user = users[0];

    if (user) {
      const ultimaActualizacion = user.updatedAt;

      // Calcular la diferencia de tiempo entre la última actualización y el momento actual
      const hoursDiferrence = moment(moment().toDate()).diff(
        ultimaActualizacion,
        'hours'
      );
      console.log('hoursDiference: ', hoursDiferrence);

      if (hoursDiferrence >= 24 && user.state !== ConversationState.new) {
        user.messages = [];
        user.state = ConversationState.new;
        await user.save();
        return { messsage: Templates.welcomeMessage, state: user.state };
      }

      if (content.toLocaleLowerCase().includes('agente')) {
        user.state = ConversationState.agent;
        await user.save();
        return { messsage: Templates.agentInit, state: user.state };
      }

      if (
        content.toLocaleLowerCase().includes('lucy') ||
        content.toLocaleLowerCase().includes('menu')
      ) {
        user.messages = [];
        user.state = ConversationState.new;
        await user.save();
        return { messsage: Templates.welcomeMessage, state: user.state };
      }

      if (user.state === ConversationState.new) {
        if (content.includes('1')) {
          user.state = ConversationState.products;
          user.messages.push({
            role: 'user',
            content:
              'Quiero que enlistes los nombre de los productos y precios e invitame a seleccionar uno para más informacion',
          });
          await user.save();

          const products = await this.getProductsList();
          const response: ChatCompletionRequestMessage = {
            role: 'user',
            content: products.message,
          };
          if (response) {
            user.messages.push(response);
            await user.save();
          }
          return { messsage: response?.content, state: user.state };
        } else if (content.includes('2')) {
          user.state = ConversationState.agent;
          await user.save();
          return { messsage: Templates.agentInit, state: user.state };
        } else if (content.includes('3')) {
          return { messsage: Templates.reviews, state: user.state };
        } else {
          return {
            messsage: 'Escribe un número valido: 1, 2, o 3. Si prefieres hablar con un agente escribe "agente".',
            state: user.state,
          };
        }
      }

      if (user.state === ConversationState.products) {
        const productInfo = await this.getProductInfo(content);

        return {
          state: user.state,
          messsage: productInfo.message,
          image: productInfo.image,
        };
      }

      if (user.state === ConversationState.agent) {
        console.log('Un cliente te necesita');
        return { messsage: '', state: user.state };
      }

      if (user.state === ConversationState.chatgpt) {
        user.messages.push(newMessage);
        await user.save();
        const chatGpt = new ChatGpt(RolesSystem.vendedor);
        const formatedMessages = user.messages.map((message: any) => ({
          role: message.role,
          content: message.content,
        }));
        const response = await chatGpt.sendMessage(formatedMessages);
        if (response) {
          user.messages.push(response);
          await user.save();
        }
        return {
          messsage:
            response?.content +
            '\n\n_Si prefieres realizar tu compra por aquí, escribe "agente" y un miembro de nuestro equipo te atenderá._',
          state: user.state,
        };
      }
    } else {
      return await this.newConversation();
    }
  }

  async newConversation(phoneNumber?: string) {
    const newConversation = Conversation.build({
      name: 'Pepito',
      number: phoneNumber || this.number,
      messages: [],
      state: ConversationState.new,
    });
    await newConversation.save();

    return { messsage: Templates.welcomeMessage, state: newConversation.state };
  }

  private async getProductsList() {
    const products = await Product.find();

    let message = 'Estos son los productos que tenemos disponibles:\n\n';

    products.forEach((product, index) => {
      message += `${index + 1} - *${product.name}*\n`;
      message += `Precio: $${product.price}\n\n`;
    });

    message += 'Escoge un número para más información.';

    return { products, message };
  }

  private async getProductInfo(
    productIndex: string
  ): Promise<{ message: string; image: string }> {
    const products = await Product.find();

    //Comprobar que sea numero valido
    if (
      isNaN(Number(productIndex)) ||
      Number(productIndex) <= 0 ||
      Number(productIndex) > products.length
    ) {
      let message = 'Escribe un número de producto válido: ';
      products.forEach((product, index) => {
        if (index === products.length - 1) {
          message += `o ${index + 1}.`;
        } else {
          message += `${index + 1}, `;
        }
      });
      message += '\nPara para volver al menú principal escribe "menu".';
      return { message, image: '' };
    }

    const product = products[Number(productIndex) - 1];

    return { message: product.description, image: product.image };
  }
}
