import { NextRequest, NextResponse } from "next/server"
import { postSlackMessage } from "../lib/slack-client"
import { buildSuccessBlocks, buildRejectedBlocks, buildErrorBlocks } from "../lib/message-blocks"
import { createCardsInKanban } from "../lib/card-generator"
import { getPendingApproval, deletePendingApproval, updatePendingApproval } from "../lib/pending-store"
import { SlackInteractionPayload } from "../types"

export const POST = async (request: NextRequest) => {
  const formData = await request.formData()
  const payloadString = formData.get("payload")
  if (!payloadString || typeof payloadString !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const payload: SlackInteractionPayload = JSON.parse(payloadString)
  if (payload.type !== "block_actions") {
    return NextResponse.json({ ok: true })
  }
  const action = payload.actions[0]
  if (!action) return NextResponse.json({ ok: true })
  const approvalId = action.value
  if (!approvalId) return NextResponse.json({ ok: true })
  const approval = getPendingApproval(approvalId)
  if (!approval) {
    await respondToInteraction(payload.response_url, "⚠️ Solicitação expirada ou não encontrada.")
    return NextResponse.json({ ok: true })
  }
  if (approval.userId !== payload.user.id) {
    await respondToInteraction(payload.response_url, "⚠️ Apenas quem criou a solicitação pode aprová-la.")
    return NextResponse.json({ ok: true })
  }
  if (action.action_id === "approve_cards") {
    await handleApprove(approval, payload)
  } else if (action.action_id === "reject_cards") {
    await handleReject(approval, payload)
  }
  return NextResponse.json({ ok: true })
}

const handleApprove = async (approval: ReturnType<typeof getPendingApproval>, payload: SlackInteractionPayload) => {
  if (!approval) return
  updatePendingApproval(approval.id, { status: "approved" })
  try {
    const count = await createCardsInKanban(approval.cards, approval.saleOrigin)
    await postSlackMessage(
      approval.channelId,
      "",
      buildSuccessBlocks(count),
      approval.threadTs
    )
    deletePendingApproval(approval.id)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar cards"
    await postSlackMessage(approval.channelId, "", buildErrorBlocks(message), approval.threadTs)
  }
}

const handleReject = async (approval: ReturnType<typeof getPendingApproval>, payload: SlackInteractionPayload) => {
  if (!approval) return
  updatePendingApproval(approval.id, { status: "rejected" })
  await postSlackMessage(approval.channelId, "", buildRejectedBlocks(), approval.threadTs)
  deletePendingApproval(approval.id)
}

const respondToInteraction = async (responseUrl: string, text: string) => {
  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, replace_original: false, response_type: "ephemeral" }),
  })
}
