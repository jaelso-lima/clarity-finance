import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, BarChart3, Shield, Sparkles, ArrowRight, Check, ChevronDown,
  PieChart, Wallet, Bot, Star, Users, Zap, Heart, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageTranslator } from "@/components/LanguageTranslator";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const problems = [
  { icon: "😰", text: "Você não sabe para onde seu dinheiro vai todo mês" },
  { icon: "💸", text: "Sobra mês no fim do dinheiro" },
  { icon: "📊", text: "Falta organização e visão clara das suas finanças" },
  { icon: "🤷", text: "Não sabe se está melhorando ou piorando financeiramente" },
];

const features = [
  { icon: Wallet, title: "Controle Total", description: "Registre despesas, receitas e contas em segundos com interface intuitiva." },
  { icon: PieChart, title: "Gráficos Inteligentes", description: "Visualize seus dados com gráficos interativos que revelam padrões ocultos." },
  { icon: TrendingUp, title: "Investimentos", description: "Acompanhe seus investimentos e veja sua evolução patrimonial." },
  { icon: Bot, title: "IA Financeira", description: "Receba dicas personalizadas do nosso assistente de inteligência artificial." },
  { icon: Shield, title: "Segurança Total", description: "Seus dados protegidos com criptografia de ponta e autenticação segura." },
  { icon: BarChart3, title: "Score Financeiro", description: "Acompanhe sua saúde financeira com um score inteligente de 0 a 100." },
];

const testimonials = [
  { name: "Ana L.", role: "Empreendedora", text: "Em 2 meses, consegui economizar R$1.200 que antes eu nem sabia que gastava.", avatar: "A" },
  { name: "Carlos M.", role: "Desenvolvedor", text: "O score financeiro me deu clareza total sobre minha saúde financeira.", avatar: "C" },
  { name: "Maria S.", role: "Professora", text: "A IA me ajudou a identificar gastos desnecessários que eu nem percebia.", avatar: "M" },
];

