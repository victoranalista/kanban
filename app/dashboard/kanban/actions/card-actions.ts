"use server"
import { prismaNeon } from "@/lib/prismaNeon"
import { createCardSchema, moveCardSchema, toggleIsNextSchema } from "../validators"

const calculateNewPosition = (before: number | null, after: number | null): number => {
  if (before === null && after === null) return 1000
  if (before === null) return after! / 2
  if (after === null) return before + 1000
  return (before + after) / 2
}

export const createCard = async (data: {
  columnId: string
  name: string
  specification: string
  objective: string
  acceptanceCriteria: string
  estimatedHours: number
}) => {
  const validated = createCardSchema.parse(data)
  const column = await prismaNeon.kanbanColumn.findUnique({
    where: { id: validated.columnId },
    include: { cards: { orderBy: { position: "desc" }, take: 1 } },
  })
  if (!column) throw new Error("Column not found")
  const lastPosition = column.cards[0]?.position ? Number(column.cards[0].position) : null
  const newPosition = calculateNewPosition(lastPosition, null)
  return prismaNeon.kanbanCard.create({
    data: {
      ...validated,
      position: newPosition,
      isNext: false,
    },
  })
}

export const moveCard = async (cardId: string, targetColumnId: string, targetPosition: number) => {
  const validated = moveCardSchema.parse({ cardId, targetColumnId, targetPosition })
  const card = await prismaNeon.kanbanCard.findUnique({
    where: { id: validated.cardId },
    include: { column: true },
  })
  if (!card) throw new Error("Card not found")
  const targetColumn = await prismaNeon.kanbanColumn.findUnique({
    where: { id: validated.targetColumnId },
    include: { cards: true },
  })
  if (!targetColumn) throw new Error("Target column not found")
  if (card.column.boardId !== targetColumn.boardId) {
    throw new Error("Cannot move card between boards")
  }
  const orderDiff = targetColumn.order - card.column.order
  if (Math.abs(orderDiff) > 1) throw new Error("Cannot skip columns")
  const isMovingBackwards = orderDiff < 0
  const canMoveBackwards = card.column.order > 1 && targetColumn.order > 0
  if (isMovingBackwards && !canMoveBackwards) {
    throw new Error("Cards só podem voltar após Specify e não podem voltar para Backlog")
  }
  if (targetColumn.wipLimit !== null) {
    const currentCount = targetColumn.cards.filter(c => c.id !== validated.cardId).length
    if (currentCount >= targetColumn.wipLimit) {
      throw new Error(`WIP limit reached: ${targetColumn.wipLimit}`)
    }
  }
  const cardsInTarget = await prismaNeon.kanbanCard.findMany({
    where: { columnId: validated.targetColumnId, id: { not: validated.cardId } },
    orderBy: { position: "asc" },
  })
  const before = validated.targetPosition > 0 ? Number(cardsInTarget[validated.targetPosition - 1]?.position ?? null) : null
  const after = Number(cardsInTarget[validated.targetPosition]?.position ?? null)
  const newPosition = calculateNewPosition(before, after)
  const isLeavingBacklog = card.column.order === 0 && targetColumn.order !== 0
  return prismaNeon.kanbanCard.update({
    where: { id: validated.cardId },
    data: {
      columnId: validated.targetColumnId,
      position: newPosition,
      isNext: isLeavingBacklog ? false : card.isNext,
    },
  })
}

export const toggleIsNext = async (cardId: string, boardId: string) => {
  const validated = toggleIsNextSchema.parse({ cardId, boardId })
  const card = await prismaNeon.kanbanCard.findUnique({
    where: { id: validated.cardId },
    include: { column: true },
  })
  if (!card) throw new Error("Card not found")
  if (card.column.boardId !== validated.boardId) {
    throw new Error("Card does not belong to this board")
  }
  if (card.column.order !== 0) {
    throw new Error("Apenas cards no Backlog podem ser marcados como próximo")
  }
  await prismaNeon.$transaction([
    prismaNeon.kanbanCard.updateMany({
      where: {
        column: { boardId: validated.boardId },
        isNext: true,
      },
      data: { isNext: false },
    }),
    prismaNeon.kanbanCard.update({
      where: { id: validated.cardId },
      data: { isNext: true },
    }),
  ])
  return { success: true }
}

export const deleteCard = async (cardId: string) => {
  return prismaNeon.kanbanCard.delete({ where: { id: cardId } })
}
