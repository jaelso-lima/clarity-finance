import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const mockNotifications = [
  { id: "1", message: "Você gastou 20% a mais este mês", type: "warning" as const, time: "2h atrás", read: false },
  { id: "2", message: "Parabéns! Você economizou R$300 este mês 🎉", type: "success" as const, time: "1d atrás", read: false },
  { id: "3", message: "Seu score financeiro aumentou para 72!", type: "info" as const, time: "2d atrás", read: true },
  { id: "4", message: "Conta de luz vence em 3 dias", type: "warning" as const, time: "3d atrás", read: true },
];

export function NotificationBell() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <p className="font-semibold text-sm">Notificações</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Marcar todas como lidas</button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map(n => (
            <div key={n.id} className={`p-3 border-b last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
