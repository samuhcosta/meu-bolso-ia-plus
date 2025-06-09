
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const Plans = () => {
  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Para começar a organizar suas finanças',
      features: [
        'Até 30 lançamentos por mês',
        'Controle básico de receitas e despesas',
        'Categorização manual',
        'Relatórios simples',
        'Suporte por email'
      ],
      limitations: [
        'Sem assistente IA',
        'Sem notificações automáticas',
        'Sem importação de extratos',
        'Sem plano familiar'
      ],
      buttonText: 'Começar Grátis',
      popular: false,
      current: false
    },
    {
      name: 'Pro',
      price: 'R$ 14,90',
      period: '/mês',
      description: 'Para quem quer controle total das finanças',
      features: [
        'Lançamentos ilimitados',
        'Assistente com IA personalizado',
        'Relatórios avançados e gráficos',
        'Metas financeiras inteligentes',
        'Notificações por email',
        'Categorização automática',
        'Análise de tendências',
        'Exportação de relatórios em PDF'
      ],
      limitations: [],
      buttonText: 'Assinar Pro',
      popular: true,
      current: false
    },
    {
      name: 'Premium',
      price: 'R$ 24,90',
      period: '/mês',
      description: 'Solução completa para toda a família',
      features: [
        'Tudo do plano Pro incluído',
        'Plano familiar (até 5 membros)',
        'Notificações por WhatsApp',
        'Importação de extratos com IA',
        'Análises preditivas avançadas',
        'Suporte prioritário',
        'Consultoria financeira mensal',
        'Acesso a conteúdos exclusivos'
      ],
      limitations: [],
      buttonText: 'Assinar Premium',
      popular: false,
      current: false
    }
  ];

  const features = [
    {
      title: 'Assistente IA Personalizado',
      description: 'Receba dicas e análises inteligentes baseadas nos seus hábitos de consumo'
    },
    {
      title: 'Notificações Inteligentes',
      description: 'Alertas automáticos por email e WhatsApp sobre gastos e metas'
    },
    {
      title: 'Relatórios Avançados',
      description: 'Gráficos detalhados e análises de tendências dos seus gastos'
    },
    {
      title: 'Plano Familiar',
      description: 'Compartilhe o controle financeiro com até 5 membros da família'
    },
    {
      title: 'Importação Automática',
      description: 'Upload de extratos bancários com categorização automática via IA'
    },
    {
      title: 'Suporte Premium',
      description: 'Atendimento prioritário e consultoria financeira personalizada'
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
            <Link to="/support">
              <Button variant="ghost" size="sm">Suporte</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha o plano ideal para
              <span className="text-gradient block">suas necessidades</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Todos os planos incluem segurança total dos seus dados e acesso pelo celular e computador
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative transition-all hover:shadow-lg ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-secondary">✅ Incluído</h4>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-muted-foreground">❌ Não incluído</h4>
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="w-5 h-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0">✗</span>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4">
                    <Link to="/register" className="block">
                      <Button 
                        className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Recursos que fazem a diferença
            </h2>
            <p className="text-xl text-muted-foreground">
              Funcionalidades desenvolvidas para transformar sua relação com o dinheiro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-muted/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-muted-foreground text-sm">
                  Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento 
                  e continuar usando até o final do período pago.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Como funciona o plano familiar?</h3>
                <p className="text-muted-foreground text-sm">
                  No plano Premium, você pode adicionar até 5 membros da família. 
                  Cada um terá sua conta individual, mas compartilharão os dados financeiros.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Meus dados estão seguros?</h3>
                <p className="text-muted-foreground text-sm">
                  Absolutamente! Usamos criptografia de ponta e seguimos todas as 
                  normas de segurança bancária para proteger suas informações.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Posso mudar de plano depois?</h3>
                <p className="text-muted-foreground text-sm">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As mudanças são aplicadas na próxima cobrança.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para transformar suas finanças?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Comece hoje mesmo com 7 dias grátis do plano Pro
            </p>
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                Começar Agora Grátis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
