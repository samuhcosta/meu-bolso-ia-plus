
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFinancial } from '@/contexts/FinancialContext';
import { 
  Upload, 
  FileText, 
  Bot, 
  CheckCircle, 
  AlertCircle,
  Download
} from 'lucide-react';

const Import = () => {
  const { addTransaction } = useFinancial();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedTransactions, setProcessedTransactions] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Apenas arquivos PDF, CSV e Excel são aceitos.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      toast({
        title: "Arquivo carregado!",
        description: "Clique em 'Processar com IA' para analisar o extrato.",
      });
    }
  };

  const processWithAI = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate processed transactions
    const mockTransactions = [
      {
        date: '2024-01-15',
        description: 'SUPERMERCADO XYZ',
        amount: 156.80,
        category: 'Alimentação',
        type: 'expense'
      },
      {
        date: '2024-01-14',
        description: 'POSTO COMBUSTIVEL',
        amount: 89.50,
        category: 'Transporte',
        type: 'expense'
      },
      {
        date: '2024-01-13',
        description: 'FARMACIA POPULAR',
        amount: 45.20,
        category: 'Saúde',
        type: 'expense'
      },
      {
        date: '2024-01-12',
        description: 'PIX RECEBIDO',
        amount: 500.00,
        category: 'Transferência',
        type: 'income'
      },
      {
        date: '2024-01-10',
        description: 'RESTAURANTE ABC',
        amount: 67.90,
        category: 'Alimentação',
        type: 'expense'
      }
    ];

    setProcessedTransactions(mockTransactions);
    setIsProcessing(false);

    toast({
      title: "Processamento concluído!",
      description: `${mockTransactions.length} transações identificadas e categorizadas.`,
    });
  };

  const importTransactions = () => {
    processedTransactions.forEach(transaction => {
      addTransaction({
        type: transaction.type as 'income' | 'expense',
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date
      });
    });

    toast({
      title: "Transações importadas!",
      description: `${processedTransactions.length} transações foram adicionadas com sucesso.`,
    });

    // Reset state
    setUploadedFile(null);
    setProcessedTransactions([]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Importar Extratos</h1>
        <p className="text-muted-foreground">
          Use IA para processar e categorizar automaticamente seus extratos bancários
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload de Extrato
          </CardTitle>
          <CardDescription>
            Envie seu extrato em PDF, CSV ou Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Arraste o arquivo aqui ou clique para selecionar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Formatos aceitos: PDF, CSV, Excel (máx. 10MB)
            </p>
            <input
              type="file"
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild>
                <span>Selecionar Arquivo</span>
              </Button>
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button onClick={processWithAI} disabled={isProcessing}>
                <Bot className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Processar com IA'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <div>
                <h3 className="font-medium">Processando extrato...</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa IA está analisando e categorizando suas transações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Results */}
      {processedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-secondary" />
              Transações Processadas
            </CardTitle>
            <CardDescription>
              Revise e confirme as transações antes de importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {processedTransactions.length} transações encontradas
                </p>
                <Button onClick={importTransactions}>
                  Importar Todas
                </Button>
              </div>

              <div className="space-y-3">
                {processedTransactions.map((transaction, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-secondary/10' : 'bg-destructive/10'
                      }`}>
                        {transaction.type === 'income' ? (
                          <CheckCircle className="w-4 h-4 text-secondary" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'income' ? 'text-secondary' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Como funciona a IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">1. Upload</h3>
              <p className="text-sm text-muted-foreground">
                Envie seu extrato em PDF ou CSV
              </p>
            </div>
            <div className="text-center">
              <Bot className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">2. Processamento</h3>
              <p className="text-sm text-muted-foreground">
                IA analisa e categoriza automaticamente
              </p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium mb-1">3. Importação</h3>
              <p className="text-sm text-muted-foreground">
                Revise e importe as transações
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">💡 Dicas para melhor resultado:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use extratos com pelo menos 30 dias de movimentação</li>
              <li>• Certifique-se que o arquivo está legível e não protegido por senha</li>
              <li>• Para PDFs, prefira os gerados digitalmente ao invés de escaneados</li>
              <li>• A IA aprende com suas correções para melhorar futuros processamentos</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Sample File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Arquivo de Exemplo
          </CardTitle>
          <CardDescription>
            Baixe um modelo de CSV para testar a funcionalidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => {
            const csvContent = `Data,Descrição,Valor,Tipo\n2024-01-15,Supermercado XYZ,-156.80,Despesa\n2024-01-14,Posto de Combustível,-89.50,Despesa\n2024-01-13,PIX Recebido,500.00,Receita\n2024-01-12,Farmácia Popular,-45.20,Despesa`;
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exemplo-extrato.csv';
            a.click();
            window.URL.revokeObjectURL(url);
          }}>
            <Download className="w-4 h-4 mr-2" />
            Baixar CSV de Exemplo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Import;
