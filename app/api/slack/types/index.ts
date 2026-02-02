import { SaleOrigin } from "@prisma/client"
import { GeneratedCard } from "@/app/dashboard/kanban/types"

export type OfficerRole = 'substitute' | 'assistant'

export type SlackChannelMapping = {
  channelId: string
  saleOrigin: SaleOrigin
  allowedUsers?: string[]
}

export type SlackEventCallback = {
  token: string
  team_id: string
  api_app_id: string
  event: SlackMessageEvent
  type: "event_callback"
  event_id: string
  event_time: number
}

export type SlackMessageEvent = {
  type: "app_mention" | "message"
  user: string
  text: string
  ts: string
  channel: string
  event_ts: string
  thread_ts?: string
}

export type SlackUrlVerification = {
  token: string
  challenge: string
  type: "url_verification"
}

export type SlackInteractionPayload = {
  type: "block_actions" | "message_action"
  user: { id: string; name: string }
  channel: { id: string }
  message: { ts: string; thread_ts?: string }
  actions: SlackAction[]
  response_url: string
  trigger_id: string
}

export type SlackAction = {
  action_id: string
  block_id: string
  value?: string
  type: string
}

export type PendingApproval = {
  id: string
  channelId: string
  threadTs: string
  userId: string
  saleOrigin: SaleOrigin
  cards: GeneratedCard[]
  originalMessage: string
  createdAt: Date
  status: "pending" | "approved" | "rejected" | "revision"
}
