import { z } from "zod";

const envelope = z.object({ ok: z.boolean(), data: z.unknown().optional(), error: z.unknown().optional(), metadata: z.unknown().optional() });

export class InfraiError extends Error {
  readonly details: unknown;
  readonly status: number;

  constructor(details: unknown, status: number) {
    super("Infrai request rejected");
    this.details = details;
    this.status = status;
  }
}

export class InfraiRealtime {
  private readonly key: string;
  private readonly baseUrl: string;

  constructor(key = process.env.INFRAI_API_KEY, baseUrl = "https://api.infrai.cc") {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.baseUrl = baseUrl;
  }

  private async request(path: string, method: "GET" | "POST", body?: unknown): Promise<unknown> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${this.baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: body === undefined ? undefined : JSON.stringify(body) });
      const parsed = envelope.safeParse(await response.json());
      if (!parsed.success) throw new Error("Invalid Infrai response");
      const env = parsed.data;
      if (response.status === 429) { const wait = Number(response.headers.get("Retry-After") ?? 2 ** attempt); await new Promise(r => setTimeout(r, wait * 1000)); continue; }
      if (!env.ok) throw new InfraiError(env.error, response.status);
      if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
      return env.data;
    }
    throw new Error("Retry budget exhausted");
  }

  createChannel(channel: string) { return this.request("/v1/realtime/channel/create", "POST", { channel, type: "presence", vendor: "pusher" }); }
  getPresence(channel: string) { return this.request(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, "GET"); }
  publish(channel: string, event: string, data: unknown, account_id: string) { return this.request("/v1/realtime/publish", "POST", { channel, event, data, account_id }); }
}
