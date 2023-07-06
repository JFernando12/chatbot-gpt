import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { v1 } from './promps';
import { OPENAI_API_KEY } from './config';
import { RolesSystem } from './interfaces/roles';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export class ChatGpt {
  model: string = 'gpt-3.5-turbo';
  temperature: number = 0.2;
  messages: ChatCompletionRequestMessage[] = [];

  constructor(roleSystem: RolesSystem, promp: string) {
    this.messages.push({
      role: 'system',
      content: roleSystem,
    });
    // this.messages.push({
    //   role: 'user',
    //   content: promp,
    // });
  }

  async sendMessage(
    messages: ChatCompletionRequestMessage[]
  ): Promise<ChatCompletionRequestMessage | undefined> {
    this.messages = this.messages.concat(messages);
    console.log('messageToChatGpt: ', this.messages);

    const completion = await openai.createChatCompletion({
      model: this.model,
      messages: this.messages,
      temperature: this.temperature,
    });

    return completion.data.choices[0].message;
  }
}