const faqs = [
  { q: "O Nexo é realmente gratuito?", a: "Sim! O plano Free dá acesso ao dashboard, gráficos básicos e até 50 registros por mês. Para funcionalidades avançadas como IA e relatórios, assine o PRO." },
  { q: "Meus dados estão seguros?", a: "Absolutamente. Utilizamos criptografia de ponta, autenticação segura e seus dados nunca são compartilhados." },
  { q: "O que a IA financeira faz?", a: "Analisa seus gastos e receitas para oferecer dicas personalizadas de economia, alertas de risco e projeções financeiras." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem taxas de cancelamento. Você mantém o acesso até o fim do período pago." },
  { q: "O que é o Plano Casal?", a: "É um plano para casais que querem gerenciar finanças juntos, com contas compartilhadas e metas conjuntas." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-gradient">Nexo</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#problemas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problemas</a>
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

      {/* HERO — ATENÇÃO */}
      <section className="gradient-hero py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/50 backdrop-blur px-4 py-1.5 text-sm font-medium text-muted-foreground mb-6">
              <Sparkles className="h-4 w-4 text-primary" /> +5.000 usuários controlando suas finanças
            </span>
          </motion.div>
          <motion.h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-tight" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            Descubra para onde seu dinheiro está indo e <span className="text-gradient">assuma o controle</span>
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            Organize suas finanças, aumente seu score e construa um futuro financeiro sólido com ajuda da IA.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Button size="lg" asChild className="gradient-primary border-0 text-base px-8 h-14 rounded-xl shadow-lg shadow-primary/25">
              <Link to="/register">Começar grátis agora <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-14 rounded-xl">
              <Link to="/register">Testar gratuitamente</Link>
            </Button>
          </motion.div>
          <motion.div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> Sem cartão</span>
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> Cancele quando quiser</span>
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> Dados seguros</span>
          </motion.div>
        </div>
      </section>

      {/* INTERESSE — Problemas */}
      <section id="problemas" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Você se identifica com algum desses <span className="text-gradient">problemas</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A maioria dos brasileiros enfrenta esses desafios financeiros todos os dias.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {problems.map((p, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="hover:shadow-md transition-shadow border-border/50">
                  <CardContent className="p-5 flex items-center gap-4">
                    <span className="text-3xl">{p.icon}</span>
                    <p className="text-sm font-medium">{p.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DESEJO — Funcionalidades */}
      <section id="funcionalidades" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              A solução que você <span className="text-gradient">precisava</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Ferramentas inteligentes para organizar sua vida financeira de verdade.</p>
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

      {/* Prova Social */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              O que nossos <span className="text-gradient">usuários</span> dizem
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-warning text-warning" />)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{t.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AÇÃO — Planos */}
      <section id="planos" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-muted-foreground text-lg">Comece grátis, evolua quando quiser.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <Card>
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm mb-4">Para começar a organizar</p>
                <div className="mb-6"><span className="font-display text-4xl font-extrabold">R$0</span><span className="text-muted-foreground">/mês</span></div>
                <ul className="space-y-3 mb-8">
                  {["50 registros/mês", "Dashboard básico", "Gráficos simples", "Score financeiro", "Conquistas"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success shrink-0" />{item}</li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-xl h-12" asChild><Link to="/register">Começar grátis</Link></Button>
              </CardContent>
            </Card>

            {/* PRO */}
            <Card className="relative border-primary shadow-xl scale-[1.02]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1"><Crown className="h-3 w-3" /> MAIS POPULAR</span>
              </div>
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-2">PRO</h3>
                <p className="text-muted-foreground text-sm mb-4">Para quem quer resultados</p>
                <div className="mb-6"><span className="font-display text-4xl font-extrabold text-gradient">R$19,90</span><span className="text-muted-foreground">/mês</span></div>
                <ul className="space-y-3 mb-8">
                  {["Registros ilimitados", "Gráficos avançados", "IA financeira ilimitada", "Projeções inteligentes", "Relatórios PDF", "Comparação anônima", "Suporte prioritário"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" />{item}</li>
                  ))}
                </ul>
                <Button className="w-full gradient-primary border-0 rounded-xl h-12 shadow-lg shadow-primary/25" asChild><Link to="/register">Assinar PRO</Link></Button>
              </CardContent>
            </Card>

            {/* Casal */}
            <Card className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1"><Heart className="h-3 w-3" /> CASAL</span>
              </div>
              <CardContent className="p-8">
                <h3 className="font-display text-2xl font-bold mb-2">Casal</h3>
                <p className="text-muted-foreground text-sm mb-4">Finanças a dois</p>
                <div className="mb-6"><span className="font-display text-4xl font-extrabold">R$29,90</span><span className="text-muted-foreground">/mês</span></div>
                <ul className="space-y-3 mb-8">
                  {["Tudo do PRO", "2 contas vinculadas", "Contas compartilhadas", "Metas conjuntas", "Visão unificada"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success shrink-0" />{item}</li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-xl h-12" asChild><Link to="/register">Começar com casal</Link></Button>
              </CardContent>
            </Card>
          </div>

          {/* Urgency */}
          <motion.div className="text-center mt-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              <strong className="text-foreground">Oferta limitada:</strong> primeiros 100 assinantes ganham 30% de desconto no primeiro ano.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Indicação */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -mr-10 -mt-10" />
              <Users className="h-10 w-10 mx-auto mb-4 text-primary-foreground/80" />
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Indique e ganhe PRO grátis</h2>
              <p className="text-primary-foreground/80 mb-2">Indique <strong>3 amigos</strong> → ganhe <strong>1 mês PRO</strong></p>
              <p className="text-primary-foreground/80 mb-6">Indique <strong>10 amigos</strong> → ganhe <strong>6 meses PRO</strong></p>
              <Button size="lg" variant="secondary" asChild className="rounded-xl h-12">
                <Link to="/register">Começar a indicar <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-muted/30">
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

      {/* CTA Final */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Pronto para assumir o controle?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">Crie sua conta em 30 segundos e comece a organizar suas finanças hoje.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild className="text-base px-8 h-14 rounded-xl">
              <Link to="/register">Criar conta grátis <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <p className="text-primary-foreground/60 text-sm mt-6">Sem cartão de crédito. Cancele quando quiser.</p>
        </div>
      </section>

      {/* Footer */}
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
