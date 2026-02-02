'use client';
import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar, Clock } from 'lucide-react';
import { CreateTokenModal } from './createTokenModal';
import { toggleApiToken } from '../actions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

interface Token {
  id: number;
  name: string;
  active: boolean | null;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface TokensManagerProps {
  tokens: Token[];
}

const getStatusColor = (token: Token): BadgeVariant => {
  if (token.active === false) return 'destructive';
  if (token.expiresAt && token.expiresAt < new Date()) return 'secondary';
  return 'default';
};

const getStatusText = (token: Token): string => {
  if (token.active === false) return 'Inativo';
  if (token.expiresAt && token.expiresAt < new Date()) return 'Expirado';
  return 'Ativo';
};

export const TokensManager = ({ tokens }: TokensManagerProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState<number | null>(null);
  const handleToggleToken = useCallback(async (tokenId: number) => {
    setLoading(tokenId);
    try {
      await toggleApiToken(tokenId.toString());
      toast.success('Status do token atualizado');
    } catch {
      toast.error('Erro ao atualizar token');
    } finally {
      setLoading(null);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Os tokens são criados para autenticar requisições à API.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="w-full sm:w-auto sm:min-w-32"
        >
          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
          Novo Token
        </Button>
      </div>

      <div className="grid gap-4">
        {tokens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-muted-foreground mb-4 text-center text-sm sm:text-base">
                Nenhum token criado ainda
              </p>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                Criar Primeiro Token
              </Button>
            </CardContent>
          </Card>
        ) : (
          tokens.map((token) => (
            <Card key={token.id} className="w-full">
              <CardHeader className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 pb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-sm sm:text-base font-medium truncate pr-2">
                      {token.name}
                    </CardTitle>
                    <Badge
                      variant={getStatusColor(token)}
                      className="flex-shrink-0"
                    >
                      {getStatusText(token)}
                    </Badge>
                  </div>
                  <CardDescription className="flex flex-col gap-2">
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      Criado em {formatDate(token.createdAt)}
                    </span>
                    {token.lastUsedAt && (
                      <span className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        Usado em {formatDate(token.lastUsedAt)}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={token.active !== false}
                    onCheckedChange={() => handleToggleToken(token.id)}
                    disabled={loading === token.id}
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {token.active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateTokenModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </>
  );
};
