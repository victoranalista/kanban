'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { executeFinancialApiRequest } from '../pix/actions/serviceAuth';
import { toast } from 'sonner';

export default function TestePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const handleTestRequest = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await executeFinancialApiRequest('/api/exemplo');
      setResult(JSON.stringify(response, null, 2));
      toast.success('Requisição executada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro';
      setResult(`Erro: ${message}`);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  const handleRenewToken = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await executeFinancialApiRequest('/api/exemplo');
      setResult(JSON.stringify(response, null, 2));
      toast.success('Token renovado e requisição executada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro';
      setResult(`Erro: ${message}`);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teste API Backend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleTestRequest}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Executando...' : 'Fazer Requisição'}
            </Button>
            <Button
              onClick={handleRenewToken}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Renovar Token
            </Button>
          </div>
          {result && (
            <Alert>
              <AlertDescription>
                <pre className="text-xs overflow-auto">{result}</pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
