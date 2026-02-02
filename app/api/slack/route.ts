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

export const POST = async (request: NextRequest) => {
  const body = await request.text()
  const timestamp = request.headers.get("x-slack-request-timestamp") || ""
  const signature = request.headers.get("x-slack-signature") || ""
  if (process.env.NODE_ENV === "production") {
    const isValid = await verifySlackSignature(signature, timestamp, body)
    if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }
  const payload = JSON.parse(body)
  if (payload.type === "url_verification") {
    return handleUrlVerification(payload as SlackUrlVerification)
  }
  if (payload.type === "event_callback") {
    return handleEventCallback(payload as SlackEventCallback)
  }
  return NextResponse.json({ ok: true })
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
  const { channel, user, text, ts } = event
  const saleOrigin = getSaleOriginFromChannel(channel)
  if (!saleOrigin) {
    await postSlackMessage(channel, "⚠️ Este canal não está configurado para o Kanban.", undefined, ts)
    return
  }
  if (!isUserAllowedInChannel(channel, user)) {
    await postSlackMessage(
      channel,
      "⚠️ Você não tem permissão para criar cards neste canal. Apenas assistentes e substitutos podem usar este bot.",
      undefined,
      ts
    )
    return
  }
  const cleanMessage = text.replace(/<@[A-Z0-9]+>/g, "").trim()
  if (cleanMessage.length < 10) {
    await postSlackMessage(
      channel,
      "📝 Por favor, descreva a funcionalidade ou problema com mais detalhes (mínimo 10 caracteres).",
      undefined,
      ts
    )
    return
  }
  await postSlackMessage(channel, "🔄 Processando sua solicitação...", undefined, ts)
  try {
    const cards = await generateCardsFromSlackMessage(cleanMessage)
    if (cards.length === 0) {
      await postSlackMessage(channel, "⚠️ Não foi possível gerar cards. Tente reformular sua solicitação.", undefined, ts)
      return
    }
    const approvalId = createId()
    storePendingApproval({
      id: approvalId,
      channelId: channel,
      threadTs: ts,
      userId: user,
      saleOrigin,
      cards,
      originalMessage: cleanMessage,
      createdAt: new Date(),
      status: "pending",
    })
    const blocks = buildCardsPreviewBlocks(cards, saleOrigin, approvalId)
    await postSlackMessage(channel, `📋 ${cards.length} card(s) gerado(s) - aguardando aprovação`, blocks, ts)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    await postSlackMessage(channel, "", buildErrorBlocks(message), ts)
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
    updatePendingApproval(approval.id, { cards: refinedCards, status: "pending" })
    storePendingApproval({
      ...approval,
      id: newApprovalId,
      cards: refinedCards,
      status: "pending",
    })
    deletePendingApproval(approval.id)
    const blocks = buildCardsPreviewBlocks(refinedCards, approval.saleOrigin, newApprovalId)
    await postSlackMessage(channel, `📋 ${refinedCards.length} card(s) atualizado(s) - aguardando aprovação`, blocks, thread_ts)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar alterações"
    await postSlackMessage(channel, "", buildErrorBlocks(message), thread_ts)
  }
}
