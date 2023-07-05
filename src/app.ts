import express, { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
  const { message } = req.query;
  
  res.send('Hello World!');
}
);


export { app }