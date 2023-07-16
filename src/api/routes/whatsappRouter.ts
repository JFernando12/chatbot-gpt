import express, { Request, Response } from 'express';
const router = express.Router();

import { whatsappClient } from '../../libs/Whatsapp';
import response from '../network/response';
import { Chat } from '../../chat/Chat';

router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = whatsappClient.conexionStatus;
    response.success(res, 200, 'Procesado exitosamente', status);
  } catch (error) {
    response.error(res, 500, 'No se pudo procesar la solicitud');
  }
});

router.post('/stop', async (req: Request, res: Response) => {
  try {
    await whatsappClient.stop();
    response.success(res, 200, 'Detenido correctamente');
  } catch (error) {
    response.error(res, 500, 'No se pudo procesar la solicitud');
  }
});

router.post('/start', async (req: Request, res: Response) => {
  try {
    const qr = await whatsappClient.start();

    response.success(res, 200, 'Procesado exitosamente', qr);
  } catch (error) {
    response.error(res, 500, 'No se pudo procesar la solicitud');
  }
});

router.post('/first-message', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const chat = new Chat(phone);
    const data = await chat.newConversation();
    await whatsappClient.sendMessage(phone, data.messsage);
    response.success(res, 200, 'Procesado exitosamente');
  } catch (error) {
    console.log(error);
    response.error(res, 500, 'No se pudo crear la conversacion');
  }
});

export { router as whatsappRouter };
