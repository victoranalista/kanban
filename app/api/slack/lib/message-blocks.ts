import { GeneratedCard } from "@/app/dashboard/kanban/types"

const SALE_ORIGIN_LABELS: Record<string, string> = {
  INTERNATIONAL_LAW: "Direito Internacional",
  FAMILY_LAW: "Direito de Família",
  BANKING_LAW: "Direito Bancário",
  PROCEDURAL_LAW: "Direito Processual",
  ADMINISTRATIVE: "Administrativo",
}

export const buildCardsPreviewBlocks = (cards: GeneratedCard[], saleOrigin: string, approvalId: string) => {
  const blocks: object[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "📋 Cards Gerados para Aprovação", emoji: true },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `*Unidade:* ${SALE_ORIGIN_LABELS[saleOrigin] || saleOrigin}` },
        { type: "mrkdwn", text: `*Total:* ${cards.length} card(s)` },
      ],
    },
    { type: "divider" },
  ]
  cards.forEach((card, index) => {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${index + 1}. ${card.name}*\n⏱️ ${card.estimatedHours}h (${Math.ceil(card.estimatedHours / 8)} dias)`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📝 *Especificação:*\n${truncateText(card.specification, 500)}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🎯 *Objetivo:*\n${truncateText(card.objective, 300)}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `✅ *Critérios de Aceitação:*\n${truncateText(card.acceptanceCriteria, 400)}`,
        },
      },
      { type: "divider" }
    )
  })
  blocks.push(
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "👆 *O que deseja fazer?*\n• ✅ Aprovar e criar cards\n• ❌ Rejeitar\n• 📝 Responda nesta thread para solicitar alterações",
      },
    },
    {
      type: "actions",
      block_id: `approval_${approvalId}`,
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "✅ Aprovar", emoji: true },
          style: "primary",
          action_id: "approve_cards",
          value: approvalId,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "❌ Rejeitar", emoji: true },
          style: "danger",
          action_id: "reject_cards",
          value: approvalId,
        },
      ],
    }
  )
  return blocks
}

export const buildSuccessBlocks = (cardsCount: number) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `✅ *${cardsCount} card(s) criado(s) com sucesso!*\nOs cards foram adicionados ao Backlog do Kanban.`,
    },
  },
]

export const buildRejectedBlocks = () => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "❌ *Cards rejeitados.*\nNenhum card foi criado.",
    },
  },
]

export const buildRevisionBlocks = () => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "📝 *Solicitação de alteração recebida.*\nProcessando suas sugestões...",
    },
  },
]

export const buildErrorBlocks = (message: string) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `⚠️ *Erro:* ${message}`,
    },
  },
]

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}
