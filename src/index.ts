import { Message } from 'whatsapp-web.js';
import { whatsappClient } from './libs/Whatsapp';
import { Chat } from './chat/Chat';
import mongoose from 'mongoose';
import { MONGO_URI } from './config';
import { UserState } from './interfaces/states';
import { app } from './app';

mongoose.connect(MONGO_URI!).then(() => {
  console.log('DB connected');
});

app.listen(3000, () => {
  console.log('Server on port 3000');
});

whatsappClient.disconnected();

whatsappClient.listen(async (message: Message) => {
  const number = message.from.slice(3, 13);
  console.log('number', number);
  if (!isNaN(Number(number))) {
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
        } else if (response?.messsage) {
          await whatsappClient.sendMessage(number, response.messsage);
          await whatsappClient.sendMessage(
            '7551175038',
            `te estan hablando: ${number}`
          );
        } else {
          await whatsappClient.sendMessage(
            '7551175038',
            `te estan hablando: ${number}`
          );
        }

        i = 2;
      } catch (error) {
        console.log(error);
        try {
          await whatsappClient.sendMessage(
            '7551175038',
            `ocurrio fallo: ${number}`
          );
          await whatsappClient.sendMessage(
            '7551155510',
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
    console.log('No es un numero valido');
  }
});
