"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Sparkles, Clock, FileText, Target, CheckCircle2 } from "lucide-react"
import { specifyCard } from "../actions/ai-actions"
import { createCard } from "../actions/card-actions"
import { GeneratedCard } from "../types"
import { toast } from "sonner"

type CreateCardModalProps = {
  isOpen: boolean
  onClose: () => void
  columnId: string
  onCardCreated: () => void
}

export const CreateCardModal = ({ isOpen, onClose, columnId, onCardCreated }: CreateCardModalProps) => {
  const [description, setDescription] = useState("")
  const [isSpecifying, setIsSpecifying] = useState(false)
  const [specifiedCard, setSpecifiedCard] = useState<GeneratedCard | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const resetForm = () => {
    setDescription("")
    setSpecifiedCard(null)
  }
  const handleSpecify = async () => {
    if (description.length < 5) {
      toast.error("Descreva o que deseja criar (mínimo 5 caracteres)")
      return
    }
    setIsSpecifying(true)
    try {
      const card = await specifyCard(description)
      setSpecifiedCard(card)
    } catch {
      toast.error("Erro ao especificar card")
    } finally {
      setIsSpecifying(false)
    }
  }
  const handleCreate = async () => {
    if (!specifiedCard) return
    setIsCreating(true)
    try {
      await createCard({ columnId, ...specifiedCard })
      toast.success("Card criado com sucesso")
      onCardCreated()
      resetForm()
      onClose()
    } catch {
      toast.error("Erro ao criar card")
    } finally {
      setIsCreating(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Criar Card
          </DialogTitle>
          <DialogDescription>
            Descreva o que deseja criar e a IA irá especificar. Cards têm 3 dias (24h).
          </DialogDescription>
        </DialogHeader>
        {!specifiedCard ? (
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Ex: Criar página de perfil do usuário com edição de dados..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSpecify} disabled={isSpecifying}>
                {isSpecifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Especificando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Especificar
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{specifiedCard.name}</h3>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {specifiedCard.estimatedHours}h (3 dias)
              </Badge>
            </div>
            <ScrollArea className="h-64 rounded-md border p-3">
              <div className="space-y-4">
                <Section icon={<FileText className="h-4 w-4" />} title="Especificação">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{specifiedCard.specification}</p>
                </Section>
                <Separator />
                <Section icon={<Target className="h-4 w-4" />} title="Objetivo">
                  <p className="text-sm text-muted-foreground">{specifiedCard.objective}</p>
                </Section>
                <Separator />
                <Section icon={<CheckCircle2 className="h-4 w-4" />} title="Critérios de Aceitação">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{specifiedCard.acceptanceCriteria}</p>
                </Section>
              </div>
            </ScrollArea>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSpecifiedCard(null)}>
                Voltar
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Card"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <h4 className="flex items-center gap-2 text-sm font-medium">
      {icon}
      {title}
    </h4>
    {children}
  </div>
)
