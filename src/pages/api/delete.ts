// File: src/pages/api/rgs/delete.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();

  try {
    const { id } = req.query;
    const client = await clientPromise;
    const db = client.db('fullhousey');
    await db.collection('rgs').deleteOne({ _id: new ObjectId(id as string) });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
}