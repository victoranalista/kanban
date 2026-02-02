"use server"
import { prismaNeon } from "@/lib/prismaNeon"
import OpenAI from "openai"
import { generateCardsSchema } from "../validators"
import { GeneratedCard } from "../types"
import { z } from "zod"

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OpenAI API key not configured")
  return new OpenAI({ apiKey })
}

const specifyCardSchema = z.object({
  description: z.string().min(5).max(500),
})

export const specifyCard = async (description: string) => {
  const validated = specifyCardSchema.parse({ description })
  const openai = getOpenAIClient()
  const prompt = `Você é um especialista em metodologia ágil. Especifique um card de desenvolvimento.

CONTEXTO:
- Stack: TypeScript, Next.js 16, NextAuth 5, React 19, Neon PostgreSQL, Prisma, shadcn/ui, Tailwind
- Padrão de pastas: app/funcionalidade/{components, actions, validators, types, page.tsx}
- Jornada: 8 horas/dia, segunda a sexta
- Cada card SEMPRE tem 3 dias de duração (24 horas de trabalho)
- Código seguro, performático, boa UX e legibilidade
- Server actions (React 19), arrow functions, funções pequenas (máx 10 linhas)
- Princípios: SOLID, DRY, KISS
- Autenticação obrigatória em todas as server actions

Descrição do usuário:
${validated.description}

REGRAS:
- Gerar nome curto (máx 60 chars)
- Especificação técnica detalhada com arquivos a criar/modificar
- Objetivo claro e mensurável
- Critérios de aceitação específicos
- SEMPRE 24 horas (3 dias x 8h)

Retorne JSON:
{"name": "Nome curto", "specification": "Especificação técnica", "objective": "Objetivo", "acceptanceCriteria": "Critérios", "estimatedHours": 24}`
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Você especifica cards ágeis de 3 dias (24h) para desenvolvimento." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  })
  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("No response from OpenAI")
  return JSON.parse(content) as GeneratedCard
}

export const generateCardsFromFeature = async (featureDescription: string, boardId: string) => {
  const validated = generateCardsSchema.parse({ featureDescription, boardId })
  const board = await prismaNeon.kanbanBoard.findUnique({
    where: { id: validated.boardId },
  })
  if (!board) throw new Error("Board not found")
  const openai = getOpenAIClient()
  const prompt = `Você é um especialista em metodologia ágil quebrando funcionalidades em cards.

CONTEXTO DO PROJETO:
- Stack: TypeScript, Next.js 16, NextAuth 5, React 19, Neon PostgreSQL, Prisma, shadcn/ui, Tailwind
- Padrão de pastas: app/funcionalidade/{components, actions, validators, types, page.tsx}
- Jornada de trabalho: 8 horas/dia, segunda a sexta
- Cada card deve ter entre 2-3 dias de duração (16-24 horas de trabalho)
- Código deve ser seguro, performático, com boa UX e legibilidade
- Usar server actions (React 19), arrow functions, funções pequenas (máx 10 linhas)
- Princípios: SOLID, DRY, KISS
- A aplicação já tem login e estrutura pronta para novas funcionalidades

Funcionalidade solicitada:
${validated.featureDescription}

REGRAS DE QUEBRA:
- Cada card: 2-3 dias (16-24 horas de trabalho)
- Escopo bem definido e testável
- Linguagem clara e objetiva
- Entregas incrementais de valor
- Considerar autenticação em todas as server actions
- Especificação técnica com arquivos a criar/modificar

Retorne JSON:
{"cards": [{"name": "Nome curto (máx 60 chars)", "specification": "Especificação técnica detalhada com arquivos", "objective": "Objetivo claro do deliverable", "acceptanceCriteria": "Critérios mensuráveis de conclusão", "estimatedHours": 16-24}]}`
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Você é um assistente especializado em quebrar funcionalidades em cards ágeis." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })
  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("No response from OpenAI")
  const parsed = JSON.parse(content)
  const cards: GeneratedCard[] = Array.isArray(parsed.cards) ? parsed.cards : parsed
  return cards.filter(
    (c): c is GeneratedCard =>
      typeof c.name === "string" &&
      typeof c.specification === "string" &&
      typeof c.objective === "string" &&
      typeof c.acceptanceCriteria === "string" &&
      typeof c.estimatedHours === "number"
  )
}
