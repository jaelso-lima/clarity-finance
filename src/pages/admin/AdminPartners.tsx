import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Handshake, DollarSign, Upload, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const partners = [
  { id: 1, name: "Carlos Almeida", email: "carlos@email.com", share: "50%", totalReceived: 9375, status: "ativo" },
  { id: 2, name: "Roberto Lima", email: "roberto@email.com", share: "50%", totalReceived: 9375, status: "ativo" },
];

const payments = [
  { id: 1, partner: "Carlos Almeida", amount: 2650, date: "2025-06-01", method: "PIX", status: "pago" },
  { id: 2, partner: "Roberto Lima", amount: 2650, date: "2025-06-01", method: "PIX", status: "pago" },
  { id: 3, partner: "Carlos Almeida", amount: 2100, date: "2025-05-01", method: "PIX", status: "pago" },
  { id: 4, partner: "Roberto Lima", amount: 2100, date: "2025-05-01", method: "Transferência", status: "pago" },
  { id: 5, partner: "Carlos Almeida", amount: 1700, date: "2025-07-01", method: "PIX", status: "pendente" },
  { id: 6, partner: "Roberto Lima", amount: 1700, date: "2025-07-01", method: "PIX", status: "pendente" },
];

const contracts = [
  { id: 1, title: "Contrato Social - FinanceFlow", date: "2025-01-01", signers: ["Carlos Almeida", "Roberto Lima"], status: "assinado" },
];

export default function AdminPartners() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Painel de Sócios</h2>
        <p className="text-muted-foreground">Gestão de sócios, pagamentos e contratos</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {partners.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 rounded-lg bg-muted">
                  <p className="font-bold">{p.share}</p>
                  <p className="text-xs text-muted-foreground">Participação</p>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <p className="font-bold">R$ {p.totalReceived.toLocaleString("pt-BR")}</p>
                  <p className="text-xs text-muted-foreground">Total Recebido</p>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <Badge variant="default">{p.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-5 w-5" /> Pagamentos</CardTitle>
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Registrar Pagamento</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sócio</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecionar sócio..." /></SelectTrigger>
                      <SelectContent>
                        {partners.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={() => { toast({ title: "Pagamento registrado!" }); setPaymentOpen(false); }}>
                    Registrar Pagamento
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
                <TableHead>Sócio</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.partner}</TableCell>
                  <TableCell>R$ {p.amount.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{new Date(p.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "pago" ? "default" : "secondary"}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="h-5 w-5" /> Contratos</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Signatários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{new Date(c.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{c.signers.join(", ")}</TableCell>
                  <TableCell><Badge variant="default">{c.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Download do contrato (simulado)" })}>
                      <Download className="h-4 w-4 mr-1" /> Baixar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button variant="outline" onClick={() => toast({ title: "Upload de contrato (simulado)" })}>
              <Upload className="h-4 w-4 mr-1" /> Fazer Upload de Contrato
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
