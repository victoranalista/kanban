"use client"
import { useState, useEffect, useCallback } from "react"
import { SaleOrigin } from "@prisma/client"
import { KanbanBoardData, KanbanCardData } from "@/app/dashboard/kanban/types"
import { SaleOriginSelect } from "@/app/dashboard/kanban/components/sale-origin-select"
import { KanbanColumn } from "@/app/dashboard/kanban/components/kanban-column"
import { CardSpecificationSheet } from "@/app/dashboard/kanban/components/card-specification-sheet"
import { CreateFeatureModal } from "@/app/dashboard/kanban/components/create-feature-modal"
import { CreateCardModal } from "@/app/dashboard/kanban/components/create-card-modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getOrCreateBoard } from "@/app/dashboard/kanban/actions/board-actions"
import { moveCard, toggleIsNext } from "@/app/dashboard/kanban/actions/card-actions"
import { toast } from "sonner"
import { Sparkles, Plus } from "lucide-react"

export const KanbanPage = () => {
  const [selectedOrigin, setSelectedOrigin] = useState<SaleOrigin>(SaleOrigin.INTERNATIONAL_LAW)
  const [board, setBoard] = useState<KanbanBoardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false)
  const loadBoard = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getOrCreateBoard(selectedOrigin)
      setBoard(data as unknown as KanbanBoardData)
    } catch {
      toast.error("Erro ao carregar board")
    } finally {
      setIsLoading(false)
    }
  }, [selectedOrigin])
  useEffect(() => {
    loadBoard()
  }, [loadBoard])
  const handleMoveCard = async (cardId: string, targetColumnId: string, position: number) => {
    try {
      await moveCard(cardId, targetColumnId, position)
      await loadBoard()
      toast.success("Card movido com sucesso")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao mover card"
      toast.error(message)
    }
  }
  const handleToggleNext = async (cardId: string) => {
    if (!board) return
    try {
      await toggleIsNext(cardId, board.id)
      await loadBoard()
      toast.success("Card marcado como próximo")
    } catch {
      toast.error("Erro ao marcar card")
    }
  }
  const backlogColumnId = board?.columns.find((c) => c.order === 0)?.id ?? ""
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <header className="shrink-0 border-b bg-background px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg font-bold sm:text-xl">Kanban</h1>
            <SaleOriginSelect value={selectedOrigin} onChange={setSelectedOrigin} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateCardModalOpen(true)}
              disabled={!board}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Card</span>
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} disabled={!board}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-2 sm:p-4">
        {isLoading ? (
          <div className="flex h-full gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-64 shrink-0 rounded-lg sm:w-72" />
            ))}
          </div>
        ) : board ? (
          <div className="flex h-full gap-3">
            {board.columns.map((column) => {
              const wipLimitReached = column.wipLimit !== null && column.cards.length >= column.wipLimit
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onCardClick={setSelectedCard}
                  onToggleNext={handleToggleNext}
                  onDrop={handleMoveCard}
                  isWipLimitReached={wipLimitReached}
                  isBacklog={column.order === 0}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Erro ao carregar board</p>
          </div>
        )}
      </main>
      <CardSpecificationSheet
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onDeleted={loadBoard}
      />
      {board && (
        <>
          <CreateFeatureModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            boardId={board.id}
            backlogColumnId={backlogColumnId}
            onCardsCreated={loadBoard}
          />
          <CreateCardModal
            isOpen={isCreateCardModalOpen}
            onClose={() => setIsCreateCardModalOpen(false)}
            columnId={backlogColumnId}
            onCardCreated={loadBoard}
          />
        </>
      )}
    </div>
  )
}
