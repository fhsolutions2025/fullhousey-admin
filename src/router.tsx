import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import Layout from "./layout";
import AgentConsole from "./pages/AgentConsole";
import Reports from "./pages/Reports";

// Minimal splash so the app renders even before other pages are ready
function Splash() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>FullHousey Admin</h2>
      <p style={{ color: "#6b7280" }}>
        App is up. Open <code>/agent-console</code> or <code>/reports</code>.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>404</h2>
      <p style={{ color: "#ef4444" }}>This route doesn’t exist.</p>
      <a href="/reports">Go to Reports</a>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
          <Routes>
            {/* Home — change to Navigate to "/reports" if you want reports as the landing page */}
            <Route index element={<Splash />} />

            {/* Agent Mode read-only config snapshot */}
            <Route path="/agent-console" element={<AgentConsole />} />

            {/* Reports vault (daily snapshots) */}
            <Route path="/reports" element={<Reports />} />

            {/* Convenience redirects */}
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
