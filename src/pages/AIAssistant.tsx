import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, MessageCircle, TrendingUp, TrendingDown, Target, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: `Olá, ${user?.name || 'usuário'}! Sou seu assistente financeiro inteligente. Posso te ajudar a analisar seus gastos, criar transações, acompanhar suas metas e muito mais. Como posso te ajudar hoje?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: text,
          history,
          geminiKey: import.meta.env.VITE_GEMINI_API_KEY || null
        }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Erro ao processar mensagem');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível processar sua mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    { text: "Onde gastei mais?", icon: TrendingDown },
    { text: "Como economizar?", icon: TrendingUp },
    { text: "Qual meu saldo?", icon: Bot },
    { text: "Resumo financeiro", icon: Target }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assistente IA</h1>
        <p className="text-muted-foreground">
          Conversa inteligente sobre suas finanças com Gemini AI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perguntas Rápidas</CardTitle>
          <CardDescription>
            Clique em uma pergunta ou digite sua própria mensagem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={() => setInputMessage(question.text)}
              >
                <question.icon className="w-4 h-4" />
                <span className="text-xs text-center">{question.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-primary" />
            Chat com IA
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'model' && (
                    <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                  )}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta sobre finanças..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium mb-2">💡 O que a IA pode fazer agora</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Analisar gastos:</strong> "Onde gastei mais este mês?"</li>
                <li>• <strong>Criar transações:</strong> "Registre uma despesa de R$ 50 de transporte"</li>
                <li>• <strong>Ver saldo:</strong> "Qual meu saldo atual?"</li>
                <li>• <strong>Acompanhar metas e dívidas:</strong> "Como estão minhas metas?"</li>
                <li>• <strong>Dicas de economia:</strong> "Como posso economizar?"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
