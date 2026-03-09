import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const promoLogs = [
  { id: 1, email: "parceiro@email.com", duration: "3 meses", reason: "Parceria", date: "2025-06-01", admin: "Admin" },
  { id: 2, email: "influencer@email.com", duration: "6 meses", reason: "Divulgação", date: "2025-05-20", admin: "Admin" },
  { id: 3, email: "tester@email.com", duration: "1 mês", reason: "Teste", date: "2025-05-15", admin: "Admin" },
];

export default function AdminPlans() {
  const [email, setEmail] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!email || !duration || !reason) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    toast({ title: "PRO liberado!", description: `Plano PRO de ${duration} liberado para ${email}. Motivo: ${reason}` });
    setEmail(""); setDuration(""); setReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Plano PRO Promocional</h2>
        <p className="text-muted-foreground">Libere planos PRO para parceiros e divulgadores</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crown className="h-5 w-5 text-warning" /> Liberar Plano PRO</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Email do usuário</Label>
              <Input placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duração</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 mês">1 mês</SelectItem>
                  <SelectItem value="3 meses">3 meses</SelectItem>
                  <SelectItem value="6 meses">6 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Divulgação">Divulgação</SelectItem>
                  <SelectItem value="Parceria">Parceria</SelectItem>
                  <SelectItem value="Teste">Teste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSubmit}><Send className="h-4 w-4 mr-2" /> Liberar PRO</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Histórico de Liberações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.email}</TableCell>
                  <TableCell><Badge variant="outline">{log.duration}</Badge></TableCell>
                  <TableCell>{log.reason}</TableCell>
                  <TableCell>{new Date(log.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{log.admin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
