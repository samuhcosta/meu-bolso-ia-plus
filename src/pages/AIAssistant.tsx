import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Send, MessageCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { transactions, goals, getBalance, getCategoryExpenses } = useFinancial();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Olá, ${user?.name}! Sou seu assistente financeiro inteligente. Posso te ajudar a analisar seus gastos, sugerir economia e responder perguntas sobre suas finanças. Como posso te ajudar hoje?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    const balance = getBalance();
    const categoryExpenses = getCategoryExpenses();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (message.includes('onde gastei') || message.includes('gastos') || message.includes('categoria')) {
      const topCategories = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
      
      if (topCategories.length === 0) {
        return "Você ainda não registrou nenhuma despesa. Que tal começar adicionando suas primeiras transações para que eu possa te ajudar melhor?";
      }
      
      let response = "📊 Aqui está onde você mais gastou:\n\n";
      topCategories.forEach(([category, amount], index) => {
        response += `${index + 1}. ${category}: ${formatCurrency(amount)}\n`;
      });
      
      response += `\n💡 Dica: A categoria "${topCategories[0][0]}" representa ${((topCategories[0][1] / monthlyExpenses) * 100).toFixed(1)}% dos seus gastos totais.`;
      
      return response;
    }

    if (message.includes('economizar') || message.includes('economia') || message.includes('cortar')) {
      if (monthlyExpenses === 0) {
        return "Para te dar dicas de economia, preciso conhecer melhor seus gastos. Adicione algumas transações primeiro!";
      }
      
      const suggestions = [
        "🎯 Defina um orçamento mensal para cada categoria de gasto",
        "📱 Use apps de cashback e cupons de desconto",
        "🍽️ Cozinhe mais em casa - gastos com alimentação fora podem ser reduzidos",
        "💡 Revise assinaturas e serviços que você não usa frequentemente",
        "🚗 Considere usar transporte público ou bike em trajetos curtos"
      ];
      
      return `💰 Baseado nos seus gastos de ${formatCurrency(monthlyExpenses)} este mês, aqui estão minhas sugestões:\n\n${suggestions.slice(0, 3).join('\n')}\n\n🎯 Que tal criar uma meta de economia? Tente economizar 10% dos seus gastos mensais!`;
    }

    if (message.includes('saldo') || message.includes('quanto tenho')) {
      if (balance.balance >= 0) {
        return `💚 Ótimas notícias! Seu saldo atual é de ${formatCurrency(balance.balance)}.\n\nReceitas: ${formatCurrency(balance.income)}\nDespesas: ${formatCurrency(balance.expenses)}\n\n🎯 Continue assim e considere investir parte desse valor!`;
      } else {
        return `🚨 Atenção! Você está com saldo negativo de ${formatCurrency(Math.abs(balance.balance))}.\n\n📊 Receitas: ${formatCurrency(balance.income)}\nDespesas: ${formatCurrency(balance.expenses)}\n\n💡 Vamos trabalhar juntos para equilibrar suas finanças. Que tal revisar seus gastos e criar um plano de economia?`;
      }
    }

    if (message.includes('meta') || message.includes('objetivo')) {
      if (goals.length === 0) {
        return "🎯 Você ainda não tem metas financeiras definidas! Metas são fundamentais para o sucesso financeiro.\n\n✨ Sugestões de metas:\n• Reserva de emergência (6x suas despesas mensais)\n• Viagem dos sonhos\n• Compra de um bem\n\nVamos criar sua primeira meta?";
      }
      
      const activeGoals = goals.filter(g => g.current_amount < g.target_amount);
      return `🎯 Você tem ${goals.length} meta(s) definida(s), sendo ${activeGoals.length} ainda ativa(s).\n\n${goals.slice(0, 2).map(g => {
        const progress = (g.current_amount / g.target_amount) * 100;
        return `• ${g.title}: ${progress.toFixed(1)}% (${formatCurrency(g.current_amount)} de ${formatCurrency(g.target_amount)})`;
      }).join('\n')}\n\n💪 Continue focado! Cada economia te aproxima dos seus objetivos.`;
    }

    if (message.includes('relatório') || message.includes('resumo')) {
      return `📈 Resumo das suas finanças:\n\n💰 Saldo atual: ${formatCurrency(balance.balance)}\n📊 Gastos do mês: ${formatCurrency(monthlyExpenses)}\n🎯 Metas ativas: ${goals.filter(g => g.current_amount < g.target_amount).length}\n📱 Transações registradas: ${transactions.length}\n\n🔍 Para análises mais detalhadas, acesse a seção de Relatórios!`;
    }

    // Respostas padrão
    const defaultResponses = [
      "🤖 Posso te ajudar com várias coisas! Experimente perguntar:\n• 'Onde gastei mais este mês?'\n• 'Como posso economizar?'\n• 'Qual meu saldo atual?'\n• 'Como estão minhas metas?'",
      "💡 Que tal começarmos analisando seus gastos? Digite 'gastos' para ver um resumo das suas despesas por categoria.",
      "🎯 Para te dar dicas mais personalizadas, preciso conhecer melhor seus hábitos financeiros. Você pode me perguntar sobre gastos, economia, metas ou saldo!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInputMessage('');
  };

  const quickQuestions = [
    { text: "Onde gastei mais?", icon: TrendingDown },
    { text: "Como economizar?", icon: TrendingUp },
    { text: "Qual meu saldo?", icon: Bot },
    { text: "Como estão minhas metas?", icon: Target }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assistente IA</h1>
        <p className="text-muted-foreground">
          Conversa inteligente sobre suas finanças
        </p>
      </div>

      {/* Quick Questions */}
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

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-primary" />
            Chat com IA
          </CardTitle>
        </CardHeader>
        
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
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
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta sobre finanças..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium mb-2">💡 Dicas para usar o Assistente IA</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Seja específico: "Gastos com alimentação este mês" é melhor que "gastos"</li>
                <li>• Pergunte sobre análises: "Compare meus gastos dos últimos 3 meses"</li>
                <li>• Peça sugestões: "Como posso economizar em transporte?"</li>
                <li>• Use para metas: "Quanto preciso economizar por mês para minha meta?"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
