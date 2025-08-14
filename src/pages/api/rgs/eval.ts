// src/pages/api/rgs/eval.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple test response
  res.status(200).json({
    status: 'success',
    message: 'RGS eval API is working',
    timestamp: new Date().toISOString(),
  });
}
