import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import { numberValidation } from '../utils/numberValidation';

class Whatsapp {
  public conexionStatus: boolean = false;
  private conexionLoading: boolean = false;
  private client: Client = new Client({
    puppeteer: {
      args: [
        // '--start-maximized',
        // '--disable-gpu',
        // '--disable-dev-shm-usage',
        // '--disable-setuid-sandbox',
        // '--no-first-run',
        '--no-sandbox',
        // '--no-zygote',
        // '--single-process',
      ],
    },
    authStrategy: new LocalAuth(),
  });

  start(): Promise<string | void> {
    return new Promise(async (resolve, reject) => {
      if (this.conexionStatus) {
        resolve();
      }

      this.client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
        resolve(qr);
      });

      this.client.on('ready', () => {
        this.conexionStatus = true;
        this.conexionLoading = false;
        console.log('Whatsapp is ready!');
        resolve();
      });

      this.client.on('auth_failure', () => {
        console.log('auth_failure');
        reject();
      });

      if (!this.conexionLoading && !this.conexionStatus) {
        console.log('Iniciando whats');
        this.conexionLoading = true;
        await this.client.initialize();
      }
      console.log('Se inicio whats');
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      const stopConnection = async () => {
        try {
          if (this.conexionStatus) {
            await this.client.destroy();
            this.conexionStatus = false;
            this.conexionLoading = false;
            console.log('WhatsApp closed!');
          }
          resolve();
        } catch (error) {
          reject('No se pudo cerra la sesion correctamente');
        }
      };
      setTimeout(stopConnection, 5000);
    });
  }

  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    if (!this.conexionStatus) {
      throw new Error('No hay conexion y no se puede enviar mensaje');
    }

    numberValidation(phoneNumber);

    await this.client.sendMessage(`521${phoneNumber}@c.us`, message);
    console.log(`Message sent to: ${phoneNumber}`);
  }

  async sendImage(phoneNumber: string, imageUrl: string): Promise<void> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const media = new MessageMedia('image/png', base64Image);

    await this.client.sendMessage(`521${phoneNumber}@c.us`, media);
    console.log(`Image sent to: ${phoneNumber}`);
  }

  disconnected() {
    this.client.on('disconnected', () => {
      this.conexionStatus = false;
      this.conexionLoading = false;
      console.log('WhatsApp disconnected!');
    });
  }

  listen(callback: (message: any) => void) {
    this.client.on('message', callback);
  }
}

export const whatsappClient = new Whatsapp();
