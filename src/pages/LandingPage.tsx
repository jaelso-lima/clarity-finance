import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  PieChart,
  Wallet,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Wallet,
    title: "Controle Total",
    description: "Registre despesas, receitas e contas a pagar em segundos.",
  },
  {
    icon: PieChart,
    title: "Gráficos Inteligentes",
    description: "Visualize seus dados com gráficos interativos e intuitivos.",
  },
  {
    icon: TrendingUp,
    title: "Investimentos",
    description: "Acompanhe seus investimentos e veja sua evolução financeira.",
  },
  {
    icon: Bot,
    title: "IA Financeira",
    description: "Receba dicas personalizadas do nosso agente de inteligência artificial.",
  },
  {
    icon: Shield,
    title: "Segurança",
    description: "Seus dados protegidos com criptografia e autenticação segura.",
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    description: "Exporte relatórios completos em PDF para análise detalhada.",
  },
];

const faqs = [
  {
    q: "O FinanceFlow é gratuito?",
    a: "Sim! Você pode usar o plano gratuito com funcionalidades limitadas. Para acesso completo, assine o plano PRO por apenas R$14,90/mês.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Absolutamente. Utilizamos criptografia de ponta e autenticação segura para proteger todas as suas informações financeiras.",
  },
  {
    q: "O que a IA financeira faz?",
    a: "Nossa IA analisa seus gastos, receitas e investimentos para oferecer dicas personalizadas de economia e organização financeira.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim, você pode cancelar sua assinatura PRO a qualquer momento, sem taxas de cancelamento.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-gradient">FinanceFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="gradient-primary border-0">
              <Link to="/register">Criar Conta Grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              Gestão financeira com inteligência artificial
            </span>
          </motion.div>
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Pare de perder dinheiro.{" "}
            <span className="text-gradient">Organize suas finanças</span> de vez.
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Controle despesas, receitas e investimentos com gráficos inteligentes e dicas
            personalizadas da nossa IA. Simples, visual e poderoso.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Button size="lg" asChild className="gradient-primary border-0 text-base px-8 h-12">
              <Link to="/register">
                Criar Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-12">
              <Link to="/dashboard">Ver Demo</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para{" "}
              <span className="text-gradient">controlar seu dinheiro</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas poderosas para organizar sua vida financeira, mesmo sem conhecimento em finanças.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border/50">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-muted-foreground text-lg">
              Comece grátis e evolua quando quiser.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground mb-6">Perfeito para começar</p>
                <div className="mb-6">
                  <span className="font-display text-4xl font-extrabold">R$0</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "50 registros de despesas",
                    "50 registros de receitas",
                    "10 investimentos",
                    "2 relatórios por mês",
                    "Gráficos básicos",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/register">Começar Grátis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-2">PRO</h3>
                <p className="text-muted-foreground mb-6">Para quem leva a sério</p>
                <div className="mb-6">
                  <span className="font-display text-4xl font-extrabold text-gradient">R$14,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Registros ilimitados",
                    "Relatórios completos",
                    "Gráficos avançados",
                    "Exportar em PDF",
                    "Agente financeiro IA completo",
                    "Suporte prioritário",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full gradient-primary border-0" asChild>
                  <Link to="/register">Assinar PRO</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-lg border bg-card p-4">
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Comece a organizar suas finanças agora
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Junte-se a milhares de pessoas que já transformaram sua vida financeira com o FinanceFlow.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-base px-8 h-12"
          >
            <Link to="/register">
              Criar Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-gradient">FinanceFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FinanceFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
