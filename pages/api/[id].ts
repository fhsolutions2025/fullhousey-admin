import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Rgs from "@/models/Rgs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Only DELETE method is allowed" });
  }

  try {
    const deletedEntry = await Rgs.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ success: false, message: "RGS entry not found" });
    }

    return res.status(200).json({ success: true, message: "RGS entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting RGS entry:", error);
    return res.status(500).json({ success: false, message: "Server error while deleting RGS entry" });
  }
}
