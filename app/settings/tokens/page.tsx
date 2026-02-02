import { getApiTokens } from './actions';
import { TokensManager } from './components/tokensManager';

export default async function TokensPage() {
  const tokens = await getApiTokens();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tokens de API</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie tokens para integração com sistemas externos
          </p>
        </div>
      </div>
      <TokensManager tokens={tokens} />
    </div>
  );
}
