import { useState } from "react";
import { Bell, Clock, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUnreadNotifications, useUnreadCount, useMarkAsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const NotificationDropdown = () => {
  const { data: unreadNotifications, isLoading } = useUnreadNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (selectedNotification) {
      // Marcar como lida quando fechar o modal
      markAsReadMutation.mutate(selectedNotification.id);
    }
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 font-roboto">
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base font-roboto">Notificações</h3>
              {unreadCount > 0 ? (
                <p className="text-xs text-muted-foreground mt-0.5 font-roboto">
                  {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5 font-roboto">
                  Todas as notificações foram lidas
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="font-roboto">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[450px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3 p-3 border rounded-lg">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : unreadNotifications && unreadNotifications.length > 0 ? (
            <div className="p-3 space-y-2">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group relative p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Indicador de não lida */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {notification.image_url && (
                    <div className="mb-3 overflow-hidden rounded-md">
                      <img
                        src={notification.image_url}
                        alt={notification.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm font-roboto leading-tight pr-6">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-3 font-roboto leading-relaxed">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span className="font-roboto">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      {notification.created_by_profile && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span className="font-roboto">{notification.created_by_profile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-muted">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium font-roboto text-foreground mb-1">
                    Nenhuma notificação nova
                  </p>
                  <p className="text-xs text-muted-foreground font-roboto">
                    Você está em dia com todas as notificações
                  </p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>

      {/* Modal de Notificação */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-roboto">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-roboto">
                  {selectedNotification.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedNotification.image_url && (
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={selectedNotification.image_url}
                      alt={selectedNotification.title}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-roboto">
                    {selectedNotification.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="font-roboto">
                      {format(new Date(selectedNotification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {selectedNotification.created_by_profile && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span className="font-roboto">
                        Por {selectedNotification.created_by_profile.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
