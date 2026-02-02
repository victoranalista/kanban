#!/bin/bash

# Teste de menção do bot
# Substitua YOUR_APP_URL pela URL do seu app na Vercel

APP_URL="${1:-http://localhost:3000}"
CHANNEL_ID="${2:-C084YBSS8N5}"
USER_ID="${3:-U4DHS9FB6}"

echo "Testando Slack Bot..."
echo "URL: $APP_URL"
echo "Canal: $CHANNEL_ID"
echo "Usuário: $USER_ID"
echo ""

# Simula um app_mention event
curl -X POST "$APP_URL/api/slack" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"event_callback\",
    \"event\": {
      \"type\": \"app_mention\",
      \"user\": \"$USER_ID\",
      \"text\": \"<@U123456> Criar sistema de notificações push\",
      \"ts\": \"$(date +%s).000000\",
      \"channel\": \"$CHANNEL_ID\",
      \"event_ts\": \"$(date +%s).000000\"
    }
  }"

echo ""
echo "Verifique os logs na Vercel!"
