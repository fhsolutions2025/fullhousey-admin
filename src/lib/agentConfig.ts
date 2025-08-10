// src/lib/agentConfig.ts
type Json = any;

const cache = new Map<string, Promise<Json>>();

export function loadConfig(name: string): Promise<Json> {
  const url = `/agent-config/${name}.json`;
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { cache: "no-store" }).then(r => {
        if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
        return r.json();
      })
    );
  }
  return cache.get(url)!;
}

// Convenience helpers
export const AgentsRegistry  = () => loadConfig("agents.registry");
export const AgentPolicy     = () => loadConfig("agent.policy");
export const GTMSchema       = () => loadConfig("gtm.bridge.schema");
export const ObserversCfg    = () => loadConfig("observers.config");
export const SegMintProfiles = () => loadConfig("segmint.profiles");
export const ImpactRules     = () => loadConfig("impact.rules");
export const CCIPMap         = () => loadConfig("cc.ipmap");
export const SchedulerCfg    = () => loadConfig("scheduler");
export const BARCSettings    = () => loadConfig("barc.settings");
export const LudoShow        = () => loadConfig("shows.ludo");
export const AgentKPIs       = () => loadConfig("agent.kpis.schema");
