
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Star, DollarSign, Loader2, Zap, Tag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const { checkout, subscription } = useSubscription();

  const PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY;
  const PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_ANNUAL;
  const PRICE_ID_MONTHLY_PROMO = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY_PROMO;
  const PRICE_ID_ANNUAL_PROMO = import.meta.env.VITE_STRIPE_PRICE_ID_ANNUAL_PROMO;
  const COUPON_CODE = 'PROMO40OFF';

  const hasCoupon = appliedCoupon.toUpperCase() === COUPON_CODE;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === COUPON_CODE) {
      setAppliedCoupon(couponCode.toUpperCase());
    } else {
      setAppliedCoupon('');
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon('');
  };

  const normalMonthly = 49.90;
  const normalAnnual = 538.90;
  const couponMonthly = 29.90;
  const couponAnnual = 322.90;

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
      await checkout(priceId);
    } finally {
      setLoadingPriceId(null);
    }
  };

  const currentPriceId = hasCoupon
    ? isAnnual ? PRICE_ID_ANNUAL_PROMO : PRICE_ID_MONTHLY_PROMO
    : isAnnual ? PRICE_ID_ANNUAL : PRICE_ID_MONTHLY;
  const isCurrentPlan = subscription?.stripe_price_id === currentPriceId && subscription?.status === 'active';

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '',
      description: 'Teste o sistema por 5 dias com acesso completo',
      features: [
        '5 dias de acesso completo',
        'Controle de receitas e despesas',
        'Categorização manual',
        'Dashboard financeiro',
      ],
      limitations: [
        'Acesso limitado a 5 dias',
        'Sem assistente IA após teste',
        'Sem relatórios avançados',
      ],
      buttonText: 'Começar Teste Grátis',
      priceId: null,
      popular: false,
    },
    {
      name: 'Pro',
      price: hasCoupon
        ? isAnnual
          ? `R$ ${couponAnnual.toFixed(2).replace('.', ',')}`
          : `R$ ${couponMonthly.toFixed(2).replace('.', ',')}`
        : isAnnual
          ? `R$ ${normalAnnual.toFixed(2).replace('.', ',')}`
          : `R$ ${normalMonthly.toFixed(2).replace('.', ',')}`,
      originalPrice: hasCoupon
        ? isAnnual
          ? `R$ ${normalAnnual.toFixed(2).replace('.', ',')}`
          : `R$ ${normalMonthly.toFixed(2).replace('.', ',')}`
        : null,
      period: isAnnual ? '/ano' : '/mês',
      description: isAnnual
        ? hasCoupon
          ? `Equivale a R$ ${(couponAnnual / 12).toFixed(2).replace('.', ',')}/mês`
          : `Equivale a R$ ${(normalAnnual / 12).toFixed(2).replace('.', ',')}/mês`
        : 'Acesso completo a todas as funcionalidades',
      features: [
        'Lançamentos ilimitados',
        'Assistente com IA personalizado',
        'Relatórios avançados e gráficos',
        'Metas financeiras inteligentes',
        'Notificações por email',
        'Categorização automática com IA',
        'Análise de tendências de gastos',
        'Exportação de relatórios em PDF',
        'Importação de extratos bancários',
        'Suporte prioritário',
      ],
      limitations: [],
      buttonText: isCurrentPlan ? 'Plano Atual' : 'Assinar Agora',
      priceId: currentPriceId,
      popular: true,
      savings: isAnnual
        ? hasCoupon
          ? `Economize R$ ${((couponMonthly * 12) - couponAnnual).toFixed(2).replace('.', ',')}/ano`
          : `Economize R$ ${((normalMonthly * 12) - normalAnnual).toFixed(2).replace('.', ',')}/ano`
        : null,
    },
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
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Desbloqueie o poder do
              <span className="text-gradient block">Meu Bolso Pro</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Controle total das suas finanças com inteligência artificial, relatórios avançados e muito mais.
            </p>

            {/* Toggle Billing */}
            <div className="flex items-center justify-center space-x-4 mb-2">
              <Label htmlFor="billing-toggle" className={!isAnnual ? "font-bold text-base" : "text-muted-foreground text-base"}>Mensal</Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <Label htmlFor="billing-toggle" className={isAnnual ? "font-bold text-base" : "text-muted-foreground text-base"}>
                Anual
              </Label>
            </div>
            {isAnnual && (
              <p className="text-sm text-primary font-medium">
                💰 Economize R$ {((normalMonthly * 12) - normalAnnual).toFixed(2).replace('.', ',')} por ano pagando anualmente!
              </p>
            )}
          </div>

          {/* Coupon Section */}
          <div className="max-w-md mx-auto mb-8">
            {!hasCoupon ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite seu cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  className="flex-1"
                />
                <Button onClick={applyCoupon} variant="outline" className="gap-2">
                  <Tag className="w-4 h-4" />
                  Aplicar
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <Tag className="w-4 h-4" />
                <span className="font-medium">Cupom {appliedCoupon} aplicado!</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={removeCoupon}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 mb-16 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative transition-all duration-300 hover:shadow-xl flex-1 flex flex-col ${
                  plan.popular ? 'border-primary shadow-lg md:scale-105 z-10' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Mais Popular
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    {plan.originalPrice && (
                      <div className="text-lg text-muted-foreground line-through mb-1">
                        {plan.originalPrice}{plan.period}
                      </div>
                    )}
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-lg">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-sm min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 flex-grow">
                  <div className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-border">
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0 text-center">✗</span>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <div className="p-6 pt-0 mt-auto">
                  {plan.priceId ? (
                    <Button
                      className="w-full text-base h-12"
                      onClick={() => handleSubscribe(plan.priceId!)}
                      disabled={loadingPriceId === plan.priceId || isCurrentPlan}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {loadingPriceId === plan.priceId && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                      {isCurrentPlan ? '✓ Plano Atual' : plan.buttonText}
                    </Button>
                  ) : (
                    <Link to="/register" className="block">
                      <Button className="w-full text-base h-12" variant="outline">
                        {plan.buttonText}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Guarantee */}
          <div className="text-center bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <Zap className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Satisfação garantida</h3>
            <p className="text-muted-foreground text-sm">
              Cancele a qualquer momento sem fidelidade. Seu acesso continua até o final do período pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
