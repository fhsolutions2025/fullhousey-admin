/* backend/services/houseybuddy/voice/extract_stub.ts
   Stub: replace with real DSP extraction. */
export async function extractVoiceTraits(audioPath: string, transcript: string) {
  return {
    pitch: 0.55,         // 0..1
    pace: 0.48,          // 0..1
    brightness: 0.52,    // 0..1 (proxy for MFCC brightness)
    accentHint: undefined,
    sentimentBaseline: "warm" as const,
  };
}
