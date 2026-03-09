import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Crown, Ban, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const mockUsers = [
  { id: "1", name: "João Silva", email: "joao@email.com", plan: "PRO", status: "ativo", joined: "2025-01-15", expenses: 2400, income: 5000 },
  { id: "2", name: "Maria Santos", email: "maria@email.com", plan: "Free", status: "ativo", joined: "2025-02-20", expenses: 1800, income: 3500 },
  { id: "3", name: "Pedro Oliveira", email: "pedro@email.com", plan: "PRO", status: "ativo", joined: "2025-03-10", expenses: 3200, income: 7000 },
  { id: "4", name: "Ana Costa", email: "ana@email.com", plan: "Free", status: "bloqueado", joined: "2025-01-25", expenses: 900, income: 2800 },
  { id: "5", name: "Lucas Ferreira", email: "lucas@email.com", plan: "PRO (Indicação)", status: "ativo", joined: "2025-04-05", expenses: 1500, income: 4200 },
  { id: "6", name: "Camila Souza", email: "camila@email.com", plan: "Free", status: "ativo", joined: "2025-05-12", expenses: 2100, income: 3800 },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const { toast } = useToast();

  const filtered = mockUsers.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (action: string, user: typeof mockUsers[0]) => {
    toast({
      title: `Ação: ${action}`,
      description: `Ação "${action}" executada para ${user.name}. (Simulado)`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Gestão de Usuários</h2>
        <p className="text-muted-foreground">Gerencie os usuários da plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-base">Usuários ({filtered.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.plan.includes("PRO") ? "default" : "secondary"}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ativo" ? "outline" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.joined).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Ativar PRO", user)}>
                          <Crown className="h-4 w-4 mr-2" /> Ativar PRO
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Bloquear", user)}>
                          <Ban className="h-4 w-4 mr-2" /> Bloquear
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Excluir", user)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Nome:</span> <strong>{selectedUser.name}</strong></div>
                <div><span className="text-muted-foreground">Email:</span> <strong>{selectedUser.email}</strong></div>
                <div><span className="text-muted-foreground">Plano:</span> <Badge variant="default">{selectedUser.plan}</Badge></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{selectedUser.status}</Badge></div>
                <div><span className="text-muted-foreground">Receita:</span> <strong>R$ {selectedUser.income.toLocaleString("pt-BR")}</strong></div>
                <div><span className="text-muted-foreground">Despesas:</span> <strong>R$ {selectedUser.expenses.toLocaleString("pt-BR")}</strong></div>
                <div><span className="text-muted-foreground">Saldo:</span> <strong className={selectedUser.income - selectedUser.expenses > 0 ? "text-primary" : "text-destructive"}>R$ {(selectedUser.income - selectedUser.expenses).toLocaleString("pt-BR")}</strong></div>
                <div><span className="text-muted-foreground">Cadastro:</span> <strong>{new Date(selectedUser.joined).toLocaleDateString("pt-BR")}</strong></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => { handleAction("Ativar PRO", selectedUser); setSelectedUser(null); }}>
                  <Crown className="h-4 w-4 mr-1" /> Ativar PRO
                </Button>
                <Button size="sm" variant="outline" onClick={() => { handleAction("Remover PRO", selectedUser); setSelectedUser(null); }}>
                  Remover PRO
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { handleAction("Bloquear", selectedUser); setSelectedUser(null); }}>
                  <Ban className="h-4 w-4 mr-1" /> Bloquear
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
