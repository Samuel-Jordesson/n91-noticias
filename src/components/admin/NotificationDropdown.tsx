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
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-slate-400 hover:text-[#21366B] hover:bg-slate-50 rounded-lg transition-all">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#47B354] border-2 border-white rounded-full"></span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 sm:w-96 p-0 font-roboto bg-white border border-slate-100 rounded-2xl shadow-lg"
        sideOffset={8}
        alignOffset={-4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        avoidCollisions={true}
        collisionPadding={8}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Notificações</h3>
              {unreadCount > 0 ? (
                <p className="text-xs text-slate-500 font-medium">
                  {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-medium">
                  Todas as notificações foram lidas
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <div className="w-6 h-6 rounded-full bg-[#47B354] flex items-center justify-center text-white text-[10px] font-bold">
                {unreadCount}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[450px]">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 border border-slate-100 rounded-xl">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : unreadNotifications && unreadNotifications.length > 0 ? (
            <div className="p-4 space-y-1">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 cursor-pointer transition-all duration-200"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.image_url && (
                    <div className="mb-3 overflow-hidden rounded-lg">
                      <img
                        src={notification.image_url}
                        alt={notification.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-[#47B354]/10 text-[#47B354] text-[9px] font-bold uppercase tracking-wider">
                        Novidade
                      </span>
                    </div>
                    <h4 className="text-[13px] font-semibold text-slate-700 leading-tight group-hover:text-[#21366B] transition-colors">
                      {notification.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock size={10} className="text-[#21366B]" />
                        <span>
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      {notification.created_by_profile && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <User size={10} className="text-[#21366B]" />
                          <span>{notification.created_by_profile.name}</span>
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
                <div className="p-4 rounded-full bg-slate-50">
                  <Bell className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-1">
                    Nenhuma notificação nova
                  </p>
                  <p className="text-xs text-slate-400">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-roboto bg-white border border-slate-100 rounded-2xl">
          {selectedNotification && (
            <>
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg font-bold text-[#21366B] tracking-tight">
                  {selectedNotification.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedNotification.image_url && (
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={selectedNotification.image_url}
                      alt={selectedNotification.title}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Clock size={12} className="text-[#21366B]" />
                    <span>
                      {format(new Date(selectedNotification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {selectedNotification.created_by_profile && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <User size={12} className="text-[#21366B]" />
                      <span>
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
