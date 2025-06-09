
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  DollarSign,
  HelpCircle,
  BookOpen,
  Video,
  Clock,
  CheckCircle
} from 'lucide-react';

const Support = () => {
  const faqs = [
    {
      question: "Como funciona o plano gratuito?",
      answer: "O plano gratuito permite até 30 transações por mês, controle básico de receitas e despesas, categorização manual e relatórios simples. É ideal para quem está começando a organizar as finanças."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento através das configurações da conta e continuar usando até o final do período pago."
    },
    {
      question: "Como funciona o assistente com IA?",
      answer: "Nosso assistente IA analisa seus hábitos de consumo e fornece dicas personalizadas, categoriza transações automaticamente e responde perguntas sobre suas finanças."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim! Utilizamos criptografia de ponta (256-bit SSL) e seguimos todas as normas de segurança bancária. Seus dados nunca são compartilhados com terceiros."
    },
    {
      question: "Como importar extratos bancários?",
      answer: "No plano Premium, você pode fazer upload de extratos em PDF ou CSV. Nossa IA processa automaticamente e categoriza as transações para você."
    },
    {
      question: "Posso usar em família?",
      answer: "Sim! O plano Premium permite até 5 membros da família, cada um com seu próprio acesso e permissões personalizadas."
    }
  ];

  const resources = [
    {
      icon: Video,
      title: "Vídeos Tutoriais",
      description: "Aprenda a usar todas as funcionalidades",
      link: "#"
    },
    {
      icon: BookOpen,
      title: "Guia Completo",
      description: "Manual detalhado de uso do sistema",
      link: "#"
    },
    {
      icon: MessageCircle,
      title: "Blog Financeiro",
      description: "Dicas e artigos sobre finanças pessoais",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Meu Bolso Pro</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/plans">
              <Button variant="ghost" size="sm">Planos</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Como podemos te
              <span className="text-gradient block">ajudar hoje?</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos aqui para garantir que você tenha a melhor experiência com o Meu Bolso Pro
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chat WhatsApp</h3>
                <p className="text-muted-foreground mb-4">
                  Fale conosco pelo WhatsApp para suporte rápido
                </p>
                <Button className="w-full">
                  Abrir WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Seg-Sex: 9h às 18h
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground mb-4">
                  Envie sua dúvida por email
                </p>
                <Button variant="outline" className="w-full">
                  contato@meubolsopro.com
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Resposta em até 24h
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Telefone</h3>
                <p className="text-muted-foreground mb-4">
                  Suporte por telefone (Premium)
                </p>
                <Button variant="outline" className="w-full">
                  (11) 9999-9999
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Seg-Sex: 9h às 17h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle>Envie sua Mensagem</CardTitle>
              <CardDescription>
                Preencha o formulário e nossa equipe entrará em contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <Input placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input type="email" placeholder="seu@email.com" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Assunto</label>
                  <Input placeholder="Como podemos ajudar?" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem</label>
                  <Textarea 
                    placeholder="Descreva sua dúvida ou problema detalhadamente..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button type="submit">
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
              <p className="text-xl text-muted-foreground">
                Respostas para as dúvidas mais comuns
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium mb-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Recursos Úteis</h2>
              <p className="text-xl text-muted-foreground">
                Materiais para aproveitar ao máximo o sistema
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <resource.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground mb-4">{resource.description}</p>
                    <Button variant="outline" size="sm">
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Status */}
          <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Sistema Operacional</h3>
              <p className="text-muted-foreground mb-4">
                Todos os serviços funcionando normalmente
              </p>
              <Button variant="outline" size="sm">
                Ver Status Detalhado
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;
