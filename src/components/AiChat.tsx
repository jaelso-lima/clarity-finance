import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! 👋 Sou seu assistente financeiro. Posso analisar seus gastos, sugerir economias e responder dúvidas sobre suas finanças. Como posso ajudar?" },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Fetch user's financial data for context
      const [expRes, incRes, billRes] = await Promise.all([
        supabase.from("expenses").select("valor, categoria").limit(50),
        supabase.from("incomes").select("valor, categoria").limit(50),
        supabase.from("bills").select("valor, status, nome").limit(20),
      ]);

      const totalExpenses = (expRes.data || []).reduce((s, e) => s + Number(e.valor), 0);
      const totalIncome = (incRes.data || []).reduce((s, i) => s + Number(i.valor), 0);
      const pendingBills = (billRes.data || []).filter(b => b.status === "pendente");
      const saldo = totalIncome - totalExpenses;

      // Build context summary
      const context = `Dados do usuário: Receitas totais: R$${totalIncome.toFixed(2)}, Despesas totais: R$${totalExpenses.toFixed(2)}, Saldo: R$${saldo.toFixed(2)}, Contas pendentes: ${pendingBills.length} (R$${pendingBills.reduce((s, b) => s + Number(b.valor), 0).toFixed(2)}).`;

      // Simple response logic based on keywords
      let response = "";
      const lower = userMsg.toLowerCase();

      if (lower.includes("gasto") || lower.includes("despesa")) {
        const catMap: Record<string, number> = {};
        (expRes.data || []).forEach(e => { catMap[e.categoria] = (catMap[e.categoria] || 0) + Number(e.valor); });
        const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
        response = `📊 Suas despesas totalizam **R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}**.\n\n`;
        if (topCat.length > 0) {
          response += "Maiores categorias:\n";
          topCat.slice(0, 3).forEach(([cat, val]) => {
            response += `• **${cat}**: R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
          });
          response += `\n💡 Dica: Tente reduzir gastos com **${topCat[0][0]}** em 10% — você economizaria R$ ${(topCat[0][1] * 0.1).toFixed(2)} por mês!`;
        }
      } else if (lower.includes("receita") || lower.includes("ganho") || lower.includes("salário")) {
        response = `💰 Suas receitas totalizam **R$ ${totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}**.\n\nSeu saldo atual é **R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}** (${saldo >= 0 ? "positivo ✅" : "negativo ⚠️"}).`;
      } else if (lower.includes("conta") || lower.includes("pendente") || lower.includes("pagar")) {
        if (pendingBills.length === 0) {
          response = "✅ Parabéns! Você não tem contas pendentes. Continue assim!";
        } else {
          response = `⚠️ Você tem **${pendingBills.length}** conta(s) pendente(s):\n\n`;
          pendingBills.slice(0, 5).forEach(b => {
            response += `• **${b.nome}**: R$ ${Number(b.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
          });
        }
      } else if (lower.includes("economizar") || lower.includes("dica") || lower.includes("ajuda")) {
        const savingsRate = totalIncome > 0 ? (saldo / totalIncome * 100) : 0;
        response = `📈 **Análise rápida:**\n\n`;
        response += `• Taxa de economia: **${savingsRate.toFixed(0)}%**\n`;
        response += savingsRate >= 20 ? "• Status: Excelente! 🏆\n" : savingsRate >= 10 ? "• Status: Bom, mas pode melhorar 📊\n" : "• Status: Atenção! Tente economizar mais 🚨\n";
        response += `\n💡 Dica: A regra 50/30/20 sugere destinar 50% para necessidades, 30% para desejos e 20% para poupança.`;
      } else if (lower.includes("score") || lower.includes("pontuação")) {
        response = `🎯 Acesse a página de **Score Financeiro** para ver sua pontuação detalhada com base em receitas, despesas, dívidas e investimentos.`;
      } else {
        response = `${context}\n\n📊 Posso te ajudar com:\n• Análise de **gastos** por categoria\n• Suas **receitas** e saldo\n• **Contas** pendentes\n• **Dicas** de economia\n\nO que gostaria de saber?`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Desculpe, tive um problema. Tente novamente." }]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-50 h-14 w-14 rounded-2xl gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-105 active:scale-95 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[340px] max-h-[500px] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="gradient-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Bot className="h-5 w-5" />
              <span className="font-display font-semibold text-sm">Assistente Nexo</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[340px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[240px] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}>
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1" : ""}>
                      {line.split(/\*\*(.*?)\*\*/g).map((part, k) =>
                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo..."
                className="flex-1 h-10 text-sm rounded-xl"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-10 w-10 rounded-xl gradient-primary border-0 shrink-0" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
