export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Proxy all /api/* calls to VPS backend (port 80 via sslip.io hostname to bypass Cloudflare 1003 direct IP restriction)
    if (url.pathname.startsWith('/api/')) {
      const backendUrl = new URL(url.pathname + url.search, 'http://103-72-57-149.sslip.io');
      
      // Clone headers
      const headers = new Headers(request.headers);
      headers.set('X-Forwarded-Host', url.host);
      headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

      const proxyRequest = new Request(backendUrl.toString(), {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow',
      });

      return fetch(proxyRequest);
    }

    // Serve static assets for all other routes
    return env.ASSETS.fetch(request);
  },
};

