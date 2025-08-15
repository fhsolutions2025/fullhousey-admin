import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Rgs from "@/models/Rgs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Only GET allowed" });
  }

  try {
    const rgsList = await Rgs.find().sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: rgsList });
  } catch (error) {
    console.error("RGS fetch error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
