/**
 * Next.js instrumentation hook — runs once when the server process starts,
 * before any request is handled.
 *
 * Node 17+ uses `verbatim` DNS ordering, so it tries a host's IPv6 address
 * first. On networks without IPv6 egress (e.g. WSL2, some CI/containers), the
 * IPv6 connect stalls for a long time before falling back to IPv4 — which made
 * the Google OAuth token exchange (via openid-client) hang for ~150s. Forcing
 * IPv4-first avoids the dead IPv6 attempt. Harmless where IPv6 works.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const dns = await import("node:dns");
        dns.setDefaultResultOrder("ipv4first");
    }
}
