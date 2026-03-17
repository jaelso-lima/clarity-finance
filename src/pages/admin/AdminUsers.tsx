import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Crown, Ban, Trash2, Eye, MoreHorizontal, RefreshCw, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  joined: string;
  avatar_url?: string;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-users", {
        body: { action: "list" },
      });
      if (res.error) throw res.error;
      setUsers(res.data.users || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar usuários", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action: string, user: AdminUser) => {
    setActionLoading(user.id);
    try {
      const res = await supabase.functions.invoke("admin-users", {
        body: { action, userId: user.id },
      });
      if (res.error) throw res.error;
      toast({ title: "Sucesso", description: res.data.message });
      setSelectedUser(null);
      setDeleteConfirm(null);
      await fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display">Gestão de Usuários</h2>
          <p className="text-muted-foreground">Gerencie os usuários da plataforma</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                      <Badge variant={user.plan !== "Free" ? "default" : "secondary"}>{user.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "ativo" ? "outline" : "destructive"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.joined).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={actionLoading === user.id}>
                            {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                          </DropdownMenuItem>
                          {user.status === "ativo" ? (
                            <DropdownMenuItem onClick={() => handleAction("block", user)}>
                              <Ban className="h-4 w-4 mr-2" /> Bloquear
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAction("unblock", user)}>
                              <Ban className="h-4 w-4 mr-2" /> Desbloquear
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDeleteConfirm(user)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User details dialog */}
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
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={selectedUser.status === "ativo" ? "outline" : "destructive"}>{selectedUser.status}</Badge></div>
                <div><span className="text-muted-foreground">Cadastro:</span> <strong>{new Date(selectedUser.joined).toLocaleDateString("pt-BR")}</strong></div>
              </div>
              <div className="flex gap-2 pt-2">
                {selectedUser.status === "ativo" ? (
                  <Button size="sm" variant="destructive" onClick={() => handleAction("block", selectedUser)} disabled={!!actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Ban className="h-4 w-4 mr-1" />} Bloquear
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleAction("unblock", selectedUser)} disabled={!!actionLoading}>
                    Desbloquear
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => { setSelectedUser(null); setDeleteConfirm(selectedUser); }} disabled={!!actionLoading}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.email})?
              Esta ação é irreversível e todos os dados do usuário serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleAction("delete", deleteConfirm)}
              disabled={!!actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
