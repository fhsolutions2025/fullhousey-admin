/* src/pages/HouseyBuddy.tsx */
import { useState } from "react";
import { hbCreate, hbProfile } from "../lib/api";

export default function HouseyBuddy() {
  const [audio, setAudio] = useState<File | null>(null);
  const [nameHint, setNameHint] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const push = (s: string) => setLog((prev) => [...prev, s]);

  async function handleCreate() {
    if (!audio) { alert("Select an audio file"); return; }
    setBusy(true);
    setProfile(null);
    setLog([]);
    try {
      push("Uploading audio…");
      const resp = await hbCreate(audio, nameHint || undefined);
      push(`Job ${resp.id} status: ${resp.status}`);
      if (resp.status === "DONE" && resp.profile) {
        setProfile(resp.profile);
        push("Profile ready.");
      } else {
        // For v0.1 we run synchronously; if not done, try fetching profile once
        try {
          const p = await hbProfile(resp.id);
          setProfile(p);
          push("Profile fetched.");
        } catch {
          push("Profile not ready.");
        }
      }
    } catch (e: any) {
      push("Error: " + (e?.message || String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">HouseyBuddy v0.1</h1>
      <div className="grid gap-3">
        <label className="block">
          <span className="text-sm">Audio (name sample, 3–10s)</span>
          <input type="file" accept="audio/*" className="block mt-1"
                 onChange={(e) => setAudio(e.target.files?.[0] ?? null)} />
        </label>
        <label className="block">
          <span className="text-sm">Name hint (optional)</span>
          <input value={nameHint} onChange={(e) => setNameHint(e.target.value)}
                 className="border rounded px-3 py-2 w-full" placeholder="e.g., Veer Shergill"/>
        </label>
        <button onClick={handleCreate}
                disabled={busy || !audio}
                className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {busy ? "Working…" : "Create HouseyBuddy"}
        </button>
      </div>

      <div className="mt-4">
        <h2 className="font-medium">Log</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
{log.join("\n")}
        </pre>
      </div>

      {profile && (
        <div className="mt-4 space-y-2">
          <h2 className="font-medium">Profile</h2>
          <div className="text-sm">
            <div><b>ID:</b> {profile.id}</div>
            <div><b>Name:</b> {profile.name}</div>
            <div><b>Voice:</b> pitch {profile.voiceTraits?.pitch}, pace {profile.voiceTraits?.pace}, brightness {profile.voiceTraits?.brightness}</div>
            <div><b>Runtime Memory:</b> {profile.runtime?.memoryPolicy}</div>
            <div><b>Guardrails:</b> {(profile.runtime?.guardrails || []).join(", ")}</div>
          </div>
        </div>
      )}
    </div>
  );
}
