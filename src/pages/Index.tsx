
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Bot,
  BarChart3,
  Target,
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
  TrendingUp,
  Wallet,
  Sparkles,
  Zap,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  Lock,
} from 'lucide-react';

const Index = () => {
  // Animated counter for social proof
  const [usersCount, setUsersCount] = useState(0);
  useEffect(() => {
    const target = 2847;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      setUsersCount(prev => {
        if (prev >= target) { clearInterval(timer); return target; }
        return Math.min(prev + step, target);
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const painPoints = [
    { icon: XCircle, text: 'Nunca sabe para onde vai o dinheiro no fim do mês' },
    { icon: XCircle, text: 'Vive no vermelho, mesmo ganhando bem' },
    { icon: XCircle, text: 'Já tentou planilhas, mas desistiu em 1 semana' },
    { icon: XCircle, text: 'Não consegue guardar dinheiro para emergências' },
    { icon: XCircle, text: 'Paga juros de cartão e parcelas que esqueceu' },
  ];

  const transformations = [
    { icon: CheckCircle, text: 'Sabe exatamente para onde cada real vai' },
    { icon: CheckCircle, text: 'Fecha o mês no positivo com dinheiro sobrando' },
    { icon: CheckCircle, text: 'Sistema automático que funciona sem esforço' },
    { icon: CheckCircle, text: 'Reserva de emergência crescendo todo mês' },
    { icon: CheckCircle, text: 'Controle total das dívidas e parcelas' },
  ];

  const testimonials = [
    {
      name: 'Ana Clara S.',
      role: 'Empreendedora',
      text: 'Em 2 meses usando o Meu Bolso Pro, consegui economizar R$ 1.200 que eu nem sabia que estava gastando à toa. A IA me mostrou gastos que eu nem percebia!',
      stars: 5,
    },
    {
      name: 'Carlos M.',
      role: 'Desenvolvedor',
      text: 'Finalmente consegui quitar minhas dívidas de cartão. O sistema de metas me mantém motivado e os relatórios são incríveis.',
      stars: 5,
    },
    {
      name: 'Juliana R.',
      role: 'Professora',
      text: 'Já tentei 4 apps diferentes. O Meu Bolso Pro é o único que eu uso todo dia. É simples, bonito e a IA realmente ajuda.',
      stars: 5,
    },
  ];

  const features = [
    {
      icon: Bot,
      title: 'IA que Entende Você',
      description: 'Converse com a IA e receba conselhos personalizados. Ela analisa seus padrões e sugere onde cortar gastos.',
    },
    {
      icon: BarChart3,
      title: 'Relatórios que Revelam Tudo',
      description: 'Gráficos claros que mostram para onde seu dinheiro vai. Descubra "ralos" financeiros que você nem sabia que existiam.',
    },
    {
      icon: Target,
      title: 'Metas que Funcionam',
      description: 'Defina quanto quer guardar e acompanhe em tempo real. Alertas automáticos te mantêm no caminho certo.',
    },
    {
      icon: TrendingUp,
      title: 'Previsão de Gastos',
      description: 'A IA prevê seus gastos futuros baseado no seu histórico. Saiba antes se o mês vai apertar.',
    },
    {
      icon: Sparkles,
      title: 'Tudo Automático',
      description: 'Categorização por IA, importação de extratos e alertas. Você não precisa fazer quase nada.',
    },
    {
      icon: Shield,
      title: 'Segurança de Banco',
      description: 'Criptografia de ponta a ponta. Seus dados financeiros nunca são compartilhados com terceiros.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Meu Bolso <span className="text-primary">Pro</span></span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/plans"><Button variant="ghost" size="sm">Planos</Button></Link>
            <Link to="/support"><Button variant="ghost" size="sm">Suporte</Button></Link>
            <Link to="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link to="/register">
              <Button size="sm" className="shadow-lg shadow-primary/20">Testar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO - Headline com urgência               */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
            <Clock className="w-4 h-4" />
            Teste grátis por tempo limitado — 5 dias de acesso completo
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Pare de perder dinheiro
            <span className="text-gradient block">sem saber para onde ele vai</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            O Meu Bolso Pro usa <strong>Inteligência Artificial</strong> para encontrar os "ralos" do seu dinheiro, 
            criar metas que funcionam e te ajudar a economizar de verdade — <strong>sem planilhas complicadas</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-10 h-14 shadow-xl shadow-primary/30 text-lg">
                Começar Meu Teste Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-12">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary" /> 5 dias grátis</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-primary" /> Cancele quando quiser</span>
          </div>

          {/* Social proof counter */}
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-bold text-lg">{usersCount.toLocaleString('pt-BR')}+</span> pessoas já organizaram suas finanças
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* DASHBOARD PREVIEW - Imagem real do sistema  */}
      {/* ============================================ */}
      <section className="px-4 -mt-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl shadow-2xl border border-border overflow-hidden">
            <img 
              src="/dashboard-preview.png" 
              alt="Dashboard do Meu Bolso Pro mostrando controle financeiro completo" 
              className="w-full h-auto"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Veja em tempo real para onde seu dinheiro está indo
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* DOR - Identifique-se com o problema         */}
      {/* ============================================ */}
      <section className="py-20 px-4 bg-destructive/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Você se identifica com alguma dessas situações?
            </h2>
            <p className="text-lg text-muted-foreground">
              Se marcou pelo menos 2, você está perdendo dinheiro todos os meses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Antes (Dor) */}
            <div>
              <h3 className="text-xl font-bold text-destructive mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6" /> Antes do Meu Bolso Pro
              </h3>
              <div className="space-y-4">
                {painPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                    <point.icon className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{point.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Depois (Solução) */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" /> Depois do Meu Bolso Pro
              </h3>
              <div className="space-y-4">
                {transformations.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <point.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{point.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* IA PREVIEW - Imagem do assistente           */}
      {/* ============================================ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" /> Exclusivo
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Sua consultora financeira
                <span className="text-gradient block">disponível 24 horas</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                A IA do Meu Bolso Pro analisa seus gastos, identifica padrões perigosos e sugere 
                exatamente onde cortar para você economizar mais. É como ter uma consultora financeira 
                particular, mas por uma fração do preço.
              </p>
              <ul className="space-y-3 mb-8">
                {['Análise automática de gastos', 'Alertas de gastos excessivos', 'Sugestões personalizadas de economia', 'Previsão de gastos futuros'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button size="lg" className="shadow-lg shadow-primary/20">
                  Experimentar a IA Grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl shadow-2xl border border-border overflow-hidden">
              <img 
                src="/ai-preview.png" 
                alt="Assistente IA do Meu Bolso Pro dando conselhos financeiros personalizados" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES - Benefícios (não features)        */}
      {/* ============================================ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que funciona
              <span className="text-gradient"> mesmo quando planilhas falham</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enquanto planilhas exigem disciplina, o Meu Bolso Pro faz o trabalho pesado por você.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROVA SOCIAL - Depoimentos                  */}
      {/* ============================================ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Quem usa,
              <span className="text-gradient"> recomenda</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array(t.stars).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                    "{t.text}"
                  </p>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PREÇOS - Comparação clara                   */}
      {/* ============================================ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quanto custa
            <span className="text-gradient"> não ter controle?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            A maioria das pessoas perde mais de <strong>R$ 500 por mês</strong> em gastos que nem percebe.
            O Meu Bolso Pro custa menos que um café por dia.
          </p>

          <Card className="border-primary shadow-xl relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                MAIS ESCOLHIDO
              </span>
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">Plano Pro</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold">R$ 19,90</span>
                <span className="text-muted-foreground text-lg">/mês</span>
              </div>
              <p className="text-sm text-primary font-medium mb-6">
                ou R$ 197,00/ano (economize R$ 41,80)
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                {[
                  'Lançamentos ilimitados',
                  'Assistente com IA',
                  'Relatórios avançados',
                  'Metas inteligentes',
                  'Importação de extratos',
                  'Suporte prioritário',
                  'Categorização automática',
                  'Exportação em PDF',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Link to="/register">
                <Button size="lg" className="w-full text-lg h-14 shadow-xl shadow-primary/30">
                  Começar 5 Dias Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                Sem cartão de crédito • Cancele quando quiser • Sem surpresas
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============================================ */}
      {/* URGÊNCIA - CTA Final                        */}
      {/* ============================================ */}
      <section className="py-20 px-4 gradient-primary">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cada dia sem controle é dinheiro perdido
          </h2>
          <p className="text-lg opacity-90 mb-4">
            Enquanto você pensa, seu dinheiro continua escorrendo pelos dedos. 
            Comece agora e em 5 minutos você já vai saber exatamente para onde ele está indo.
          </p>
          <p className="text-sm opacity-70 mb-8">
            Junte-se a {usersCount.toLocaleString('pt-BR')}+ pessoas que já transformaram suas finanças.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-10 h-14 shadow-xl">
              Quero Organizar Minhas Finanças
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ============================================ */}
      {/* CONFIANÇA - Trust signals                   */}
      {/* ============================================ */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="w-5 h-5" />
              <span>Criptografia SSL</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-5 h-5" />
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-5 h-5" />
              <span>{usersCount.toLocaleString('pt-BR')}+ usuários</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-5 h-5" />
              <span>99.9% uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Meu Bolso <span className="text-primary">Pro</span></span>
              </div>
              <p className="text-muted-foreground text-sm">
                Controle financeiro pessoal com inteligência artificial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link to="/plans" className="hover:text-primary transition-colors">Planos e Preços</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Criar Conta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link to="/support" className="hover:text-primary transition-colors">Central de Ajuda</Link></li>
                <li><a href="mailto:contato@meubolsopro.com" className="hover:text-primary transition-colors">contato@meubolsopro.com</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} Meu Bolso Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
