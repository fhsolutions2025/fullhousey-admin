
// File: src/pages/api/rgs/add.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { title, description, type } = req.body;
    const client = await clientPromise;
    const db = client.db('fullhousey');
    const result = await db.collection('rgs').insertOne({ title, description, type });
    res.status(200).json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add rule' });
  }
}
