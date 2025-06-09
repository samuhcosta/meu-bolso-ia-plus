
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Bot, 
  BarChart3, 
  Target, 
  Bell, 
  Users, 
  Shield, 
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Bot,
      title: 'Assistente com IA',
      description: 'Receba dicas personalizadas e análises inteligentes dos seus gastos'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Detalhados',
      description: 'Visualize seus gastos por categoria, mês e tendências'
    },
    {
      icon: Target,
      title: 'Metas Financeiras',
      description: 'Defina objetivos e acompanhe seu progresso em tempo real'
    },
    {
      icon: Bell,
      title: 'Notificações Inteligentes',
      description: 'Alertas por WhatsApp, email e no app sobre seus gastos'
    },
    {
      icon: Users,
      title: 'Plano Familiar',
      description: 'Compartilhe o controle financeiro com toda a família'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de ponta'
    }
  ];

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      features: [
        'Até 30 lançamentos/mês',
        'Controle básico de gastos',
        'Categorização manual',
        'Relatórios simples'
      ],
      buttonText: 'Começar Grátis',
      popular: false
    },
    {
      name: 'Pro',
      price: 'R$ 14,90',
      period: '/mês',
      features: [
        'Lançamentos ilimitados',
        'Assistente com IA',
        'Relatórios avançados',
        'Metas financeiras',
        'Notificações inteligentes'
      ],
      buttonText: 'Escolher Pro',
      popular: true
    },
    {
      name: 'Premium',
      price: 'R$ 24,90',
      period: '/mês',
      features: [
        'Tudo do Pro incluído',
        'Plano familiar (até 5 membros)',
        'Notificações WhatsApp',
        'Import de extratos com IA',
        'Suporte prioritário'
      ],
      buttonText: 'Escolher Premium',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Meu Bolso Pro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/support">
              <Button variant="ghost" size="sm">Suporte</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Controle suas finanças com
            <span className="text-gradient block">Inteligência Artificial</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            O Meu Bolso Pro é o sistema mais completo para gerenciar seu dinheiro, 
            com IA que te ajuda a economizar e alcançar seus objetivos financeiros.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Começar Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/plans">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver Planos
              </Button>
            </Link>
          </div>

          {/* Video/Demo Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Smartphone className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Demo Interativo</h3>
                <p className="opacity-90">Veja como é fácil controlar suas finanças</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para
              <span className="text-gradient"> organizar seu dinheiro</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades desenvolvidas para simplificar sua vida financeira
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos que cabem no seu
              <span className="text-gradient"> orçamento</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className="block">
                    <Button 
                      className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comece hoje mesmo a transformar sua vida financeira
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Junte-se a milhares de pessoas que já organizaram suas finanças com o Meu Bolso Pro
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Criar Conta Gratuita
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-bold">Meu Bolso Pro</span>
              </div>
              <p className="text-primary-foreground/80">
                O sistema mais completo para controle financeiro pessoal
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><Link to="/plans">Planos</Link></li>
                <li><Link to="/support">Suporte</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#">Sobre</a></li>
                <li><a href="#">Privacidade</a></li>
                <li><a href="#">Termos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>contato@meubolsopro.com</li>
                <li>(11) 99999-9999</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
            <p>&copy; 2024 Meu Bolso Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
