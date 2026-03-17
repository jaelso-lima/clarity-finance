import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, BarChart3, Shield, Sparkles, ArrowRight, Check, ChevronDown, PieChart, Wallet, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Wallet, title: "Controle Total", description: "Registre despesas, receitas e contas a pagar em segundos." },
  { icon: PieChart, title: "Gráficos Inteligentes", description: "Visualize seus dados com gráficos interativos e intuitivos." },
  { icon: TrendingUp, title: "Investimentos", description: "Acompanhe seus investimentos e veja sua evolução financeira." },
  { icon: Bot, title: "IA Financeira", description: "Receba dicas personalizadas do nosso agente de inteligência artificial." },
  { icon: Shield, title: "Segurança Total", description: "Seus dados protegidos com criptografia e autenticação segura." },
  { icon: BarChart3, title: "Score Financeiro", description: "Acompanhe sua saúde financeira com um score inteligente." },
];

const faqs = [
  { q: "O Nexo é gratuito?", a: "Sim! Você pode usar o plano gratuito. Para acesso completo, assine o PRO por R$14,90/mês." },
  { q: "Meus dados estão seguros?", a: "Absolutamente. Utilizamos criptografia de ponta e autenticação segura." },
  { q: "O que a IA financeira faz?", a: "Analisa seus gastos e receitas para oferecer dicas personalizadas de economia." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem taxas de cancelamento." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-gradient">Nexo</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/login">Entrar</Link></Button>
            <Button asChild className="gradient-primary border-0 rounded-xl"><Link to="/register">Começar grátis</Link></Button>
          </div>
        </div>
      </nav>

      <section className="gradient-hero py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/50 backdrop-blur px-4 py-1.5 text-sm font-medium text-muted-foreground mb-6">
              <Sparkles className="h-4 w-4 text-primary" /> Seu banco digital pessoal
            </span>
          </motion.div>
          <motion.h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            Suas finanças no <span className="text-gradient">controle total</span>
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            Dashboard inteligente, gráficos em tempo real e IA que analisa seus gastos. Simples como um app de banco.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Button size="lg" asChild className="gradient-primary border-0 text-base px-8 h-13 rounded-xl">
              <Link to="/register">Começar grátis <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="funcionalidades" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Feito para quem quer <span className="text-gradient">resultados</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Ferramentas inteligentes para organizar sua vida financeira.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-accent-foreground" />
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

      <section id="planos" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Simples e transparente</h2>
            <p className="text-muted-foreground text-lg">Comece grátis, evolua quando quiser.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-2">Free</h3>
                <div className="mb-6"><span className="font-display text-4xl font-extrabold">R$0</span><span className="text-muted-foreground">/mês</span></div>
                <ul className="space-y-3 mb-8">
                  {["50 registros", "Gráficos básicos", "Score financeiro", "Conquistas"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" />{item}</li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-xl h-11" asChild><Link to="/register">Começar grátis</Link></Button>
              </CardContent>
            </Card>
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">RECOMENDADO</span>
              </div>
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-2">PRO</h3>
                <div className="mb-6"><span className="font-display text-4xl font-extrabold text-gradient">R$14,90</span><span className="text-muted-foreground">/mês</span></div>
                <ul className="space-y-3 mb-8">
                  {["Registros ilimitados", "Gráficos avançados", "IA financeira", "Relatórios PDF", "Suporte prioritário"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" />{item}</li>
                  ))}
                </ul>
                <Button className="w-full gradient-primary border-0 rounded-xl h-11" asChild><Link to="/register">Assinar PRO</Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16"><h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2></div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border bg-card p-4">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-sm">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Pronto para começar?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">Crie sua conta e organize suas finanças em minutos.</p>
          <Button size="lg" variant="secondary" asChild className="text-base px-8 h-12 rounded-xl">
            <Link to="/register">Criar conta grátis <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-gradient">Nexo</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Nexo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
