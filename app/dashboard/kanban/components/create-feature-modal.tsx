"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Sparkles, Clock } from "lucide-react"
import { generateCardsFromFeature } from "../actions/ai-actions"
import { createCard } from "../actions/card-actions"
import { GeneratedCard } from "../types"
import { toast } from "sonner"

type CreateFeatureModalProps = {
  isOpen: boolean
  onClose: () => void
  boardId: string
  backlogColumnId: string
  onCardsCreated: () => void
}

export const CreateFeatureModal = ({ isOpen, onClose, boardId, backlogColumnId, onCardsCreated }: CreateFeatureModalProps) => {
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([])
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const handleGenerate = async () => {
    if (description.length < 10) {
      toast.error("Descrição muito curta. Mínimo 10 caracteres.")
      return
    }
    setIsGenerating(true)
    try {
      const cards = await generateCardsFromFeature(description, boardId)
      setGeneratedCards(cards)
      setSelectedCards(new Set(cards.map((_, i) => i)))
    } catch {
      toast.error("Erro ao gerar cards. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }
  const handleCreateCards = async () => {
    setIsCreating(true)
    try {
      const cardsToCreate = generatedCards.filter((_, i) => selectedCards.has(i))
      await Promise.all(
        cardsToCreate.map((card) =>
          createCard({
            columnId: backlogColumnId,
            ...card,
          })
        )
      )
      toast.success(`${cardsToCreate.length} cards criados com sucesso`)
      onCardsCreated()
      setDescription("")
      setGeneratedCards([])
      setSelectedCards(new Set())
      onClose()
    } catch {
      toast.error("Erro ao criar cards")
    } finally {
      setIsCreating(false)
    }
  }
  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedCards)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedCards(newSelected)
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            Criar com IA
          </DialogTitle>
        </DialogHeader>
        {generatedCards.length === 0 ? (
          <div className="space-y-3">
            <Alert>
              <AlertDescription className="text-xs sm:text-sm">
                Descreva a funcionalidade. A IA quebrará em cards de até 2 dias.
              </AlertDescription>
            </Alert>
            <Textarea
              placeholder="Ex: Sistema de autenticação com login social..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Gerar
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Alert>
              <AlertDescription className="text-xs sm:text-sm">
                {generatedCards.length} cards. Clique para selecionar/deselecionar.
              </AlertDescription>
            </Alert>
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-2 pr-3">
                {generatedCards.map((card, i) => (
                  <div
                    key={i}
                    className={`cursor-pointer rounded-md border p-2.5 text-sm transition-all ${selectedCards.has(i) ? "border-primary bg-primary/5" : "border-border"}`}
                    onClick={() => toggleCard(i)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-medium leading-tight">{card.name}</h4>
                      <Badge variant="outline" className="h-5 shrink-0 gap-0.5 px-1 text-[10px]">
                        <Clock className="h-2.5 w-2.5" />
                        {card.estimatedHours}h
                      </Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{card.specification}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setGeneratedCards([])}>
                Voltar
              </Button>
              <Button size="sm" onClick={handleCreateCards} disabled={isCreating || selectedCards.size === 0}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  `Criar ${selectedCards.size}`
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
