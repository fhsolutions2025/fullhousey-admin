import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import Layout from "./Layout";
import AgentConsole from "./pages/AgentConsole";

// Inline light fallback components to avoid extra imports
function Splash() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>FullHousey Admin</h2>
      <p style={{ color: "#6b7280" }}>
        App is up. Visit <code>/agent-console</code> for the Agent Mode snapshot.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>404</h2>
      <p style={{ color: "#ef4444" }}>This route doesn’t exist.</p>
      <a href="/agent-console">Go to Agent Console</a>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
          <Routes>
            {/* Index — keep neutral. If you already have a Home route elsewhere, change this to Navigate to it. */}
            <Route index element={<Splash />} />

            {/* New: Agent Mode read-only config snapshot */}
            <Route path="/agent-console" element={<AgentConsole />} />

            {/* Optional: convenience redirects */}
            <Route path="/console" element={<Navigate to="/agent-console" replace />} />
            <Route path="/agents" element={<Navigate to="/agent-console" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
