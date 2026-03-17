import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "R$0",
    period: "/mês",
    description: "Para começar a organizar",
    features: [
      "50 registros/mês",
      "Dashboard básico",
      "Gráficos simples",
      "Score financeiro",
      "Conquistas",
      "Suporte por e-mail",
    ],
    cta: "Plano Atual",
    current: true,
    highlight: false,
  },
  {
    name: "PRO",
    price: "R$19,90",
    period: "/mês",
    description: "Para quem quer resultados",
    badge: "MAIS POPULAR",
    features: [
      "Registros ilimitados",
      "Gráficos avançados",
      "IA financeira ilimitada",
      "Projeções inteligentes",
      "Relatórios PDF",
      "Comparação anônima",
      "Suporte prioritário",
    ],
    cta: "Assinar PRO",
    current: false,
    highlight: true,
  },
];

const periods = [
  { label: "Mensal", price: "R$14,90/mês", discount: null },
  { label: "Semestral", price: "R$12,90/mês", discount: "Economize 13%" },
  { label: "Anual", price: "R$9,90/mês", discount: "Economize 33%" },
];

export default function Plans() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Planos</h1>
        <p className="text-muted-foreground">Escolha o plano ideal para você</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.highlight ? "border-primary shadow-lg" : ""}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}
            <CardContent className="p-8">
              <h3 className="font-display text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className={`font-display text-4xl font-extrabold ${plan.highlight ? "text-gradient" : ""}`}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.highlight ? "gradient-primary border-0" : ""}`}
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current}
              >
                {plan.cta}
                {!plan.current && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period options for PRO */}
      <Card className="max-w-4xl">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Opções de Assinatura PRO</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {periods.map((p) => (
              <div
                key={p.label}
                className="rounded-lg border p-4 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <p className="font-semibold mb-1">{p.label}</p>
                <p className="font-display text-xl font-bold text-gradient">{p.price}</p>
                {p.discount && (
                  <span className="text-xs text-success font-medium">{p.discount}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
