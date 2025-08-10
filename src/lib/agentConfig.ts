export const loadConfig = (name: string) =>
  fetch(`/agent-config/${name}.json`).then(r => r.json());

export const AgentsRegistry = () => loadConfig('agents.registry');
export const AgentPolicy    = () => loadConfig('agent.policy');
export const GTMSchema      = () => loadConfig('gtm.bridge.schema');
export const ObserversCfg   = () => loadConfig('observers.config');
export const SegMintProfiles= () => loadConfig('segmint.profiles');
export const ImpactRules    = () => loadConfig('impact.rules');
export const CCIPMap        = () => loadConfig('cc.ipmap');
export const SchedulerCfg   = () => loadConfig('scheduler');
export const BARCSettings   = () => loadConfig('barc.settings');
export const LudoShow       = () => loadConfig('shows.ludo');
export const AgentKPIs      = () => loadConfig('agent.kpis.schema');
