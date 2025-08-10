import React, { useEffect, useRef, useState } from "react";

/**
 * FullToss — timing/skill mini:
 * - A sweep bar moves left↔right; press TOSS to lock your landing X.
 * - Targets (1x / 2x / 5x) slide horizontally; hit = score base*mult.
 * - Ball animates along an arc to the locked position.
 * - 10 tosses per session; tracks score + streak + best streak.
 * Front-end only (no API). Safe to drop in today.
 */

type Target = {
  id: string;
  mult: number;
  width: number;    // normalized (0..1) fraction of field width
  x: number;        // normalized center (0..1)
  vx: number;       // normalized units per second
  color: string;
};

export default function FullToss() {
  // Game state
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(10);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastWin, setLastWin] = useState<{ mult: number; pts: number } | null>(null);
  const [msg, setMsg] = useState("");

  // Motion refs
  const animRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sweep bar (player timing cursor)
  const [sweep, setSweep] = useState(0);   // 0..1
  const sweepDirRef = useRef<1 | -1>(1);

  // Targets
  const [targets, setTargets] = useState<Target[]>(() => [
    { id: "t1", mult: 1, width: 0.20, x: 0.25, vx: 0.12, color: "#e5e7eb" },
    { id: "t2", mult: 2, width: 0.14, x: 0.55, vx: -0.18, color: "#93c5fd" },
    { id: "t5", mult: 5, width: 0.08, x: 0.78, vx: 0.25, color: "#fde68a" },
  ]);

  // Ball animation
  const ballRef = useRef<HTMLDivElement | null>(null);
  const isFlyingRef = useRef(false);

  // Dimensions
  const W = 760;  // logical width
  const H = 340;  // logical height
  const GROUND_Y = H - 36;

  // ---------- main animation loop ----------
  useEffect(() => {
    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;

      // Sweep bar moves left↔right
      setSweep(prev => {
        let next = prev + (sweepDirRef.current * dt * 0.65); // speed
        if (next > 1) { next = 1; sweepDirRef.current = -1; }
        if (next < 0) { next = 0; sweepDirRef.current = 1; }
        return next;
      });

      // Targets bounce off edges
      setTargets(prev => {
        return prev.map(t => {
          let x = t.x + t.vx * dt;
          let vx = t.vx;
          const halfW = t.width / 2;
          if (x < halfW) { x = halfW; vx = Math.abs(vx); }
          if (x > 1 - halfW) { x = 1 - halfW; vx = -Math.abs(vx); }
          return { ...t, x, vx };
        });
      });

      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // ---------- helpers ----------
  const px = (n: number) => Math.round(n); // integer px for crispness
  const toX = (n01: number) => px(n01 * W);
  const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

  const reset = () => {
    setScore(0); setBalls(10); setStreak(0); setBestStreak(0);
    setLastWin(null); setMsg("");
  };

  // Toss action
  const toss = async () => {
    if (balls <= 0) { setMsg("Out of tosses. Press Reset."); return; }
    if (isFlyingRef.current) return;

    setMsg("");
    const lockX01 = sweep; // lock landing X at current sweep position
    setBalls(b => b - 1);

    // Animate the ball along a simple arc (0..1 over 800ms)
    const duration = 800;
    const start = performance.now();
    const startX = toX(0.06);
    const endX = toX(clamp01(lockX01));
    const apex = 140; // arc height

    isFlyingRef.current = true;

    await new Promise<void>((resolve) => {
      const fly = () => {
        const t = (performance.now() - start) / duration;
        const u = t < 0 ? 0 : t > 1 ? 1 : t;
        const x = startX + (endX - startX) * u;
        // parabola: y = ground - apex * 4*u*(1-u)
        const y = GROUND_Y - apex * (4 * u * (1 - u));
        if (ballRef.current) {
          ballRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
        if (u < 1) {
          requestAnimationFrame(fly);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(fly);
    });

    // Hit detection — check if landing X intersects a target's [left,right]
    const hit = (() => {
      for (const t of targets) {
        const left = t.x - t.width / 2;
        const right = t.x + t.width / 2;
        if (lockX01 >= left && lockX01 <= right) return t;
      }
      return null;
    })();

    if (hit) {
      const base = 10;
      const pts = base * hit.mult;
      setScore(s => s + pts);
      setStreak(s => {
        const next = s + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      setLastWin({ mult: hit.mult, pts });
      setMsg(hit.mult >= 5 ? "Jackpot toss! 🔥" : "Nice hit!");
    } else {
      setStreak(0);
      setLastWin(null);
      setMsg("Missed. Keep the rhythm.");
    }

    // Snap ball to ground at landing X
    if (ballRef.current) {
      ballRef.current.style.transform = `translate(${endX}px, ${GROUND_Y}px)`;
    }

    isFlyingRef.current = false;
  };

  // Make sure ball is at the start position initially
  useEffect(() => {
    if (ballRef.current) {
      ballRef.current.style.transform = `translate(${toX(0.06)}px, ${GROUND_Y}px)`;
    }
  }, []);

  // Layout helpers
  const trackStyle: React.CSSProperties = {
    position: "relative", width: W, height: H, borderRadius: 16, overflow: "hidden",
    background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
  };
  const groundStyle: React.CSSProperties = {
    position: "absolute", left: 0, top: GROUND_Y, width: "100%", height: H - GROUND_Y,
    background: "linear-gradient(180deg, #064e3b, #065f46)", borderTop: "2px solid #10b981"
  };
  const sweepStyle: React.CSSProperties = {
    position: "absolute", left: toX(sweep), top: GROUND_Y - 6, width: 2, height: 120,
    background: "rgba(59,130,246,0.9)", boxShadow: "0 0 10px rgba(59,130,246,0.7)"
  };
  const ballStyle: React.CSSProperties = {
    position: "absolute", width: 16, height: 16, borderRadius: 9999,
    background: "radial-gradient(circle at 30% 30%, #ffffff, #e5e7eb)", transform: "translate(0,0)"
  };

  return (
    <div className="grid cols-2">
      {/* LEFT: Arena */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>MotaBhai — FullToss</h2>
          <div style={{display:"flex",gap:8}}>
            <button className="btn" onClick={reset}>Reset</button>
          </div>
        </div>
        <div className="muted" style={{marginTop:4, fontSize:12}}>
          Time your toss when high-multiplier bins slide under the sweep line. 10 tosses per game.
        </div>

        <div ref={containerRef} style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          <div style={trackStyle}>
            {/* Targets */}
            {targets.map(t => {
              const left = toX(t.x - t.width / 2);
              const width = px(t.width * W);
              return (
                <div key={t.id}
                     style={{
                       position: "absolute", left, top: GROUND_Y - 30, width, height: 30,
                       background: t.color, display:"flex", alignItems:"center", justifyContent:"center",
                       borderRadius: 8, boxShadow:"0 6px 16px rgba(0,0,0,0.25)", border: "1px solid rgba(0,0,0,0.2)"
                     }}>
                  <span style={{fontWeight:700}}>×{t.mult}</span>
                </div>
              );
            })}

            {/* Sweep cursor */}
            <div style={sweepStyle} />

            {/* Ball */}
            <div ref={ballRef} style={ballStyle} />
            {/* Ground */}
            <div style={groundStyle} />
          </div>
        </div>

        <div style={{display:"flex", gap:8, alignItems:"center", marginTop: 12, flexWrap:"wrap"}}>
          <button className="btn primary" onClick={toss} disabled={balls<=0}>TOSS</button>
          <div className="card"><div className="muted" style={{fontSize:12}}>Score</div><div style={{fontSize:22, fontWeight:700}}>{score}</div></div>
          <div className="card"><div className="muted" style={{fontSize:12}}>Tosses Left</div><div style={{fontSize:22, fontWeight:700}}>{balls}</div></div>
          <div className="card"><div className="muted" style={{fontSize:12}}>Streak</div><div style={{fontSize:22, fontWeight:700}}>{streak}</div></div>
          <div className="card"><div className="muted" style={{fontSize:12}}>Best</div><div style={{fontSize:22, fontWeight:700}}>{bestStreak}</div></div>
          {lastWin && <div className="muted">Last: ×{lastWin.mult} → +{lastWin.pts}</div>}
          {msg && <div className="muted" style={{color: msg.includes("Jackpot") ? "#f59e0b" : "#10b981"}}>{msg}</div>}
        </div>
      </div>

      {/* RIGHT: Rules & Tips */}
      <div className="card">
        <h3>Rules</h3>
        <ul className="muted" style={{marginTop:8}}>
          <li>Press <strong>TOSS</strong> to lock the sweep position.</li>
          <li>Ball flies to that X; if a multiplier bin overlaps, you score.</li>
          <li>Bins bounce across the field; higher multipliers are narrower/faster.</li>
          <li>10 tosses per session. Reset to play again.</li>
        </ul>
      </div>

      <div className="card">
        <h3>Pro Tips</h3>
        <ul className="muted" style={{marginTop:8}}>
          <li>Watch the rhythm; toss just before a fast bin reaches the sweep.</li>
          <li>Chase ×5 only if you’re in sync; ×2 is safer to build streaks.</li>
        </ul>
      </div>
    </div>
  );
}
