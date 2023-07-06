import { ChatCompletionRequestMessage } from 'openai';
import { ChatGpt } from '../libs/Chatgpt';
import { User } from '../model/user';
import { RolesSystem } from '../interfaces/roles';
import { Templates } from '../interfaces/templates';
import { UserState } from '../interfaces/states';

export class Chat {
  number: string;

  constructor(number: string) {
    this.number = number;
  }

  async messageReceived(content: string) {
    const newMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content,
    };
    const users = await User.find({ number: this.number });
    const user = users[0];

    if (user) {
      const ultimaActualizacion = user.updatedAt;

      // Calcular la diferencia de tiempo entre la última actualización y el momento actual
      const diferenciaTiempo = Date.now() - ultimaActualizacion;
      const diferenciaHoras = Math.floor(diferenciaTiempo / (1000 * 60 * 60));
      const diferenciaSegundos = Math.floor(diferenciaTiempo / 10000);

      console.log('diferenciaHoras: ', diferenciaHoras);
      console.log('diferenciaSegundos: ', diferenciaSegundos);

      if (diferenciaSegundos >= 20) {
        user.messages = [];
        user.state = UserState.new;
        await user.save();
        return Templates.welcomeMessage;
      }

      if (content.toLocaleLowerCase().includes('agente')) {
        user.state = UserState.agent;
        await user.save();
        return;
      }

      if (content.toLocaleLowerCase().includes('lucy')) {
        user.messages = [];
        user.state = UserState.new;
        await user.save();
        return Templates.welcomeMessage;
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
          return response?.content;
        } else if (content.includes('2')) {
          user.state = UserState.agent;
          await user.save();
          return Templates.agentInit;
        } else if (content.includes('3')) {
          user.state = UserState.agent;
          await user.save();
          return Templates.agentInit;
        } else {
          return 'Escribe el numero que desees: 1, 2 o 3';
        }
      }

      if (user.state === UserState.agent) {
        console.log('Un cliente te necesita');
        return;
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
        return (
          response?.content +
          '\n\n_Recuerda que si prefieres realizar tu compra por aquí, escribe "agente" y un miembro de nuestro equipo te atenderá._'
        );
      }
    } else {
      return await this.newUser();
    }
  }

  private async newUser() {
    const newUser = User.build({
      date: new Date(),
      name: 'pepito',
      number: this.number,
      messages: [],
      state: UserState.new,
    });
    await newUser.save();

    return Templates.welcomeMessage;
  }
}
