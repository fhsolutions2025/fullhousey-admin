import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Rgs from "@/models/Rgs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  try {
    const {
      game,
      region,
      payoutType,
      rtp,
      showId,
      bonusType,
      lastUpdatedBy,
      reason,
    } = req.body;

    const rgs = await Rgs.create({
      game,
      region,
      payoutType,
      rtp,
      showId,
      bonusType,
      lastUpdatedBy,
      reason,
    });

    res.status(201).json({ success: true, data: rgs });
  } catch (error) {
    console.error("RGS insert error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
