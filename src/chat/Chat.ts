import { ChatCompletionRequestMessage } from 'openai';
import { ChatGpt } from '../libs/Chatgpt';
import { User } from '../model/user';
import { RolesSystem } from '../interfaces/roles';
import { Templates } from '../interfaces/templates';
import { UserState } from '../interfaces/states';
import moment = require('moment-timezone');
import { Product } from '../model/product';

moment.tz.setDefault('America/Mexico_City');

export class Chat {
  number: string;

  constructor(number: string) {
    this.number = number;
  }

  async messageReceived(
    content: string
  ): Promise<{ messsage: string | undefined; state: UserState } | undefined> {
    const newMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content,
    };
    const users = await User.find({ number: this.number });
    const user = users[0];

    if (user) {
      const ultimaActualizacion = user.updatedAt;

      // Calcular la diferencia de tiempo entre la última actualización y el momento actual
      const hoursDiferrence = moment(moment().toDate()).diff(
        ultimaActualizacion,
        'hours'
      );
      console.log('hoursDiference: ', hoursDiferrence);

      if (hoursDiferrence >= 24 && user.state !== UserState.new) {
        user.messages = [];
        user.state = UserState.new;
        await user.save();
        return { messsage: Templates.welcomeMessage, state: user.state };
      }

      if (content.toLocaleLowerCase().includes('agente')) {
        user.state = UserState.agent;
        await user.save();
        return { messsage: Templates.agentInit, state: user.state };
      }

      if (content.toLocaleLowerCase().includes('lucy')) {
        user.messages = [];
        user.state = UserState.new;
        await user.save();
        return { messsage: Templates.welcomeMessage, state: user.state };
      }

      if (user.state === UserState.new) {
        if (content.includes('1')) {
          user.state = UserState.chatgpt;
          user.messages.push({
            role: 'user',
            content:
              'Quiero que enlistes los nombre de los productos y precios e invitame a seleccionar uno para más informacion',
          });
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
          return { messsage: response?.content, state: user.state };
        } else if (content.includes('2')) {
          user.state = UserState.agent;
          await user.save();
          return { messsage: Templates.agentInit, state: user.state };
        } else if (content.includes('3')) {
          user.state = UserState.agent;
          await user.save();
          return { messsage: Templates.agentInit, state: user.state };
        } else {
          return {
            messsage: 'Escribe un número valido: 1, 2',
            state: user.state,
          };
        }
      }

      if (user.state === UserState.agent) {
        console.log('Un cliente te necesita');
        return { messsage: '', state: user.state };
      }

      if (user.state === UserState.chatgpt) {
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
      return await this.newUser();
    }
  }

  private async newUser() {
    const newUser = User.build({
      name: 'Pepito',
      number: this.number,
      messages: [],
      state: UserState.new,
    });
    await newUser.save();

    return { messsage: Templates.welcomeMessage, state: newUser.state };
  }

  private async getProductsList() {
    const products = await Product.find();

    let message = 'Estos son los productos que tenemos disponibles:\n\n';

    products.forEach((product, index) => {
      message += `${index + 1} - *${product.name}*\n`;
      message += `Precio: $${product.price}\n\n`;
    });

    message += 'Escoge un número para más información';

    return { products, message};
  }

  private async getProductInfo(products: any[], productIndex: string) {
    const product = products[parseInt(productIndex) - 1];

    return product.description;
  }
}
