// src/pages/api/rgs/eval.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'RGS eval simulation placeholder' });
}
