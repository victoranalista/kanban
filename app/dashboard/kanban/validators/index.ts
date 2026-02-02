import { z } from "zod"
import { SaleOrigin } from "@prisma/client"

export const createCardSchema = z.object({
  columnId: z.string().min(1),
  name: z.string().min(1).max(100),
  specification: z.string().min(1),
  objective: z.string().min(1),
  acceptanceCriteria: z.string().min(1),
  estimatedHours: z.number().int().min(1).max(24),
})

export const moveCardSchema = z.object({
  cardId: z.string().min(1),
  targetColumnId: z.string().min(1),
  targetPosition: z.number(),
})

export const toggleIsNextSchema = z.object({
  cardId: z.string().min(1),
  boardId: z.string().min(1),
})

export const generateCardsSchema = z.object({
  featureDescription: z.string().min(10).max(2000),
  boardId: z.string().min(1),
})

export const updateBoardTeamSizeSchema = z.object({
  boardId: z.string().min(1),
  teamSize: z.number().int().min(1).max(20),
})

export const saleOriginSchema = z.enum(SaleOrigin)
