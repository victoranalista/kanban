import { prismaNeon } from "@/lib/prismaNeon"
import { SaleOrigin } from "@prisma/client"
import OpenAI from "openai"
import { GeneratedCard } from "@/app/dashboard/kanban/types"

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OpenAI API key not configured")
  return new OpenAI({ apiKey })
}

export const generateCardsFromSlackMessage = async (message: string): Promise<GeneratedCard[]> => {
  const openai = getOpenAIClient()
  const prompt = `Você é um especialista em metodologia ágil quebrando funcionalidades/problemas em cards de desenvolvimento.

CONTEXTO DO PROJETO:
- Stack: TypeScript, Next.js 16, NextAuth 5, React 19, Neon PostgreSQL, Prisma, shadcn/ui, Tailwind
- Padrão de pastas: app/funcionalidade/{components, actions, validators, types, page.tsx}
- Jornada de trabalho: 8 horas/dia, segunda a sexta
- Cada card deve ter entre 2-3 dias de duração (16-24 horas de trabalho)
- Código deve ser seguro, performático, com boa UX e legibilidade
- Usar server actions (React 19), arrow functions, funções pequenas (máx 10 linhas)
- Princípios: SOLID, DRY, KISS
- A aplicação já tem login e estrutura pronta para novas funcionalidades

Mensagem do usuário (pode ser funcionalidade nova ou problema a resolver):
${message}

REGRAS DE QUEBRA:
- Cada card: 2-3 dias (16-24 horas de trabalho)
- Escopo bem definido e testável
- Linguagem clara e objetiva em português
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

export const refineCardsFromFeedback = async (
  originalCards: GeneratedCard[],
  feedback: string
): Promise<GeneratedCard[]> => {
  const openai = getOpenAIClient()
  const prompt = `Você é um especialista em metodologia ágil. O usuário quer modificar os cards gerados.

CARDS ATUAIS:
${JSON.stringify(originalCards, null, 2)}

FEEDBACK DO USUÁRIO (o que ele quer mudar):
${feedback}

REGRAS:
- Cada card: 2-3 dias (16-24 horas de trabalho)
- Escopo bem definido e testável
- Especificação técnica com arquivos a criar/modificar
- Manter o que não foi solicitado mudança

Retorne JSON com os cards atualizados:
{"cards": [{"name": "...", "specification": "...", "objective": "...", "acceptanceCriteria": "...", "estimatedHours": 16-24}]}`
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Você refina cards ágeis baseado em feedback." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
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

export const createCardsInKanban = async (cards: GeneratedCard[], saleOrigin: SaleOrigin): Promise<number> => {
  const board = await prismaNeon.kanbanBoard.findUnique({
    where: { saleOrigin },
    include: { columns: { where: { order: 0 }, take: 1 } },
  })
  if (!board) {
    const newBoard = await prismaNeon.kanbanBoard.create({
      data: {
        saleOrigin,
        teamSize: 3,
        columns: {
          create: [
            { title: "Backlog", order: 0, wipLimit: null },
            { title: "Specify", order: 1, wipLimit: 2 },
            { title: "Implement", order: 2, wipLimit: 2 },
            { title: "Validate", order: 3, wipLimit: 2 },
            { title: "Deploy", order: 4, wipLimit: 2 },
          ],
        },
      },
      include: { columns: { where: { order: 0 }, take: 1 } },
    })
    return createCardsInColumn(cards, newBoard.columns[0].id)
  }
  return createCardsInColumn(cards, board.columns[0].id)
}

const createCardsInColumn = async (cards: GeneratedCard[], columnId: string): Promise<number> => {
  const lastCard = await prismaNeon.kanbanCard.findFirst({
    where: { columnId },
    orderBy: { position: "desc" },
  })
  let position = lastCard ? lastCard.position + 1000 : 1000
  for (const card of cards) {
    await prismaNeon.kanbanCard.create({
      data: {
        columnId,
        name: card.name,
        specification: card.specification,
        objective: card.objective,
        acceptanceCriteria: card.acceptanceCriteria,
        estimatedHours: card.estimatedHours,
        position,
        isNext: false,
      },
    })
    position += 1000
  }
  return cards.length
}
