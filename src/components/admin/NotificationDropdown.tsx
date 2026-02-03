import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadNotifications, useUnreadCount, useMarkAsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationDropdown = () => {
  const { data: unreadNotifications, isLoading } = useUnreadNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();

  const handleNotificationClick = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
            </p>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : unreadNotifications && unreadNotifications.length > 0 ? (
            <div className="p-2">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 mb-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {notification.image_url && (
                    <img
                      src={notification.image_url}
                      alt={notification.title}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {notification.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    {notification.created_by_profile && (
                      <span className="text-xs text-muted-foreground">
                        Por {notification.created_by_profile.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação nova</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
