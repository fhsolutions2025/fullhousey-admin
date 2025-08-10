// src/pages/AgentConsole.tsx
import { useEffect, useState } from "react";
import {
  AgentsRegistry, AgentPolicy, GTMSchema, ObserversCfg, SegMintProfiles,
  ImpactRules, CCIPMap, SchedulerCfg, BARCSettings, LudoShow, AgentKPIs
} from "../lib/agentConfig";

type LoadItem = { name: string; loader: () => Promise<any> };

const ITEMS: LoadItem[] = [
  { name: "agents.registry", loader: AgentsRegistry },
  { name: "agent.policy", loader: AgentPolicy },
  { name: "gtm.bridge.schema", loader: GTMSchema },
  { name: "observers.config", loader: ObserversCfg },
  { name: "segmint.profiles", loader: SegMintProfiles },
  { name: "impact.rules", loader: ImpactRules },
  { name: "cc.ipmap", loader: CCIPMap },
  { name: "scheduler", loader: SchedulerCfg },
  { name: "barc.settings", loader: BARCSettings },
  { name: "shows.ludo", loader: LudoShow },
  { name: "agent.kpis.schema", loader: AgentKPIs }
];

export default function AgentConsole() {
  const [data, setData] = useState<Record<string, any>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const entries = await Promise.all(
          ITEMS.map(async (it) => [it.name, await it.loader()] as const)
        );
        setData(Object.fromEntries(entries));
      } catch (e: any) {
        setErr(e?.message || "Failed to load one or more configs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const Card = ({ title, body }: { title: string; body: any }) => (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
        <span title="loaded" style={{ fontSize: 12 }}>✅</span>
      </div>
      <pre style={{
        background: "#0b1220",
        color: "#d1e3ff",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        overflowX: "auto",
        fontSize: 12
      }}>{JSON.stringify(body, null, 2)}</pre>
    </div>
  );

  return (
    <div style={{ maxWidth: 1040, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Agent Console — Config Snapshot</h1>
      <p style={{ color: "#6b7280", marginTop: 0 }}>
        Read-only view of the 11 Agent Mode configs served from <code>/public/agent-config/</code>.
      </p>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "#ef4444" }}>{err}</p>}

      {!loading && !err && (
        <>
          {Object.entries(data).map(([k, v]) => (
            <Card key={k} title={k} body={v} />
          ))}
        </>
      )}
    </div>
  );
}
