import { NextResponse } from "next/server"

export const GET = async () => {
  const config = {
    hasSlackBotToken: !!process.env.SLACK_BOT_TOKEN,
    hasSlackSigningSecret: !!process.env.SLACK_SIGNING_SECRET,
    slackBotTokenPrefix: process.env.SLACK_BOT_TOKEN?.substring(0, 8),
    nodeEnv: process.env.NODE_ENV,
  }
  return NextResponse.json(config)
}
