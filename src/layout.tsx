import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";

/** ---- Design tokens (keep in sync with images) ---- */
const COLORS = {
  ink: "#0B1220",
  text: "#E5E7EB",
  sub: "#C6F6EA",
  border: "#1F2937",
};
const MAX_W = 1180;

/** Small helper to ensure/update a <meta> tag */
function ensureMeta(name: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  return el;
}

/** Load SEO meta once and apply on route change */
function useSEO() {
  const { pathname } = useLocation();
  const cache = useRef<Record<string, { title?: string; description?: string; robots?: string }> | null>(null);

  // prime cache
  useEffect(() => {
    if (cache.current) return;
    fetch("/seo/meta.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { pages: {} }))
      .then((j) => (cache.current = j?.pages || {}))
      .catch(() => (cache.current = {}));
  }, []);

  // apply for current route
  useEffect(() => {
    const meta = cache.current;
    if (!meta) return;

    const pick =
      meta[pathname] ||
      meta[pathname.replace(/\/+$/, "")] || // trim trailing slash
      meta["/"] ||
      {};

    if (pick.title) document.title = pick.title;
    if (pick.description) ensureMeta("description").setAttribute("content", pick.description);
    ensureMeta("robots").setAttribute("content", pick.robots || "noindex,nofollow");

    // OG/Twitter (use sensible defaults)
    ensureMeta("og:title", "property").setAttribute("content", pick.title || "FullHousey Admin");
    ensureMeta("og:description", "property").setAttribute("content", pick.description || "Admin console");
    const ogImage =
      pathname.startsWith("/cc") || pathname === "/"
        ? "/og/og-admin.png"
        : "/og/og-default.png";
    ensureMeta("og:image", "property").setAttribute("content", ogImage);
    ensureMeta("twitter:card", "name").setAttribute("content", "summary_large_image");
    ensureMeta("twitter:image", "name").setAttribute("content", ogImage);
  }, [pathname]);
}

/** Mobile breakpoint hook */
function useIsSmall(breakpoint = 768) {
  const [small, setSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onR = () => setSmall(window.innerWidth < breakpoint);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, [breakpoint]);
  return small;
}

export default function Layout({ children }: PropsWithChildren) {
  useSEO();
  const { pathname } = useLocation();
  const isMobile = useIsSmall();

  // Choose banner by route
  const banner = useMemo(() => {
    const suffix = isMobile ? "mobile" : "desktop";
    const pick = (key: string) => `/img/${key}-${suffix}.webp`; // images live flat under /img
    if (pathname.startsWith("/reports"))
      return { src: pick("banner-reports-vault"), alt: "Reports Vault" };
    if (pathname.startsWith("/cc"))
      return { src: pick("banner-cc-cockpit"), alt: "Command Center" };
    if (pathname.startsWith("/agent-console"))
      return { src: pick("banner-app-hero"), alt: "Agent Console" };
    if (pathname.startsWith("/hod"))
      return { src: pick("banner-hod-generic"), alt: "HOD Console" };
    return { src: pick("banner-app-hero"), alt: "FullHousey Admin" };
  }, [pathname, isMobile]);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.ink }}>
      {/* Skip link for a11y */}
      <a
        href="#main"
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
        }}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, {
            left: "12px",
            top: "12px",
            background: "#111827",
            color: COLORS.text,
            padding: "8px 12px",
            borderRadius: "8px",
          });
        }}
        onBlur={(e) => {
          Object.assign(e.currentTarget.style, { left: "-9999px", top: "-9999px" });
        }}
      >
        Skip to content
      </a>

      {/* Masthead */}
      <header style={{ width: "100%", overflow: "hidden", borderBottom: `1px solid ${COLORS.border}` }}>
        <img
          src={banner.src}
          alt={banner.alt}
          style={{
            width: "100%",
            display: "block",
            aspectRatio: isMobile ? "1 / 1" : "2 / 1",
          }}
          loading="eager"
        />
      </header>

      {/* Top nav (minimal; expand later) */}
      <nav
        aria-label="Primary"
        style={{
          maxWidth: MAX_W,
          margin: "0 auto",
          padding: "8px 16px 0",
          display: "flex",
          gap: 12,
        }}
      >
        <NavLink to="/cc" label="CC" />
        <NavLink to="/reports" label="Reports" />
        <NavLink to="/agent-console" label="Agents" />
      </nav>

      <main id="main" style={{ maxWidth: MAX_W, margin: "0 auto", padding: "16px" }}>
        {children}
      </main>

      <footer
        style={{
          maxWidth: MAX_W,
          margin: "24px auto 40px",
          padding: "0 16px",
          color: "#9CA3AF",
          fontSize: 12,
        }}
      >
        © FullHousey • Admin
      </footer>
    </div>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      style={{
        color: active ? COLORS.text : "#9CA3AF",
        textDecoration: "none",
        padding: "6px 10px",
        borderRadius: 10,
        border: `1px solid ${active ? "#374151" : "transparent"}`,
        background: active ? "rgba(55,65,81,.25)" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}
