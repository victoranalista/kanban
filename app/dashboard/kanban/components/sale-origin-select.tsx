"use client"
import { SaleOrigin } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SaleOriginSelectProps = {
  value: SaleOrigin
  onChange: (value: SaleOrigin) => void
}

const saleOriginLabels: Record<SaleOrigin, string> = {
  INTERNATIONAL_LAW: "Direito Internacional",
  FAMILY_LAW: "Direito de Família",
  BANKING_LAW: "Direito Bancário",
  PROCEDURAL_LAW: "Direito Processual",
  ADMINISTRATIVE: "Administrativo",
}

export const SaleOriginSelect = ({ value, onChange }: SaleOriginSelectProps) => {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SaleOrigin)}>
      <SelectTrigger className="w-48 h-9">
        <SelectValue placeholder="Selecione uma unidade" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(saleOriginLabels).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
