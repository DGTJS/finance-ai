"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaExclamationCircle, FaLightbulb, FaCreditCard, FaInfoCircle } from "react-icons/fa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from "@/app/_actions/notifications";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "SUBSCRIPTION_DUE" | "AI_INSIGHT" | "TRANSACTION_ALERT" | "SYSTEM";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  meta?: any;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "SUBSCRIPTION_DUE":
      return <FaCreditCard className="h-4 w-4 text-orange-500" />;
    case "AI_INSIGHT":
      return <FaLightbulb className="h-4 w-4 text-blue-500" />;
    case "TRANSACTION_ALERT":
      return <FaExclamationCircle className="h-4 w-4 text-red-500" />;
    case "SYSTEM":
      return <FaInfoCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <FaBell className="h-4 w-4" />;
  }
};

export default function NotificationsDropdown() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await getUserNotifications();
      if (result.success) {
        setNotifications(result.data as Notification[]);
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadNotifications();
      // Recarregar notificações a cada 30 segundos
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } else {
      toast.error(result.error || "Erro ao marcar notificação como lida");
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Todas as notificações foram marcadas como lidas");
    } else {
      toast.error(result.error || "Erro ao marcar notificações como lidas");
    }
  };

  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const deleted = notifications.find((n) => n.id === notificationId);
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success("Notificação removida");
    } else {
      toast.error(result.error || "Erro ao remover notificação");
    }
  };

  if (!session?.user?.id) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-0 text-xs"
            >
              <FaCheckDouble className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground text-sm">Carregando...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FaBell className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-muted-foreground mt-2 text-xs">
                            {format(new Date(notification.createdAt), "dd 'de' MMM 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <FaCheck className="h-3 w-3 mr-1" />
                            Marcar como lida
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <FaTrash className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

