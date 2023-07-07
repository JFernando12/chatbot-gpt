import { Message } from 'whatsapp-web.js';
import { whatsappClient } from './libs/Whatsapp';
import { Chat } from './chat/Chat';
import mongoose from 'mongoose';
import { MONGO_URI } from './config';
import { UserState } from './interfaces/states';

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

      // Se tendran hasta 2 intentos en caso de fallo.
      let i = 0;
      while (i < 2) {
        try {
          // Procesar el mensaje;
          const response = await chat.messageReceived(content);

          // Determinar si esta o no hablando con una persona real.
          if (response?.state !== UserState.agent && response?.messsage) {
            await whatsappClient.sendMessage(number, response.messsage);
          } else {
            await whatsappClient.sendMessage(
              '7551175038',
              `te estan hablando: ${number}`
            );
          }

          i = 2;
        } catch (error) {
          try {
            await whatsappClient.sendMessage(
              '7551175038',
              `ocurrio fallo: ${number}`
            );
          } catch (error) {
            console.log('Revisar fallo con whatsapp');
            console.error(error);
          }

          i++;
        }
      }
    } else {
      console.log('no te conozco');
    }
  });
};

main();
