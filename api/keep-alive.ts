import { Request, Response } from 'express';

/**
 * Keep-alive endpoint to prevent Vercel serverless function cold starts
 * This is called automatically by a cron job defined in vercel.json
 */
export default function handler(req: Request, res: Response) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      message: 'Keep-alive ping successful - function is warm'
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    res.status(500).json({ 
      error: 'Keep-alive failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
