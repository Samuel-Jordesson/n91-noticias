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
import { useMemo } from "react";

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

  // Calcular visualizações dos últimos 7 dias com memoização
  const chartData = useMemo(() => {
    if (!allPosts || allPosts.length === 0) {
      // Retornar dados vazios se não houver posts
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      return days.map(day => ({ name: day, views: 0 }));
    }
    
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last7Days = [];
    
    // Calcular os últimos 7 dias em ordem cronológica
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
          postDate.setHours(0, 0, 0, 0);
          return postDate.getTime() === dayStart.getTime();
        })
        .reduce((sum, post) => sum + (post.views || 0), 0);
      
      last7Days.push({
        name: days[date.getDay()],
        views: dayViews,
      });
    }
    
    return last7Days;
  }, [allPosts]);

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
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="p-2 sm:p-3 md:p-4 lg:p-6">
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                </CardHeader>
                <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6 pt-0">
                  <Skeleton className="h-6 sm:h-8 md:h-10 w-12 sm:w-16 mb-2" />
                  <Skeleton className="h-3 w-24 sm:w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <Card className="w-full lg:col-span-2">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <Skeleton className="h-[180px] sm:h-[220px] md:h-[280px] w-full" />
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 sm:h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
            </CardHeader>
            <CardContent className="p-0 sm:p-3 md:p-6">
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 sm:h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="animate-fade-in overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-2 sm:p-3 md:p-4 lg:p-6">
                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate pr-1 min-w-0">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6 pt-0">
                <div className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold truncate mb-1">{stat.value}</div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-clamp-1">
                  {stat.change}
                </p>
                {stat.subtitle && (
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {stat.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts - Mobile: Stacked, Desktop: Side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Chart Card */}
          <Card className="w-full lg:col-span-2 overflow-hidden">
            <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">Visualizações por Dia</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      width={35}
                    />
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
          <Card className="w-full overflow-hidden">
            <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
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
      <Card className="overflow-hidden">
          <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Posts Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-3 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[450px] sm:min-w-full">
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
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-[#47B354]/20 text-[#47B354] dark:bg-[#47B354]/30 dark:text-[#47B354]">
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
