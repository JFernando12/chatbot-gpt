import { Message } from 'whatsapp-web.js';
import { whatsappClient } from './libs/Whatsapp';
import { Chat } from './chat/Chat';
import mongoose from 'mongoose';
import { MONGO_URI } from './config';

const main = async () => {
  await mongoose.connect(MONGO_URI!);
  await whatsappClient.start();

  whatsappClient.listen(async (message: Message) => {
    const number = message.from.slice(3, 13);
    console.log('number', number);

    if (message.from === '5217551163938@c.us') {
      const content = message.body;

      // Create new chat.
      const chat = new Chat(number);

      // Procesar el mensaje;
      const response = await chat.messageReceived(content);
      console.log('paso 2');

      if (response) {
        await whatsappClient.sendMessage(number, response);
      } else {
        await whatsappClient.sendMessage(
          '7551175038',
          `te estan hablando: ${number}`
        );
      }
      console.log('paso 3');
    } else {
      console.log('no te conozco');
    }
  });
};

main();
