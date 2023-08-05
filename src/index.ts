import { Message } from 'whatsapp-web.js';
import { whatsappClient } from './libs/Whatsapp';
import { Chat } from './chat/Chat';
import mongoose from 'mongoose';
import { ENV, MONGO_URI, NUMBER_TEST, PORT } from './config';
import { ConversationState } from './interfaces/states';
import { app } from './app';
import cron from 'node-cron';
import { Conversation } from './model/conversation';
import moment = require('moment-timezone');

mongoose.connect(MONGO_URI!).then(() => {
  console.log('DB connected');
});

app.listen(PORT, () => {
  console.log('Server on port', PORT);
});

whatsappClient.disconnected();

whatsappClient.start();

whatsappClient.listen(async (message: Message) => {
  const number = message.from.slice(3, 13);
  console.log('number', number);

  if (ENV == 'development' && number !== NUMBER_TEST) {
    console.log('Development mode');
    return;
  }

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
        if (response?.state !== ConversationState.agent && response?.messsage) {
          if (response?.image) {
            await whatsappClient.sendImage(number, response.image);
          }
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

cron.schedule('* * * * *', async() => {
  try {
    // Obtiene la fecha actual menos 2 días usando moment-timezone
    const dosDiasAtras = moment().subtract(2, 'days').toDate();

    // Realiza la consulta usando Mongoose
    const usersToOffer = await Conversation.find({
      state: ConversationState.products, // state: operador para comparar que "state" sea igual a "products"
      offer: { $ne: 1 }, // $ne: operador para comparar que "offer" sea diferente de 1
      updatedAt: { $gte: dosDiasAtras }, // $gte: operador para comparar que "updatedAt" sea mayor o igual a la fecha de dos días atrás
    });

    console.log('usersToOffer', usersToOffer);

    // Recorre los usuarios que no han recibido la oferta
    // for (const user of usersToOffer) {
    //   // Envía la oferta
    //   await whatsappClient.sendMessage(user.number, `¿No te convenciste?🤭, que tal si te ofrezco un 20% de descuento en tu primera compra.
    //   Quedando a solo $498 la Lámpara Personalizada! con envío gratis hasta tu domicilio.🎁
      
    //   Si te interesa, solo escribe "agente" y te atenderé personalmente 🙌🏼`);

    //   // Actualiza el estado del usuario
    //   user.offer = 1;
    //   await user.save();
    // }
  } catch (error) {
    console.log(error);
  }
});
