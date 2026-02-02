"use client"

import { KanbanCardData } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type KanbanCardProps = {
  card: KanbanCardData
  isDragging?: boolean
  onCardClick: (card: KanbanCardData) => void
  onToggleNext: (cardId: string) => void
  showNextButton?: boolean
}

export const KanbanCard = ({ card, isDragging = false, onCardClick, onToggleNext, showNextButton = false }: KanbanCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "cursor-pointer rounded-md border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md",
        card.isNext && "ring-2 ring-muted-foreground/50",
        isDragging && "opacity-50"
      )}
      onClick={() => onCardClick(card)}
    >
      <div className="flex items-start justify-between gap-1.5">
        <h4 className="flex-1 text-xs font-medium leading-tight line-clamp-2">{card.name}</h4>
        {showNextButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleNext(card.id)
            }}
          >
            <Star className={cn("h-3 w-3", card.isNext && "fill-current text-yellow-500")} />
          </Button>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <Badge variant="outline" className="h-4 gap-0.5 px-1 text-[10px]">
          <Clock className="h-2.5 w-2.5" />
          {card.estimatedHours}h
        </Badge>
        {card.isNext && (
          <Badge className="h-4 px-1 text-[10px]">
            Próximo
          </Badge>
        )}
      </div>
    </motion.div>
  )
}
