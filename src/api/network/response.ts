import { Request, Response } from 'express';

const success = (
  res: Response,
  status: number,
  message: string,
  data?: any
) => {
  res.status(status).json({
    message,
    data,
  });
};

const error = (res: Response, status: number, message?: string, data?: any) => {
  let statusCode = status || 500;
  let statusMessage = message || 'Internal server error';

  res.status(statusCode).json({
    status: status,
    message: statusMessage,
    data,
  });
};

export default { success, error };
