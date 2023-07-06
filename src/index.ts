import { Message } from 'whatsapp-web.js';
import { whatsappClient } from './Whatsapp';
import { Chat } from './Chat';
import mongoose from 'mongoose';

const main = async () => {
  await mongoose.connect(
    'mongodb+srv://fernandocastrejonh:contrasena@cluster0.jx55njl.mongodb.net/chatbot'
  );
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
      }
      console.log('paso 3');
    } else {
      console.log('no te conozco');
    }
  });
};

main();
