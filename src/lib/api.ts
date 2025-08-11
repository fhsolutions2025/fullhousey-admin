/* src/lib/api.ts */
export type CreateBuddyResponse = {
  id: string;
  status: "CREATED" | "RUNNING" | "DONE" | "FAILED" | "DELETED";
  profile?: any | null;
};

const BASE = import.meta.env.VITE_API_BASE || "";

export async function hbCreate(audioFile: File, nameHint?: string): Promise<CreateBuddyResponse> {
  const fd = new FormData();
  fd.append("audio", audioFile);
  if (nameHint) fd.append("nameHint", nameHint);
  const r = await fetch(`${BASE}/api/houseybuddy/create`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`hbCreate failed: ${r.status}`);
  return r.json();
}

export async function hbStatus(id: string) {
  const r = await fetch(`${BASE}/api/houseybuddy/${id}/status`);
  if (!r.ok) throw new Error(`hbStatus failed: ${r.status}`);
  return r.json();
}

export async function hbProfile(id: string) {
  const r = await fetch(`${BASE}/api/houseybuddy/${id}/profile`);
  if (!r.ok) throw new Error(`hbProfile failed: ${r.status}`);
  return r.json();
}
