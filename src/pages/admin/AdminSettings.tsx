import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Configurações</h2>
        <p className="text-muted-foreground">Configurações gerais da plataforma</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-5 w-5" /> Geral</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Plataforma</Label>
            <Input defaultValue="FinanceFlow" />
          </div>
          <div className="space-y-2">
            <Label>Email de Suporte</Label>
            <Input defaultValue="suporte@financeflow.com" />
          </div>
          <div className="space-y-2">
            <Label>Preço do Plano PRO (R$)</Label>
            <Input type="number" defaultValue="14.90" />
          </div>
          <Button onClick={() => toast({ title: "Configurações salvas!" })}>Salvar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-5 w-5" /> Notificações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Notificar novos cadastros", defaultChecked: true },
            { label: "Notificar novos assinantes PRO", defaultChecked: true },
            { label: "Notificar contas suspeitas", defaultChecked: true },
            { label: "Relatório semanal por email", defaultChecked: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <Label>{n.label}</Label>
              <Switch defaultChecked={n.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-5 w-5" /> Segurança</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Limite de tentativas de login", defaultChecked: true },
            { label: "Detecção de múltiplas contas por IP", defaultChecked: true },
            { label: "Exigir verificação de email", defaultChecked: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <Label>{s.label}</Label>
              <Switch defaultChecked={s.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-5 w-5" /> Sistema</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Versão</span><span className="font-medium">1.0.0</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Ambiente</span><span className="font-medium">Produção</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Banco de Dados</span><span className="font-medium">Conectado</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Último Backup</span><span className="font-medium">15/06/2025 às 03:00</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
