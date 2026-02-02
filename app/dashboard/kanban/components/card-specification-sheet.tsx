"use client"

import { useState } from "react"
import { KanbanCardData } from "../types"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Clock, Target, CheckCircle2, FileText, Trash2, AlertTriangle } from "lucide-react"
import { deleteCard } from "../actions/card-actions"
import { toast } from "sonner"

type CardSpecificationSheetProps = {
  card: KanbanCardData | null
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

export const CardSpecificationSheet = ({ card, isOpen, onClose, onDeleted }: CardSpecificationSheetProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  if (!card) return null
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCard(card.id)
      toast.success("Card excluído")
      onDeleted()
      onClose()
    } catch {
      toast.error("Erro ao excluir")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-4 py-3">
          <SheetTitle className="pr-6 text-base leading-tight">{card.name}</SheetTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {card.estimatedHours}h
            </Badge>
            {card.isNext && (
              <Badge variant="secondary" className="text-xs">
                Próximo
              </Badge>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            <Section icon={<FileText className="h-4 w-4" />} title="Especificação">
              <p className="text-sm text-muted-foreground">{card.specification || "Não especificado"}</p>
            </Section>
            <Separator />
            <Section icon={<Target className="h-4 w-4" />} title="Objetivo">
              <p className="text-sm text-muted-foreground">{card.objective || "Não definido"}</p>
            </Section>
            <Separator />
            <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Critérios de Aceitação">
              <p className="text-sm text-muted-foreground">{card.acceptanceCriteria || "Não definidos"}</p>
            </Section>
          </div>
        </ScrollArea>
        <div className="shrink-0 border-t p-4">
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirmar exclusão
                </DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h4 className="flex items-center gap-2 text-sm font-medium">
      {icon}
      {title}
    </h4>
    {children}
  </div>
)
