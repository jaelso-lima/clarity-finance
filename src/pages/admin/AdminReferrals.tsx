import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gift, CheckCircle, XCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const referrals = [
  { id: 1, user: "João Silva", email: "joao@email.com", referrals: 5, reward: "1 mês PRO", status: "validado" },
  { id: 2, user: "Maria Santos", email: "maria@email.com", referrals: 3, reward: "1 mês PRO", status: "validado" },
  { id: 3, user: "Pedro Oliveira", email: "pedro@email.com", referrals: 12, reward: "6 meses PRO", status: "validado" },
  { id: 4, user: "Conta Suspeita", email: "suspect@email.com", referrals: 8, reward: "1 mês PRO", status: "pendente" },
  { id: 5, user: "Lucas Ferreira", email: "lucas@email.com", referrals: 2, reward: "—", status: "em progresso" },
];

const stats = [
  { label: "Total de Indicações", value: "30", icon: Gift },
  { label: "Recompensas Geradas", value: "4", icon: CheckCircle },
  { label: "Meses PRO Concedidos", value: "9", icon: Users },
];

export default function AdminReferrals() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Controle de Indicações</h2>
        <p className="text-muted-foreground">Gerencie o programa de indicações</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Indicações por Usuário</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Indicações</TableHead>
                <TableHead>Recompensa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.referrals}</TableCell>
                  <TableCell>{r.reward}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "validado" ? "default" : r.status === "pendente" ? "secondary" : "outline"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Indicação validada" })}>
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Indicação cancelada", variant: "destructive" })}>
                      <XCircle className="h-3 w-3" />
                    </Button>
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
