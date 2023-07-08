import express, { Request, Response } from 'express';
const router = express.Router();

import { whatsappClient } from '../../libs/Whatsapp';
import response from '../network/response';

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
    const data: { qr: string | null } = {
      qr: null,
    };
    const qr = await whatsappClient.start();

    if (qr) {
      data.qr = qr;
    }
    response.success(res, 200, 'Procesado exitosamente', data);
  } catch (error) {
    response.error(res, 500, 'No se pudo procesar la solicitud');
  }
});

export { router as whatsappRouter };
