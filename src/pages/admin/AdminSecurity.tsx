import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Eye, Ban, Activity, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const suspiciousAccounts = [
  { id: 1, email: "fake1@temp.com", reason: "Múltiplas contas do mesmo IP", ip: "192.168.1.100", created: "2025-06-10", status: "suspeito" },
  { id: 2, email: "fake2@temp.com", reason: "Múltiplas contas do mesmo IP", ip: "192.168.1.100", created: "2025-06-10", status: "suspeito" },
  { id: 3, email: "spam@bot.net", reason: "Criação excessiva de contas", ip: "10.0.0.55", created: "2025-06-08", status: "bloqueado" },
  { id: 4, email: "dup@email.com", reason: "Conta duplicada", ip: "172.16.0.22", created: "2025-06-05", status: "revisado" },
];

const securityLogs = [
  { id: 1, action: "Login de administrador", user: "admin@financeflow.com", ip: "187.x.x.x", date: "2025-06-15 14:32", level: "info" },
  { id: 2, action: "Plano PRO liberado manualmente", user: "admin@financeflow.com", ip: "187.x.x.x", date: "2025-06-15 14:35", level: "warning" },
  { id: 3, action: "Usuário bloqueado", user: "admin@financeflow.com", ip: "187.x.x.x", date: "2025-06-14 10:20", level: "warning" },
  { id: 4, action: "Tentativa de acesso não autorizado", user: "desconhecido", ip: "45.x.x.x", date: "2025-06-13 03:15", level: "error" },
  { id: 5, action: "Alteração de plano", user: "admin@financeflow.com", ip: "187.x.x.x", date: "2025-06-12 16:45", level: "info" },
  { id: 6, action: "Conta suspeita detectada", user: "sistema", ip: "—", date: "2025-06-10 08:00", level: "warning" },
];

const securityChecks = [
  { name: "Criptografia de senhas", status: "ativo", icon: Lock },
  { name: "Proteção contra força bruta", status: "ativo", icon: Shield },
  { name: "Proteção contra SQL Injection", status: "ativo", icon: Shield },
  { name: "Proteção contra XSS", status: "ativo", icon: Shield },
  { name: "Validação de entrada", status: "ativo", icon: Shield },
  { name: "Autenticação forte (admin)", status: "ativo", icon: Lock },
  { name: "Controle de permissões por nível", status: "ativo", icon: Activity },
];

export default function AdminSecurity() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Segurança</h2>
        <p className="text-muted-foreground">Anti-fraude, logs e proteção do sistema</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Status de Segurança", value: "Protegido", icon: Shield, color: "text-primary" },
          { label: "Contas Suspeitas", value: suspiciousAccounts.filter(a => a.status === "suspeito").length.toString(), icon: AlertTriangle, color: "text-warning" },
          { label: "Contas Bloqueadas", value: suspiciousAccounts.filter(a => a.status === "bloqueado").length.toString(), icon: Ban, color: "text-destructive" },
          { label: "Logs (24h)", value: "12", icon: Activity, color: "text-accent" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Verificações de Segurança</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {securityChecks.map((check) => (
              <div key={check.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                <check.icon className="h-4 w-4 text-primary" />
                <span className="flex-1">{check.name}</span>
                <Badge variant="default" className="text-xs">Ativo</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> Contas Suspeitas (Anti-Fraude)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Criação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspiciousAccounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.email}</TableCell>
                  <TableCell className="text-sm">{a.reason}</TableCell>
                  <TableCell className="font-mono text-xs">{a.ip}</TableCell>
                  <TableCell>{new Date(a.created).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "suspeito" ? "secondary" : a.status === "bloqueado" ? "destructive" : "outline"}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => toast({ title: `Conta ${a.email} revisada` })}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => toast({ title: `Conta ${a.email} bloqueada` })}>
                      <Ban className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-5 w-5" /> Logs do Sistema</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {securityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="text-sm">{log.user}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell className="text-sm">{log.date}</TableCell>
                  <TableCell>
                    <Badge variant={log.level === "error" ? "destructive" : log.level === "warning" ? "secondary" : "outline"}>
                      {log.level}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
