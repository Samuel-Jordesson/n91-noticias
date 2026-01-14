import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Eye, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAllPosts } from "@/hooks/usePosts";
import { useAllComments } from "@/hooks/useComments";
import { useAllAds } from "@/hooks/useAds";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: allPosts, isLoading: isLoadingPosts } = useAllPosts();
  const { data: allComments, isLoading: isLoadingComments } = useAllComments();
  const { data: allAds, isLoading: isLoadingAds } = useAllAds();

  // Calcular estatísticas
  const totalPosts = allPosts?.length || 0;
  const publishedPosts = allPosts?.filter(p => p.is_published).length || 0;
  const totalComments = allComments?.length || 0;
  const totalViews = allPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const totalAds = allAds?.length || 0;
  const activeAds = allAds?.filter(ad => ad.is_active).length || 0;

  // Calcular visualizações dos últimos 7 dias
  const getViewsLast7Days = () => {
    if (!allPosts || allPosts.length === 0) {
      // Retornar dados vazios se não houver posts
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      return days.map(day => ({ name: day, views: 0 }));
    }
    
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Somar views de posts publicados nesse dia específico
      const dayViews = allPosts
        .filter(post => {
          if (!post.is_published || !post.published_at) return false;
          const postDate = new Date(post.published_at);
          return postDate >= dayStart && postDate <= dayEnd;
        })
        .reduce((sum, post) => sum + (post.views || 0), 0);
      
      last7Days.push({
        name: days[date.getDay()],
        views: dayViews,
      });
    }
    
    return last7Days;
  };

  const chartData = getViewsLast7Days();

  // Posts recentes (últimos 5)
  const recentPosts = allPosts?.slice(0, 5) || [];

  const stats = [
    {
      title: "Total de Posts",
      value: totalPosts,
      icon: FileText,
      change: `${publishedPosts} publicados`,
      subtitle: `${totalPosts - publishedPosts} rascunhos`,
    },
    {
      title: "Comentários",
      value: totalComments,
      icon: MessageSquare,
      change: "Total",
      subtitle: "Todos os comentários",
    },
    {
      title: "Visualizações",
      value: totalViews.toLocaleString("pt-BR"),
      icon: Eye,
      change: "Total",
      subtitle: "Todas as visualizações",
    },
    {
      title: "Anúncios",
      value: totalAds,
      icon: TrendingUp,
      change: `${activeAds} ativos`,
      subtitle: `${totalAds - activeAds} inativos`,
    },
  ];
  if (isLoadingPosts || isLoadingComments || isLoadingAds) {
    return (
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visualizações por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum post ainda
                </p>
              ) : (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/noticia/${post.id}`}
                    className="flex items-start gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.categories?.name || "Sem categoria"} • {post.profiles?.name || "Desconhecido"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {post.published_at
                          ? format(new Date(post.published_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : "Não publicado"}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Título
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Categoria
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Autor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhum post ainda
                    </td>
                  </tr>
                ) : (
                  recentPosts.map((post) => (
                    <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <Link
                          to={`/noticia/${post.id}`}
                          className="font-medium line-clamp-1 max-w-xs hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="news-category-badge">
                          {post.categories?.name || "Sem categoria"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {post.profiles?.name || "Desconhecido"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {(post.views || 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        {post.is_published ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                            Rascunho
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
