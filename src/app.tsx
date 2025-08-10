import { Suspense } from "react";
import AppRouter from "./router";

/** Thin app wrapper. Router mounts Layout and all routes. */
export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: "#9CA3AF" }}>Loading…</div>}>
      <AppRouter />
    </Suspense>
  );
}
