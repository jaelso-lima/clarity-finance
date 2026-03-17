import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, ChevronRight, CreditCard, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast({ title: "Erro ao enviar foto", description: uploadError.message, variant: "destructive" }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setAvatarUrl(url);
    setUploading(false);
    toast({ title: "Foto atualizada!" });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Perfil atualizado!" }); }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-4 animate-scale-in">
        <div className="relative mb-3">
          <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">{fullName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform"
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
        <h2 className="font-display text-xl font-bold">{fullName || "Sem nome"}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {uploading && <p className="text-xs text-primary mt-1">Enviando foto...</p>}
      </div>

      {/* Edit Form */}
      <Card className="animate-slide-up">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">E-mail</Label>
            <Input value={user?.email || ""} disabled className="bg-muted h-11" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="h-11" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary border-0 h-11">
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-0 divide-y divide-border">
          <Link to="/planos" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Meu Plano</p>
                <p className="text-xs text-muted-foreground">Gerenciar assinatura</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <button onClick={handleLogout} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-sm text-destructive">Sair da conta</p>
                <p className="text-xs text-muted-foreground">Encerrar sessão</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
