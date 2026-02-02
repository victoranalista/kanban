import { NextRequest, NextResponse } from "next/server"
import { getSaleOriginFromChannel, isUserAllowedInChannel } from "../config/channel-mapping"

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url)
  const channelId = url.searchParams.get("channel") || "C084YBSS8N5"
  const userId = url.searchParams.get("user") || "U4DHS9FB6"
  const saleOrigin = getSaleOriginFromChannel(channelId)
  const isAllowed = isUserAllowedInChannel(channelId, userId)
  return NextResponse.json({
    channelId,
    userId,
    saleOrigin,
    isAllowed,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    openAIPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
  })
}

export const POST = async (request: NextRequest) => {
  const body = await request.json()
  const { channel, user } = body
  const saleOrigin = getSaleOriginFromChannel(channel)
  const isAllowed = isUserAllowedInChannel(channel, user)
  return NextResponse.json({
    input: body,
    channelId: channel,
    userId: user,
    saleOrigin,
    isAllowed,
    message: isAllowed 
      ? `✅ Usuário ${user} pode criar cards no canal ${channel} (${saleOrigin})`
      : `❌ Usuário ${user} NÃO pode criar cards no canal ${channel}`,
  })
}
