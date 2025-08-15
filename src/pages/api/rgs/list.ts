// File: src/pages/api/rgs/list.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const client = await clientPromise;
    const db = client.db('fullhousey');
    const rules = await db.collection('rgs').find({}).toArray();
    res.status(200).json(rules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
}
