import { SaleOrigin } from "@prisma/client"

export type KanbanBoardData = {
  id: string
  saleOrigin: SaleOrigin
  teamSize: number
  columns: KanbanColumnData[]
  createdAt: Date
  updatedAt: Date
}

export type KanbanColumnData = {
  id: string
  boardId: string
  title: string
  order: number
  wipLimit: number | null
  cards: KanbanCardData[]
  createdAt: Date
  updatedAt: Date
}

export type KanbanCardData = {
  id: string
  columnId: string
  name: string
  specification: string
  objective: string
  acceptanceCriteria: string
  estimatedHours: number
  position: number
  isNext: boolean
  createdAt: Date
  updatedAt: Date
}

export type MoveCardDirection = "next" | "previous"

export type GeneratedCard = {
  name: string
  specification: string
  objective: string
  acceptanceCriteria: string
  estimatedHours: number
}
