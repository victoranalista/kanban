import { NextRequest, NextResponse } from "next/server"
import { createId } from "@paralleldrive/cuid2"
import { verifySlackSignature, postSlackMessage } from "./lib/slack-client"
import {
  buildCardsPreviewBlocks,
  buildSuccessBlocks,
  buildRevisionBlocks,
  buildErrorBlocks,
} from "./lib/message-blocks"
import { generateCardsFromSlackMessage, refineCardsFromFeedback, createCardsInKanban } from "./lib/card-generator"
import { getSaleOriginFromChannel, isUserAllowedInChannel } from "./config/channel-mapping"
import {
  storePendingApproval,
  getPendingApproval,
  updatePendingApproval,
  deletePendingApproval,
  findPendingApprovalByThread,
} from "./lib/pending-store"
import { SlackEventCallback, SlackUrlVerification, SlackMessageEvent } from "./types"

export const GET = async () => {
  return NextResponse.json({ 
    status: "ok", 
    message: "Slack webhook is ready",
    timestamp: new Date().toISOString() 
  })
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.text()
    console.log("[Slack Webhook] Received request:", { bodyLength: body.length })
    const timestamp = request.headers.get("x-slack-request-timestamp") || ""
    const signature = request.headers.get("x-slack-signature") || ""
    if (process.env.NODE_ENV === "production") {
      const isValid = await verifySlackSignature(signature, timestamp, body)
      if (!isValid) {
        console.error("[Slack Webhook] Invalid signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }
    const payload = JSON.parse(body)
    console.log("[Slack Webhook] Payload type:", payload.type)
    if (payload.type === "url_verification") {
      return handleUrlVerification(payload as SlackUrlVerification)
    }
    if (payload.type === "event_callback") {
      console.log("[Slack Webhook] Event type:", payload.event?.type)
      return handleEventCallback(payload as SlackEventCallback)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[Slack Webhook] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

const handleUrlVerification = (payload: SlackUrlVerification) => {
  return NextResponse.json({ challenge: payload.challenge })
}

const handleEventCallback = async (payload: SlackEventCallback) => {
  const event = payload.event
  if (event.type === "app_mention") {
    await handleAppMention(event)
  } else if (event.type === "message" && event.thread_ts) {
    await handleThreadReply(event)
  }
  return NextResponse.json({ ok: true })
}

const handleAppMention = async (event: SlackMessageEvent) => {
  try {
    const { channel, user, text, ts } = event
    console.log("[App Mention] Channel:", channel, "User:", user, "Text:", text)
    const saleOrigin = getSaleOriginFromChannel(channel)
    if (!saleOrigin) {
      console.log("[App Mention] Channel not configured:", channel)
      await postSlackMessage(channel, "⚠️ Este canal não está configurado para o Kanban.", undefined, ts)
      return
    }
    console.log("[App Mention] SaleOrigin:", saleOrigin)
    if (!isUserAllowedInChannel(channel, user)) {
      console.log("[App Mention] User not allowed:", user)
      await postSlackMessage(channel, "⚠️ Você não tem permissão para criar cards neste canal.", undefined, ts)
      return
    }
    const cleanMessage = text.replace(/<@[A-Z0-9]+>/g, "").trim()
    if (cleanMessage.length < 10) {
      await postSlackMessage(channel, "📝 Por favor, descreva a funcionalidade ou problema com mais detalhes (mínimo 10 caracteres).", undefined, ts)
      return
    }
    await postSlackMessage(channel, "🔄 Processando sua solicitação...", undefined, ts)
    console.log("[App Mention] Generating cards...")
    const cards = await generateCardsFromSlackMessage(cleanMessage)
    if (cards.length === 0) {
      await postSlackMessage(channel, "⚠️ Não foi possível gerar cards. Tente reformular sua solicitação.", undefined, ts)
      return
    }
    const approvalId = createId()
    storePendingApproval({
      id: approvalId,
      channelId: channel,
      userId: user,
      threadTs: ts,
      cards,
      saleOrigin,
      originalMessage: cleanMessage,
      status: "pending",
      createdAt: new Date(),
    })
    console.log("[App Mention] Cards generated:", cards.length, "Approval ID:", approvalId)
    const blocks = buildCardsPreviewBlocks(cards, saleOrigin.toString(), approvalId)
    await postSlackMessage(channel, `📋 ${cards.length} card(s) gerado(s) - aguardando aprovação`, blocks, ts)
  } catch (error) {
    console.error("[App Mention] Error:", error)
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    await postSlackMessage(event.channel, "", buildErrorBlocks(message), event.ts)
  }
}

const handleThreadReply = async (event: SlackMessageEvent) => {
  const { channel, user, text, thread_ts } = event
  if (!thread_ts) return
  const approval = findPendingApprovalByThread(channel, thread_ts)
  if (!approval || approval.status !== "pending") return
  if (approval.userId !== user) return
  await postSlackMessage(channel, "", buildRevisionBlocks(), thread_ts)
  try {
    const refinedCards = await refineCardsFromFeedback(approval.cards, text)
    const newApprovalId = createId()
    deletePendingApproval(approval.id)
    storePendingApproval({
      id: newApprovalId,
      channelId: channel,
      userId: user,
      threadTs: thread_ts,
      cards: refinedCards,
      saleOrigin: approval.saleOrigin,
      originalMessage: approval.originalMessage,
      status: "pending",
      createdAt: new Date(),
    })
    const blocks = buildCardsPreviewBlocks(refinedCards, approval.saleOrigin.toString(), newApprovalId)
    await postSlackMessage(channel, `📋 ${refinedCards.length} card(s) atualizado(s) - aguardando aprovação`, blocks, thread_ts)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar alterações"
    await postSlackMessage(channel, "", buildErrorBlocks(message), thread_ts)
  }
}
