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
import { generateSlug } from "@/lib/utils";

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
              {stat.subtitle && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Visualizações por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                  Nenhum post ainda
                </p>
              ) : (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/noticia/${generateSlug(post.title)}`}
                    className="flex items-start gap-2 sm:gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {post.categories?.name || "Sem categoria"} • {post.profiles?.name || "Desconhecido"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Posts Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Título
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    Categoria
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Autor
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Views
                  </th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                      Nenhum post ainda
                    </td>
                  </tr>
                ) : (
                  recentPosts.map((post) => (
                    <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <Link
                          to={`/noticia/${generateSlug(post.title)}`}
                          className="font-medium text-xs sm:text-sm line-clamp-2 max-w-xs hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                        <div className="mt-1 sm:hidden">
                          <span className="news-category-badge text-[10px]">
                            {post.categories?.name || "Sem categoria"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <span className="news-category-badge text-xs">
                          {post.categories?.name || "Sem categoria"}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">
                        {post.profiles?.name || "Desconhecido"}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                        {(post.views || 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        {post.is_published ? (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
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
