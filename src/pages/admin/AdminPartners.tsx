import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Handshake, DollarSign, Upload, Download, Plus, Shield, Trash2,
  Edit2, UserPlus, Eye, Settings, CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  partnerStore, Partner, PartnerPermissions, ALL_PERMISSIONS,
  DEFAULT_FULL_PERMISSIONS, DEFAULT_LIMITED_PERMISSIONS,
} from "@/lib/partnerStore";

export default function AdminPartners() {
  const [partners, setPartners] = useState(partnerStore.getPartners());
  const [payments, setPayments] = useState(partnerStore.getPayments());
  const [contracts] = useState(partnerStore.getContracts());

  const [addOpen, setAddOpen] = useState(false);
  const [permOpen, setPermOpen] = useState<Partner | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [newPartner, setNewPartner] = useState({ name: "", email: "", phone: "", share: "", role: "socio" as Partner["role"] });
  const [newPayment, setNewPayment] = useState({ partnerId: "", amount: "", method: "", description: "" });
  const [editPerms, setEditPerms] = useState<PartnerPermissions>({ ...DEFAULT_FULL_PERMISSIONS });

  const { toast } = useToast();

  const refresh = () => {
    setPartners(partnerStore.getPartners());
    setPayments(partnerStore.getPayments());
  };

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.email || !newPartner.share) {
      toast({ title: "Preencha nome, email e participação", variant: "destructive" });
      return;
    }
    const permissions = newPartner.role === "admin" ? { ...DEFAULT_FULL_PERMISSIONS }
      : newPartner.role === "socio" ? { ...DEFAULT_FULL_PERMISSIONS, configuracoes: false, seguranca: false }
      : { ...DEFAULT_LIMITED_PERMISSIONS };

    partnerStore.addPartner({
      name: newPartner.name,
      email: newPartner.email,
      phone: newPartner.phone,
      share: parseFloat(newPartner.share),
      role: newPartner.role,
      permissions,
      status: "ativo",
    });
    refresh();
    setNewPartner({ name: "", email: "", phone: "", share: "", role: "socio" });
    setAddOpen(false);
    toast({ title: `Sócio ${newPartner.name} adicionado!` });
  };

  const handleRemovePartner = (id: string, name: string) => {
    partnerStore.removePartner(id);
    refresh();
    toast({ title: `Sócio ${name} removido` });
  };

  const handleToggleStatus = (p: Partner) => {
    const newStatus = p.status === "ativo" ? "inativo" : "ativo";
    partnerStore.updatePartner(p.id, { status: newStatus });
    refresh();
    toast({ title: `${p.name} agora está ${newStatus}` });
  };

  const openPermissions = (p: Partner) => {
    setPermOpen(p);
    setEditPerms({ ...p.permissions });
  };

  const savePermissions = () => {
    if (permOpen) {
      partnerStore.updatePermissions(permOpen.id, editPerms);
      refresh();
      setPermOpen(null);
      toast({ title: `Permissões de ${permOpen.name} atualizadas!` });
    }
  };

  const handleAddPayment = () => {
    if (!newPayment.partnerId || !newPayment.amount || !newPayment.method) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const partner = partners.find((p) => p.id === newPayment.partnerId);
    partnerStore.addPayment({
      partnerId: newPayment.partnerId,
      partnerName: partner?.name || "",
      amount: parseFloat(newPayment.amount),
      date: new Date().toISOString().split("T")[0],
      method: newPayment.method,
      status: "pendente",
      description: newPayment.description || "Repasse",
    });
    refresh();
    setNewPayment({ partnerId: "", amount: "", method: "", description: "" });
    setPaymentOpen(false);
    toast({ title: "Pagamento registrado!" });
  };

  const roleLabel = (role: Partner["role"]) =>
    role === "admin" ? "Administrador" : role === "socio" ? "Sócio" : "Sócio Limitado";

  const permCount = (p: PartnerPermissions) => Object.values(p).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Painel de Sócios</h2>
          <p className="text-muted-foreground">Gestão de sócios, permissões, pagamentos e contratos</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" /> Adicionar Sócio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Sócio</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input placeholder="Nome completo" value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="email@exemplo.com" value={newPartner.email} onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input placeholder="(00) 00000-0000" value={newPartner.phone} onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Participação (%) *</Label>
                  <Input type="number" placeholder="50" value={newPartner.share} onChange={(e) => setNewPartner({ ...newPartner, share: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select value={newPartner.role} onValueChange={(v) => setNewPartner({ ...newPartner, role: v as Partner["role"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador — Acesso total</SelectItem>
                    <SelectItem value="socio">Sócio — Acesso parcial</SelectItem>
                    <SelectItem value="socio_limitado">Sócio Limitado — Apenas dashboard e relatórios</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  As permissões podem ser personalizadas depois de adicionar o sócio.
                </p>
              </div>
              <Button onClick={handleAddPartner} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" /> Adicionar Sócio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="socios">
        <TabsList>
          <TabsTrigger value="socios">Sócios & Permissões</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>

        {/* TAB: SÓCIOS */}
        <TabsContent value="socios" className="space-y-4 mt-4">
          {partners.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        <Badge variant={p.status === "ativo" ? "default" : "secondary"}>{p.status}</Badge>
                        <Badge variant="outline">{roleLabel(p.role)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.email} · {p.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-center text-sm">
                    <div className="p-2 rounded-lg bg-muted min-w-[70px]">
                      <p className="font-bold">{p.share}%</p>
                      <p className="text-xs text-muted-foreground">Participação</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted min-w-[100px]">
                      <p className="font-bold">R$ {p.totalReceived.toLocaleString("pt-BR")}</p>
                      <p className="text-xs text-muted-foreground">Recebido</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted min-w-[80px]">
                      <p className="font-bold">{permCount(p.permissions)}/8</p>
                      <p className="text-xs text-muted-foreground">Permissões</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openPermissions(p)} title="Editar permissões">
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(p)} title={p.status === "ativo" ? "Desativar" : "Ativar"}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemovePartner(p.id, p.name)} title="Remover sócio">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mini permission badges */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
                  {ALL_PERMISSIONS.map((perm) => (
                    <Badge
                      key={perm.key}
                      variant={p.permissions[perm.key] ? "default" : "secondary"}
                      className={`text-xs ${p.permissions[perm.key] ? "" : "opacity-40"}`}
                    >
                      {perm.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {partners.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhum sócio cadastrado. Clique em "Adicionar Sócio" para começar.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: PAGAMENTOS */}
        <TabsContent value="pagamentos" className="mt-4">
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
                        <Label>Sócio *</Label>
                        <Select value={newPayment.partnerId} onValueChange={(v) => setNewPayment({ ...newPayment, partnerId: v })}>
                          <SelectTrigger><SelectValue placeholder="Selecionar sócio..." /></SelectTrigger>
                          <SelectContent>
                            {partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Valor (R$) *</Label>
                          <Input type="number" placeholder="0,00" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Forma *</Label>
                          <Select value={newPayment.method} onValueChange={(v) => setNewPayment({ ...newPayment, method: v })}>
                            <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PIX">PIX</SelectItem>
                              <SelectItem value="Transferência">Transferência</SelectItem>
                              <SelectItem value="Boleto">Boleto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input placeholder="Ex: Repasse mensal" value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} />
                      </div>
                      <Button className="w-full" onClick={handleAddPayment}>Registrar Pagamento</Button>
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
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.partnerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.description}</TableCell>
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
        </TabsContent>

        {/* TAB: CONTRATOS */}
        <TabsContent value="contratos" className="mt-4">
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
        </TabsContent>
      </Tabs>

      {/* DIALOG: PERMISSÕES */}
      <Dialog open={!!permOpen} onOpenChange={() => setPermOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Permissões de {permOpen?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-muted-foreground mb-3">
              Defina quais seções do painel administrativo este sócio pode acessar.
            </p>
            {ALL_PERMISSIONS.map((perm) => (
              <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium">{perm.label}</p>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
                <Switch
                  checked={editPerms[perm.key]}
                  onCheckedChange={(checked) => setEditPerms({ ...editPerms, [perm.key]: checked })}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditPerms({ ...DEFAULT_FULL_PERMISSIONS })}
              >
                Marcar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditPerms({ ...DEFAULT_LIMITED_PERMISSIONS })}
              >
                Apenas Básicos
              </Button>
              <div className="flex-1" />
              <Button onClick={savePermissions}>
                <CheckCircle className="h-4 w-4 mr-2" /> Salvar Permissões
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
