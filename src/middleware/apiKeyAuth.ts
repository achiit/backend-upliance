import { Request, Response, NextFunction } from 'express';

export const apiKeyAuth = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid API key'
    });
    return;
  }
  
  next();
};

export default apiKeyAuth;