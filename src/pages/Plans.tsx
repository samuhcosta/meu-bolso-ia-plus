
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, DollarSign, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const { checkout, subscription } = useSubscription();

  const PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY;
  const PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_ANNUAL;

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
      await checkout(priceId);
    } finally {
      setLoadingPriceId(null);
    }
  };

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
        'Sem importação de extratos'
      ],
      buttonText: 'Começar Grátis',
      priceId: null,
      popular: false
    },
    {
      name: 'Pro',
      price: isAnnual ? 'R$ 149,00' : 'R$ 14,90',
      period: isAnnual ? '/ano' : '/mês',
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
      buttonText: subscription?.stripe_price_id === (isAnnual ? PRICE_ID_ANNUAL : PRICE_ID_MONTHLY) ? 'Plano Atual' : 'Assinar Pro',
      priceId: isAnnual ? PRICE_ID_ANNUAL : PRICE_ID_MONTHLY,
      popular: true,
      savings: isAnnual ? 'Economize 17%' : null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 bg-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Meu Bolso Pro</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Voltar ao App</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha o plano ideal para
              <span className="text-gradient block">suas necessidades</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transforme sua vida financeira com ferramentas inteligentes e suporte completo.
            </p>

            {/* Toggle Billing */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Label htmlFor="billing-toggle" className={!isAnnual ? "font-bold" : "text-muted-foreground"}>Mensal</Label>
              <Switch 
                id="billing-toggle" 
                checked={isAnnual} 
                onCheckedChange={setIsAnnual} 
              />
              <Label htmlFor="billing-toggle" className={isAnnual ? "font-bold" : "text-muted-foreground"}>
                Anual <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Economize 17%</span>
              </Label>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 mb-16 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative transition-all hover:shadow-xl flex-1 flex flex-col ${
                  plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''
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
                  <CardDescription className="text-base h-12">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-grow">
                  <div className="space-y-3">
                    <h4 className="font-medium text-primary">✅ Funcionalidades</h4>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
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
                </CardContent>

                <div className="p-6 pt-0 mt-auto">
                  {plan.priceId ? (
                    <Button 
                      className="w-full text-lg h-12"
                      onClick={() => handleSubscribe(plan.priceId!)}
                      disabled={loadingPriceId === plan.priceId || subscription?.stripe_price_id === plan.priceId}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {loadingPriceId === plan.priceId ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : null}
                      {plan.buttonText}
                    </Button>
                  ) : (
                    <Link to="/dashboard" className="block">
                      <Button 
                        className="w-full text-lg h-12"
                        variant="outline"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { title: 'Assistente IA', desc: 'Dicas personalizadas para economizar mais.' },
              { title: 'Relatórios PDF', desc: 'Exporte seus gastos com um clique.' },
              { title: 'Metas Inteligentes', desc: 'Acompanhe seu progresso em tempo real.' },
              { title: 'Suporte VIP', desc: 'Atendimento prioritário via WhatsApp.' },
              { title: 'Segurança Total', desc: 'Dados criptografados com padrão bancário.' },
              { title: 'Multi-dispositivo', desc: 'Acesse de qualquer lugar, a qualquer hora.' }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
