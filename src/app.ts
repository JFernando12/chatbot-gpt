import express from 'express';
import morgan from 'morgan';
import { whatsappRouter } from './api/routes/whatsappRouter';
import cors from 'cors';

const app = express();

// Settings
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors({ credentials: true, origin: 'https://app.thedreamgiftmx.com' }));

// Routes
app.use('/whatsapp', whatsappRouter);

export { app };
