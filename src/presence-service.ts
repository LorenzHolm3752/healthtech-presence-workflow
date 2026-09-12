import { z } from "zod";
import { InfraiRealtime } from "./infrai-realtime.js";

export const notification = z.object({ channel: z.string().min(1), account_id: z.string().min(1), kind: z.enum(["schedule-change", "care-team-note"]), message: z.string().min(1).max(240) });
export type Notification = z.infer<typeof notification>;

export async function announceOperationalUpdate(input: Notification, client = new InfraiRealtime()) {
  const update = notification.parse(input);
  await client.createChannel(update.channel);
  const presence = await client.getPresence(update.channel);
  await client.publish(update.channel, "operational.update", { kind: update.kind, message: update.message }, update.account_id);
  return { channel: update.channel, online: presence, published: true };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = { channel: "clinic:front-desk", account_id: "demo-account", kind: "schedule-change", message: "Room 2 is ready for the next appointment." } as const;
  announceOperationalUpdate(input).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
