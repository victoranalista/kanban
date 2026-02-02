const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET

export const verifySlackSignature = async (
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> => {
  if (!SLACK_SIGNING_SECRET) return false
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5
  if (parseInt(timestamp) < fiveMinutesAgo) return false
  const sigBasestring = `v0:${timestamp}:${body}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SLACK_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(sigBasestring))
  const mySignature = `v0=${Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`
  return mySignature === signature
}

export const postSlackMessage = async (channel: string, text: string, blocks?: object[], threadTs?: string) => {
  if (!SLACK_BOT_TOKEN) throw new Error("Slack bot token not configured")
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      text,
      blocks,
      thread_ts: threadTs,
    }),
  })
  return response.json()
}

export const updateSlackMessage = async (channel: string, ts: string, text: string, blocks?: object[]) => {
  if (!SLACK_BOT_TOKEN) throw new Error("Slack bot token not configured")
  const response = await fetch("https://slack.com/api/chat.update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      ts,
      text,
      blocks,
    }),
  })
  return response.json()
}
