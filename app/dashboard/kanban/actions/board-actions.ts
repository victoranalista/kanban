"use server"
import { prismaNeon } from "@/lib/prismaNeon"
import { SaleOrigin, Role } from "@prisma/client"
import { saleOriginSchema, updateBoardTeamSizeSchema } from "../validators"

export const getOrCreateBoard = async (saleOrigin: SaleOrigin) => {
  const validated = saleOriginSchema.parse(saleOrigin)
  let board = await prismaNeon.kanbanBoard.findUnique({
    where: { saleOrigin: validated },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          cards: { orderBy: { position: "asc" } },
        },
      },
    },
  })
  if (!board) {
    board = await createBoardWithColumns(validated)
  }
  return board
}

const createBoardWithColumns = async (saleOrigin: SaleOrigin) => {
  const teamSize = 3
  const wipLimit = 2
  return prismaNeon.kanbanBoard.create({
    data: {
      saleOrigin,
      teamSize,
      columns: {
        create: [
          { title: "Backlog", order: 0, wipLimit: null },
          { title: "Specify", order: 1, wipLimit },
          { title: "Implement", order: 2, wipLimit },
          { title: "Validate", order: 3, wipLimit },
          { title: "Deploy", order: 4, wipLimit },
        ],
      },
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { position: "asc" } } },
      },
    },
  })
}

export const updateBoardTeamSize = async (boardId: string, teamSize: number) => {
  const validated = updateBoardTeamSizeSchema.parse({ boardId, teamSize })
  const wipLimit = 2
  await prismaNeon.$transaction([
    prismaNeon.kanbanBoard.update({
      where: { id: validated.boardId },
      data: { teamSize: validated.teamSize },
    }),
    prismaNeon.kanbanColumn.updateMany({
      where: { boardId: validated.boardId, wipLimit: { not: null } },
      data: { wipLimit },
    }),
  ])
  return { success: true }
}
