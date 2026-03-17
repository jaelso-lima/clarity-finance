import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, ShoppingCart, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const COIN_PACKAGES = [
  { id: "pack-10", coins: 10, price: 9.90, label: "Iniciante", popular: false },
  { id: "pack-50", coins: 50, price: 39.90, label: "Popular", popular: true, savings: "20% OFF" },
  { id: "pack-100", coins: 100, price: 69.90, label: "Melhor Valor", popular: false, savings: "30% OFF" },
];

interface CoinPackagesProps {
  onPurchase: () => Promise<void>;
}

export default function CoinPackages({ onPurchase }: CoinPackagesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<typeof COIN_PACKAGES[0] | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const handleSelectPack = (pack: typeof COIN_PACKAGES[0]) => {
    setSelectedPack(pack);
    setBuyOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPack || !user) return;
    setPurchasing(true);
    try {
      // For now, simulate purchase by crediting coins directly
      // In production, this would integrate with Stripe
      const { data: wallet } = await supabase
        .from("wallets")
        .select("subscription_balance")
        .eq("user_id", user.id)
        .single();

      await supabase.from("wallets").update({
        subscription_balance: (wallet?.subscription_balance || 0) + selectedPack.coins,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);

      await supabase.from("coin_transactions").insert({
        user_id: user.id,
        type: "purchase",
        amount: selectedPack.coins,
        balance_type: "subscription",
        description: `Compra de pacote — ${selectedPack.coins} Coins (R$${selectedPack.price.toFixed(2)})`,
      });

      toast({ title: "Compra realizada! 🎉", description: `${selectedPack.coins} Coins adicionados ao seu saldo.` });
      setBuyOpen(false);
      setSelectedPack(null);
      await onPurchase();
    } catch (err: any) {
      toast({ title: "Erro na compra", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-base sm:text-lg">Comprar Coins</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COIN_PACKAGES.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handleSelectPack(pack)}
                className={`relative rounded-xl border-2 p-4 text-center transition-all hover:scale-[1.02] hover:shadow-lg ${
                  pack.popular
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                {pack.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px]">
                    <Sparkles className="h-3 w-3 mr-1" /> Mais Popular
                  </Badge>
                )}
                {pack.savings && (
                  <Badge variant="destructive" className="absolute -top-2.5 right-2 text-[10px]">
                    {pack.savings}
                  </Badge>
                )}
                <Coins className={`h-8 w-8 mx-auto mb-2 ${pack.popular ? "text-primary" : "text-warning"}`} />
                <p className="text-2xl font-bold font-display">{pack.coins}</p>
                <p className="text-xs text-muted-foreground mb-2">Coins</p>
                <p className="text-lg font-bold text-foreground">
                  R$ {pack.price.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  R$ {(pack.price / pack.coins).toFixed(2).replace(".", ",")} por Coin
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" /> Confirmar Compra
            </DialogTitle>
          </DialogHeader>
          {selectedPack && (
            <div className="space-y-4 mt-2">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Coins className="h-10 w-10 mx-auto text-warning mb-2" />
                <p className="text-3xl font-bold font-display">{selectedPack.coins} Coins</p>
                <p className="text-xl font-bold text-primary mt-1">
                  R$ {selectedPack.price.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Coins creditados como saldo de assinatura</p>
                <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Use em desafios na Arena</p>
                <p className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Ganhos em desafios são sacáveis</p>
              </div>
              <Button
                onClick={handleConfirmPurchase}
                className="w-full gradient-primary border-0"
                disabled={purchasing}
              >
                {purchasing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Comprar {selectedPack.coins} Coins
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Pagamento simulado. Em breve integrado com Stripe.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
