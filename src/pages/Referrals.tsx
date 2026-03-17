import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Gift, Copy, Check, Share2, Trophy, Star, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const referralCode = "FINANCE-ABC123";
const referralLink = `https://financeflow.app/r/${referralCode}`;

const rewards = [
  { target: 3, reward: "1 mês de PRO grátis", reached: true },
  { target: 10, reward: "6 meses de PRO grátis", reached: false },
  { target: 25, reward: "1 ano de PRO grátis", reached: false },
  { target: 50, reward: "PRO vitalício", reached: false },
];

const referralHistory = [
  { name: "Maria S.", date: "05/03/2026", status: "ativo" },
  { name: "João P.", date: "01/03/2026", status: "ativo" },
  { name: "Ana L.", date: "25/02/2026", status: "ativo" },
  { name: "Pedro M.", date: "20/02/2026", status: "pendente" },
];

export default function Referrals() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const totalReferrals = 4;
  const activeReferrals = 3;

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Link copiado!", description: "Compartilhe com seus amigos" });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare(platform: string) {
    const text = `Organize suas finanças com o FinanceFlow! Use meu link: ${referralLink}`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      instagram: `https://www.instagram.com/`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank");
  }

  const nextReward = rewards.find(r => !r.reached);
  const progressToNext = nextReward ? (activeReferrals / nextReward.target) * 100 : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Programa de Indicação</h1>
        <p className="text-muted-foreground">Convide amigos e ganhe recompensas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Users className="h-6 w-6 text-primary mx-auto mb-1" /><p className="font-display text-2xl font-bold">{totalReferrals}</p><p className="text-xs text-muted-foreground">Indicações</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Check className="h-6 w-6 text-success mx-auto mb-1" /><p className="font-display text-2xl font-bold">{activeReferrals}</p><p className="text-xs text-muted-foreground">Ativos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Gift className="h-6 w-6 text-warning mx-auto mb-1" /><p className="font-display text-2xl font-bold">1</p><p className="text-xs text-muted-foreground">Recompensas ganhas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Trophy className="h-6 w-6 text-accent mx-auto mb-1" /><p className="font-display text-2xl font-bold">1 mês</p><p className="text-xs text-muted-foreground">PRO grátis ganho</p></CardContent></Card>
      </div>

      {/* Share Link */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Seu Link de Indicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")} className="gap-2">
              <Share2 className="h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("twitter")} className="gap-2">
              <Share2 className="h-4 w-4" /> Twitter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Recompensas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextReward && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para: {nextReward.reward}</span>
                <span className="font-semibold">{activeReferrals}/{nextReward.target}</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map((r) => (
              <div key={r.target} className={`flex items-center gap-3 p-3 rounded-lg border ${r.reached ? "bg-success/5 border-success/20" : "bg-muted/30"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${r.reached ? "gradient-primary" : "bg-muted"}`}>
                  <Star className={`h-4 w-4 ${r.reached ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{r.target} amigos → {r.reward}</p>
                  {r.reached && <Badge variant="default" className="text-xs mt-0.5">Conquistado!</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Histórico de Indicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {referralHistory.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                </div>
                <Badge variant={r.status === "ativo" ? "default" : "secondary"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
