import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, PiggyBank, Sunset } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function compoundInterest(principal: number, monthly: number, rate: number, months: number) {
  const data = [];
  let total = principal;
  for (let i = 0; i <= months; i++) {
    data.push({ month: i, valor: Math.round(total) });
    total = (total + monthly) * (1 + rate / 100);
  }
  return data;
}

function CompoundInterestCalc() {
  const [principal, setPrincipal] = useState(1000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(1);
  const [months, setMonths] = useState(60);
  const data = compoundInterest(principal, monthly, rate, months);
  const finalValue = data[data.length - 1]?.valor || 0;
  const totalInvested = principal + monthly * months;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Capital Inicial (R$)</Label><Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Aporte Mensal (R$)</Label><Input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Taxa Mensal (%)</Label><Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Período (meses)</Label><Input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Investido</p><p className="font-display text-xl font-bold">R$ {totalInvested.toLocaleString("pt-BR")}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Valor Final</p><p className="font-display text-xl font-bold text-success">R$ {finalValue.toLocaleString("pt-BR")}</p></CardContent></Card>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
          <Area type="monotone" dataKey="valor" stroke="hsl(160, 60%, 40%)" fill="hsl(160, 60%, 40%)" fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function FreedomCalc() {
  const [monthlyExpense, setMonthlyExpense] = useState(3000);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [returnRate, setReturnRate] = useState(0.8);

  let months = 0;
  let savings = currentSavings;
  const target = monthlyExpense * 12 / (returnRate / 100 * 12 || 1);
  while (savings < target && months < 600) {
    savings = (savings + monthlyInvestment) * (1 + returnRate / 100);
    months++;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Gasto Mensal (R$)</Label><Input type="number" value={monthlyExpense} onChange={(e) => setMonthlyExpense(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Patrimônio Atual (R$)</Label><Input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Investimento Mensal (R$)</Label><Input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Retorno Mensal (%)</Label><Input type="number" step="0.1" value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} /></div>
      </div>
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Tempo para liberdade financeira</p>
          <p className="font-display text-3xl font-bold text-primary">
            {months >= 600 ? "50+ anos" : `${years} anos e ${remainingMonths} meses`}
          </p>
          <p className="text-sm text-muted-foreground mt-2">Patrimônio necessário: R$ {Math.round(target).toLocaleString("pt-BR")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SavingsCalc() {
  const [income, setIncome] = useState(5000);
  const [targetPct, setTargetPct] = useState(20);
  const monthly = income * targetPct / 100;
  const yearly = monthly * 12;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Renda Mensal (R$)</Label><Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Meta de Economia (%)</Label><Input type="number" value={targetPct} onChange={(e) => setTargetPct(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Por mês</p><p className="font-display text-lg font-bold">R$ {monthly.toLocaleString("pt-BR")}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Por ano</p><p className="font-display text-lg font-bold">R$ {yearly.toLocaleString("pt-BR")}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Em 5 anos</p><p className="font-display text-lg font-bold text-success">R$ {(yearly * 5).toLocaleString("pt-BR")}</p></CardContent></Card>
      </div>
    </div>
  );
}

function RetirementCalc() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [monthlyInv, setMonthlyInv] = useState(500);
  const [rateM, setRateM] = useState(0.8);
  const months = (retireAge - age) * 12;
  const data = compoundInterest(0, monthlyInv, rateM, months > 0 ? months : 0);
  const finalValue = data[data.length - 1]?.valor || 0;
  const monthlyIncome = finalValue * (rateM / 100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Idade Atual</Label><Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Idade de Aposentadoria</Label><Input type="number" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Investimento Mensal (R$)</Label><Input type="number" value={monthlyInv} onChange={(e) => setMonthlyInv(Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Retorno Mensal (%)</Label><Input type="number" step="0.1" value={rateM} onChange={(e) => setRateM(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Patrimônio Acumulado</p><p className="font-display text-xl font-bold text-primary">R$ {finalValue.toLocaleString("pt-BR")}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Renda Mensal Estimada</p><p className="font-display text-xl font-bold text-success">R$ {Math.round(monthlyIncome).toLocaleString("pt-BR")}</p></CardContent></Card>
      </div>
    </div>
  );
}

export default function Calculators() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Calculadoras Financeiras</h1>
        <p className="text-muted-foreground">Ferramentas gratuitas para planejar seu futuro financeiro</p>
      </div>

      <Tabs defaultValue="compound" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="compound" className="gap-1.5"><Calculator className="h-4 w-4" /> Juros Compostos</TabsTrigger>
          <TabsTrigger value="freedom" className="gap-1.5"><TrendingUp className="h-4 w-4" /> Liberdade</TabsTrigger>
          <TabsTrigger value="savings" className="gap-1.5"><PiggyBank className="h-4 w-4" /> Economia</TabsTrigger>
          <TabsTrigger value="retirement" className="gap-1.5"><Sunset className="h-4 w-4" /> Aposentadoria</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-6">
            <TabsContent value="compound"><CompoundInterestCalc /></TabsContent>
            <TabsContent value="freedom"><FreedomCalc /></TabsContent>
            <TabsContent value="savings"><SavingsCalc /></TabsContent>
            <TabsContent value="retirement"><RetirementCalc /></TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6 text-center">
          <p className="font-display font-semibold">Quer salvar suas simulações?</p>
          <p className="text-sm text-muted-foreground mb-3">Crie uma conta gratuita e acompanhe sua evolução</p>
          <Button>Criar Conta Gratuita</Button>
        </CardContent>
      </Card>
    </div>
  );
}
