/* backend/services/houseybuddy/visualizer/render_stub.ts
   Tool-agnostic. Replace body with HeyGen/D-ID/etc. and keep signature. */

import fs from "fs/promises";
import path from "path";

type Args = {
  name: string;
  lifeStory: { index: string[]; chunksDir: string; approxWordCount: number; };
  outDir: string;
};

export async function renderAvatar(args: Args) {
  const p = path.join(args.outDir, "avatar.png");
  // placeholder image file (1x1 transparent)
  const png1x1 = Buffer.from(
    "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000100FFFF03000006000557BF9A0000000049454E44AE426082",
    "hex"
  );
  await fs.writeFile(p, png1x1);
  return {
    imagePath: p,
    style: "photoreal" as const
  };
}
