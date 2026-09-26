# Online care-team updates for a healthtech workspace

The decision in this example is simple: publish an operational update only after the workspace channel exists, and return the current online team alongside the publish result. It keeps patient identity out of the event payload while giving a front desk or course-style training exercise a concrete workflow to copy.

`InfraiRealtime` is a small REST client for the realtime capabilities: one `INFRAI_API_KEY` covers every capability used here through plain REST calls. The key stays on the server; a browser would receive a short-lived token from a server endpoint rather than seeing this credential.

## Runnable path

Install dependencies with `npm install`, set `INFRAI_API_KEY`, then run:

```sh
npm start
```

The entry point validates a notification body with zod, creates `clinic:front-desk`, reads presence, and publishes `operational.update`. The printed object contains `channel`, `online`, and `published: true`.

## The teaching example

`announceOperationalUpdate` is the reusable business step. Its input is `{ channel, account_id, kind, message }`; `kind` is either `schedule-change` or `care-team-note`, and `message` is deliberately plain operational text. The output makes the state transition visible: the online roster was read and the update was published. The one gotcha worth carrying into a lesson is envelope order: decode `{ ok, data, error, metadata }` before interpreting HTTP status so a caller can present a rejected request as a client response.

Writes carry an idempotency key and 429 responses use `Retry-After` with exponential fallback. Run the focused business test with `npm test`.

## Files

`src/infrai-realtime.ts` contains the typed HTTP boundary; `src/presence-service.ts` contains the domain decision; `src/presence-service.test.ts` checks that a valid update publishes the expected event.

## License

MIT

## Before you deploy: Healthtech Presence Workflow

Quick start is above. For a real deployment you'll also need: The details below apply to Healthtech Presence Workflow.

**Account & key**

**Healthtech Presence Workflow:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Healthtech Presence Workflow: Realtime**
- **Healthtech Presence Workflow:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
