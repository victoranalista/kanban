# Integração Slack - Kanban

## Configuração do Slack App

### 1. Criar o App no Slack
1. Acesse https://api.slack.com/apps
2. Clique em "Create New App" → "From scratch"
3. Nome: "Kanban Bot"
4. Selecione o workspace

### 2. OAuth & Permissions
Adicione os seguintes Bot Token Scopes:
- `app_mentions:read` - Ler quando o bot é mencionado
- `chat:write` - Enviar mensagens
- `channels:history` - Ler mensagens de canais
- `groups:history` - Ler mensagens de grupos privados

### 3. Event Subscriptions
1. Enable Events: ON
2. Request URL: `https://seu-dominio.vercel.app/api/slack`
3. Subscribe to bot events:
   - `app_mention` - Quando o bot é mencionado
   - `message.channels` - Mensagens em canais (para threads)

### 4. Interactivity & Shortcuts
1. Interactivity: ON
2. Request URL: `https://seu-dominio.vercel.app/api/slack/interactions`

### 5. Instalar o App
1. Install to Workspace
2. Copie o "Bot User OAuth Token" (começa com `xoxb-`)

## Variáveis de Ambiente

Adicione no `.env.local` e na Vercel:

```env
# Slack
SLACK_BOT_TOKEN=xoxb-xxx-xxx-xxx
SLACK_AUTH_TOKEN=xoxp-xxx-xxx-xxx
SLACK_SIGNING_SECRET=xxx
```

**Observação**: Os canais permitidos e usuários autorizados estão hardcoded no arquivo `app/api/slack/config/channel-mapping.ts` por questões de segurança.

## Canais Configurados

Os seguintes canais estão configurados (hardcoded) no sistema:

- **Direito Internacional** (`C084YBSS8N5`) → `INTERNATIONAL_LAW`
- **Direito de Família** (`C084L5E20UD`) → `FAMILY_LAW`
- **Direito Bancário** (`C084C7HQNQ0`) → `BANKING_LAW`
- **Direito Processual** (`C084L5E0MPZ`) → `PROCEDURAL_LAW`
- **Administrativo** (`C084M3YF4GZ`) → `ADMINISTRATIVE`

Apenas os usuários cadastrados (assistentes e substitutos) podem usar o bot nesses canais.

## Como Usar

### Criar Cards
1. Adicione o bot ao canal desejado (`/invite @Kanban Bot`)
2. Mencione o bot com a descrição da funcionalidade:
   ```
   @Kanban Bot Criar uma página de relatórios financeiros com filtros por data, exportação para PDF e gráficos de tendência
   ```

### Fluxo de Aprovação
1. O bot gera os cards e envia para aprovação
2. Você pode:
   - ✅ **Aprovar**: Clique no botão verde para criar os cards no Kanban
   - ❌ **Rejeitar**: Clique no botão vermelho para cancelar
   - 📝 **Solicitar alterações**: Responda na thread com o que deseja mudar

### Exemplo de Alteração
```
@Kanban Bot Criar sistema de notificações push para usuários
```

Bot responde com os cards...

Você responde na thread:
```
Divida o primeiro card em dois: um para backend e outro para frontend. E adicione um card para testes.
```

Bot gera nova versão dos cards...

Você aprova.

## Estrutura de Arquivos

```
app/api/slack/
├── route.ts                    # Endpoint principal (eventos)
├── interactions/
│   └── route.ts                # Endpoint de interações (botões)
├── config/
│   └── channel-mapping.ts      # Mapeamento canal → unidade
├── lib/
│   ├── slack-client.ts         # Cliente Slack (post, update)
│   ├── message-blocks.ts       # Blocos de mensagem formatados
│   ├── pending-store.ts        # Armazenamento de aprovações pendentes
│   └── card-generator.ts       # Geração de cards via IA
└── types/
    └── index.ts                # Tipos TypeScript
```

## Segurança

- ✅ Verificação de assinatura do Slack em produção
- ✅ Mapeamento fixo de canais → unidades (não confia no usuário)
- ✅ Apenas o criador da solicitação pode aprovar
- ✅ Aprovações expiram em 24 horas
