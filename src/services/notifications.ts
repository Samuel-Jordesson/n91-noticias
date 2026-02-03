import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationRead = Database['public']['Tables']['notification_reads']['Row'];

// Buscar todas as notificações (para admins, editores e devs)
export const getAllNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Buscar perfis dos criadores
  const creatorIds = [...new Set(data?.map(n => n.created_by).filter(Boolean) || [])];
  const profilesMap = new Map();
  
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', creatorIds);
    
    profiles?.forEach(p => profilesMap.set(p.id, p));
  }
  
  return data?.map(n => ({
    ...n,
    created_by_profile: n.created_by ? profilesMap.get(n.created_by) || null : null,
  })) || [];
};

// Buscar notificações não lidas do usuário atual
export const getUnreadNotifications = async (userId: string) => {
  const { data: notifications, error: notificationsError } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (notificationsError) throw notificationsError;

  // Buscar quais notificações foram lidas pelo usuário
  const { data: reads, error: readsError } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', userId);

  if (readsError) throw readsError;

  const readIds = new Set(reads?.map(r => r.notification_id) || []);

  // Filtrar notificações não lidas
  const unread = notifications?.filter(n => !readIds.has(n.id)) || [];

  // Buscar perfis dos criadores
  const creatorIds = [...new Set(unread.map(n => n.created_by).filter(Boolean))];
  const profilesMap = new Map();
  
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', creatorIds);
    
    profiles?.forEach(p => profilesMap.set(p.id, p));
  }
  
  return unread.map(n => ({
    ...n,
    created_by_profile: n.created_by ? profilesMap.get(n.created_by) || null : null,
  }));
};

// Contar notificações não lidas
export const getUnreadCount = async (userId: string): Promise<number> => {
  const unread = await getUnreadNotifications(userId);
  return unread.length;
};

// Criar notificação (apenas devs)
export const createNotification = async (notification: Omit<NotificationInsert, 'created_by'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) throw error;
  
  // Buscar perfil do criador
  let created_by_profile = null;
  if (data.created_by) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', data.created_by)
      .single();
    created_by_profile = profile;
  }
  
  return { ...data, created_by_profile } as Notification & { created_by_profile: { name: string; email: string } | null };
};

// Marcar notificação como lida
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const { data, error } = await supabase
    .from('notification_reads')
    .insert({
      notification_id: notificationId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    // Se já foi marcada como lida, não é um erro
    if (error.code === '23505') {
      return null;
    }
    throw error;
  }
  return data as NotificationRead;
};

// Deletar notificação (apenas devs)
export const deleteNotification = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
};

// Upload de imagem para notificação
export const uploadNotificationImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `notification-${Date.now()}.${fileExt}`;
  const filePath = `notifications/${fileName}`;

  // Fazer upload no bucket 'images'
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    // Se o bucket não existir, usar data URL como fallback
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
};
