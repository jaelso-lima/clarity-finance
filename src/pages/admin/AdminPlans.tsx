import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Send, Plus, Trash2, Edit2, ExternalLink, Loader2, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPlans() {
  const [email, setEmail] = useState("");
  const [planType, setPlanType] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [grantLoading, setGrantLoading] = useState(false);
  const [promoLogs, setPromoLogs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [planOpen, setPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", description: "", price: "", interval: "month", checkout_url: "", stripe_price_id: "" });
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    const [logsRes, plansRes] = await Promise.all([
      supabase.from("promo_logs").select("*").order("created_at", { ascending: false }),
      supabase.from("plans").select("*").order("created_at", { ascending: true }),
    ]);
    setPromoLogs(logsRes.data || []);
    setPlans(plansRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePromo = async () => {
    if (!email || !planType || !duration || !reason) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    // Find the plan ID matching the selected type
    const selectedPlan = plans.find((p) => p.name.toLowerCase().includes(planType.toLowerCase()));
    if (!selectedPlan) {
      toast({ title: "Plano não encontrado", description: "Crie o plano correspondente primeiro.", variant: "destructive" });
      return;
    }

    // Map duration to days
    const durationMap: Record<string, number> = {
      "7 dias": 7,
      "15 dias": 15,
      "1 mês": 30,
      "3 meses": 90,
      "6 meses": 180,
      "1 ano": 365,
    };
    const days = durationMap[duration] || 30;

    setGrantLoading(true);
    try {
      // Call edge function to create real subscription
      const res = await supabase.functions.invoke("admin-users", {
        body: {
          action: "grant-plan",
          email,
          planId: selectedPlan.id,
          duration: String(days),
          reason: `${reason} (${planType})`,
          userId: user?.id,
        },
      });

      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      // Log the promo action
      await supabase.from("promo_logs").insert({
        target_email: email,
        duration: `${duration} (${planType})`,
        reason,
        granted_by: user?.id,
      });

      toast({ title: "Plano concedido! ✅", description: `${planType} de ${duration} liberado para ${email}.` });
      setEmail(""); setPlanType(""); setDuration(""); setReason("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro ao conceder plano", description: err.message, variant: "destructive" });
    } finally {
      setGrantLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!planForm.name || !planForm.price) {
      toast({ title: "Nome e preço são obrigatórios", variant: "destructive" });
      return;
    }
    const payload = {
      name: planForm.name,
      description: planForm.description,
      price: parseFloat(planForm.price),
      interval: planForm.interval,
      checkout_url: planForm.checkout_url,
      stripe_price_id: planForm.stripe_price_id,
    };

    if (editingPlan) {
      const { error } = await supabase.from("plans").update(payload).eq("id", editingPlan);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Plano atualizado!" });
    } else {
      const { error } = await supabase.from("plans").insert(payload);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Plano criado!" });
    }
    setPlanForm({ name: "", description: "", price: "", interval: "month", checkout_url: "", stripe_price_id: "" });
    setEditingPlan(null);
    setPlanOpen(false);
    fetchData();
  };

  const handleEditPlan = (plan: any) => {
    setPlanForm({
      name: plan.name,
      description: plan.description || "",
      price: String(plan.price),
      interval: plan.interval,
      checkout_url: plan.checkout_url || "",
      stripe_price_id: plan.stripe_price_id || "",
    });
    setEditingPlan(plan.id);
    setPlanOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Plano removido" });
    fetchData();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("plans").update({ is_active: !current }).eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Gerenciamento de Planos</h2>
        <p className="text-muted-foreground">Crie planos, configure links de checkout Stripe e libere PRO manualmente</p>
      </div>

      {/* Grant PRO manually */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-5 w-5 text-warning" /> Liberar Plano Manualmente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Email do usuário *</Label>
              <Input placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Plano *</Label>
              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRO">PRO</SelectItem>
                  <SelectItem value="Casal">Casal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duração *</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7 dias">7 dias</SelectItem>
                  <SelectItem value="15 dias">15 dias</SelectItem>
                  <SelectItem value="1 mês">1 mês</SelectItem>
                  <SelectItem value="3 meses">3 meses</SelectItem>
                  <SelectItem value="6 meses">6 meses</SelectItem>
                  <SelectItem value="1 ano">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Divulgação">Divulgação</SelectItem>
                  <SelectItem value="Parceria">Parceria</SelectItem>
                  <SelectItem value="Teste">Teste</SelectItem>
                  <SelectItem value="Cortesia">Cortesia</SelectItem>
                  <SelectItem value="Suporte">Suporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handlePromo} disabled={grantLoading} className="gradient-primary border-0">
            {grantLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Liberar Plano
          </Button>
        </CardContent>
      </Card>

      {/* Plans CRUD */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Planos</CardTitle>
            <Dialog open={planOpen} onOpenChange={(o) => { setPlanOpen(o); if (!o) { setEditingPlan(null); setPlanForm({ name: "", description: "", price: "", interval: "month", checkout_url: "", stripe_price_id: "" }); } }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Plano</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">{editingPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input placeholder="Ex: PRO Mensal" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço (R$) *</Label>
                      <Input type="number" placeholder="29.90" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input placeholder="Descrição do plano" value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Intervalo</Label>
                      <Select value={planForm.interval} onValueChange={(v) => setPlanForm({ ...planForm, interval: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Mensal</SelectItem>
                          <SelectItem value="year">Anual</SelectItem>
                          <SelectItem value="once">Único</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Stripe Price ID</Label>
                      <Input placeholder="price_xxx" value={planForm.stripe_price_id} onChange={(e) => setPlanForm({ ...planForm, stripe_price_id: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>🔗 Link do Checkout (Stripe)</Label>
                    <Input placeholder="https://checkout.stripe.com/..." value={planForm.checkout_url} onChange={(e) => setPlanForm({ ...planForm, checkout_url: e.target.value })} />
                  </div>
                  <Button onClick={handleSavePlan} className="w-full gradient-primary border-0">
                    {editingPlan ? "Salvar Alterações" : "Criar Plano"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Intervalo</TableHead>
                <TableHead>Checkout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>R$ {Number(plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell><Badge variant="outline">{plan.interval === "month" ? "Mensal" : plan.interval === "year" ? "Anual" : "Único"}</Badge></TableCell>
                  <TableCell>
                    {plan.checkout_url ? (
                      <a href={plan.checkout_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                        <ExternalLink className="h-3 w-3" /> Abrir
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Não configurado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleActive(plan.id, plan.is_active)}>
                      <Badge variant={plan.is_active ? "default" : "secondary"} className={plan.is_active ? "bg-success text-success-foreground" : ""}>
                        {plan.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum plano criado ainda.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crown className="h-5 w-5 text-warning" /> Histórico de Liberações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Duração / Tipo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.target_email}</TableCell>
                  <TableCell><Badge variant="outline">{log.duration}</Badge></TableCell>
                  <TableCell>{log.reason}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
              {promoLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma liberação registrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
