"use client"

import { KanbanColumnData, KanbanCardData } from "../types"
import { KanbanCard } from "./kanban-card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type KanbanColumnProps = {
  column: KanbanColumnData
  onCardClick: (card: KanbanCardData) => void
  onToggleNext: (cardId: string) => void
  onDrop: (cardId: string, columnId: string, position: number) => void
  isDragOver?: boolean
  isWipLimitReached?: boolean
  isBacklog?: boolean
}

export const KanbanColumn = ({
  column,
  onCardClick,
  onToggleNext,
  onDrop,
  isDragOver = false,
  isWipLimitReached = false,
  isBacklog = false,
}: KanbanColumnProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData("cardId")
    const position = column.cards.length
    onDrop(cardId, column.id, position)
  }
  const wipCount = column.cards.length
  const hasWipLimit = column.wipLimit !== null
  const wipLimitReached = hasWipLimit && wipCount >= column.wipLimit!
  return (
    <div className="flex h-fit max-h-full w-64 shrink-0 flex-col rounded-lg bg-muted/40 sm:w-72">
      <div className="flex items-center justify-between p-2.5">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        {hasWipLimit ? (
          <Badge variant={wipLimitReached ? "destructive" : "secondary"} className="h-5 px-1.5 text-xs">
            {wipCount}/{column.wipLimit}
          </Badge>
        ) : (
          <Badge variant="outline" className="h-5 px-1.5 text-xs">
            {wipCount}
          </Badge>
        )}
      </div>
      <div
        className={cn(
          "mx-2 mb-2 flex min-h-[80px] flex-col gap-2 overflow-y-auto rounded-md border border-dashed p-2",
          isDragOver && "border-primary bg-primary/5",
          isWipLimitReached && "border-destructive/50 bg-destructive/5"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isWipLimitReached && (
          <div className="flex items-center gap-1.5 rounded bg-destructive/10 p-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>WIP atingido</span>
          </div>
        )}
        {column.cards.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("cardId", card.id)
            }}
          >
            <KanbanCard card={card} onCardClick={onCardClick} onToggleNext={onToggleNext} showNextButton={isBacklog} />
          </div>
        ))}
        {column.cards.length === 0 && !isWipLimitReached && (
          <p className="py-4 text-center text-xs text-muted-foreground">Vazio</p>
        )}
      </div>
    </div>
  )
}
