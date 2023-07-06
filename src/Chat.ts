import { ChatCompletionRequestMessage } from 'openai';
import { ChatGpt } from './chatgpt';
import { User } from './model/user';
import { whatsappClient } from './Whatsapp';
import { RolesSystem } from './interfaces/roles';
import { Templates } from './interfaces/templates';
import { UserState } from './interfaces/states';
import { v1 } from './promps';

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
      if (diferenciaHoras >= 10) {
        user.messages = [];
        user.state = UserState.new;
        await user.save();
      } else {
        console.log('La última actualización fue hace menos de 10 horas');
      }

      if (content.includes('agente')) {
        user.state = UserState.agent;
        await user.save();
        return Templates.agentInit;
      }

      if (content.includes('bot')) {
        user.state = UserState.chatgpt;
        await user.save();
        return Templates.chatGptInit;
      }

      if (user.state === UserState.new) {
        if (content.includes('1')) {
          user.state = UserState.chatgpt;
          user.save();
          return Templates.chatGptInit;
        }
        if (content.includes('2')) {
          user.state = UserState.agent;
          user.save();
          return Templates.agentInit;
        }
      }

      if (user.state === UserState.agent) {
        console.log('Un cliente te necesita');
      }

      if (user.state === UserState.chatgpt) {
        user.messages.push(newMessage);
        const chatGpt = new ChatGpt(RolesSystem.vendedor, v1);
        const formatedMessages = user.messages.map((message) => ({
          role: message.role,
          content: message.content,
        }));
        const response = await chatGpt.sendMessage(formatedMessages);
        return response?.content;
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
