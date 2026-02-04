import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Eye, TrendingUp, Calendar, ArrowUpRight, Megaphone } from "lucide-react";
import { useAllPosts, useMostViewedPosts } from "@/hooks/usePosts";
import { useAllComments } from "@/hooks/useComments";
import { useAllAds } from "@/hooks/useAds";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { generateSlug } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DateFilterType = 'week' | 'month' | 'year' | 'custom';

const AdminDashboard = () => {
  const { data: allPosts, isLoading: isLoadingPosts } = useAllPosts();
  const { data: allComments, isLoading: isLoadingComments } = useAllComments();
  const { data: allAds, isLoading: isLoadingAds } = useAllAds();
  const { data: mostViewedPosts, isLoading: isLoadingMostViewed } = useMostViewedPosts(5);

  // Estado para filtros de data
  const [dateFilter, setDateFilter] = useState<DateFilterType>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calcular estatísticas
  const totalPosts = allPosts?.length || 0;
  const publishedPosts = allPosts?.filter(p => p.is_published).length || 0;
  const totalComments = allComments?.length || 0;
  const totalViews = allPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const totalAds = allAds?.length || 0;
  const activeAds = allAds?.filter(ad => ad.is_active).length || 0;

  // Calcular intervalo de datas baseado no filtro
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    switch (dateFilter) {
      case 'week': {
        const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        return { start: weekStart, end: weekEnd };
      }
      case 'month': {
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return { start: monthStart, end: monthEnd };
      }
      case 'year': {
        const yearStart = startOfYear(today);
        const yearEnd = endOfYear(today);
        return { start: yearStart, end: yearEnd };
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate + 'T23:59:59'),
          };
        }
        // Fallback para semana se não houver datas customizadas
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        return { start: weekStart, end: weekEnd };
      }
      default:
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        return { start: weekStart, end: weekEnd };
    }
  }, [dateFilter, customStartDate, customEndDate]);

  // Calcular dados do gráfico de visualizações
  const chartData = useMemo(() => {
    if (!allPosts || allPosts.length === 0) {
      return [];
    }

    const { start, end } = dateRange;
    const days: { date: Date; name: string; views: number; posts: number }[] = [];
    
    // Criar array de dias no intervalo
    let currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= end) {
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Filtrar posts publicados neste dia e somar visualizações
      const dayPosts = allPosts.filter(post => {
        if (!post.is_published || !post.published_at) return false;
        const postDate = new Date(post.published_at);
        return postDate >= currentDate && postDate <= dayEnd;
      });
      
      const dayViews = dayPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      
      days.push({
        date: new Date(currentDate),
        name: format(currentDate, 'dd/MM', { locale: ptBR }),
        views: dayViews,
        posts: dayPosts.length,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [allPosts, dateRange]);


  // Posts recentes (últimos 5, ordenados por data de criação)
  const recentPosts = useMemo(() => {
    if (!allPosts) return [];
    return [...allPosts]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [allPosts]);

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

  const StatCard = ({ title, value, subtitle, icon: Icon, isSuccess }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{title}</span>
          <span className="text-3xl font-bold text-[#21366B] tracking-tight">{value}</span>
        </div>
        <div className={`p-2.5 rounded-xl ${isSuccess ? 'bg-[#47B354]/10 text-[#47B354]' : 'bg-[#21366B]/5 text-[#21366B]'}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
        <span className="text-[11px] text-slate-400 font-medium">{subtitle}</span>
        <div className={`flex items-center gap-0.5 font-bold text-[10px] ${isSuccess ? 'text-[#47B354]' : 'text-indigo-500'}`}>
          <ArrowUpRight size={12} />
          {isSuccess ? 'CRESCIMENTO' : 'ESTÁVEL'}
        </div>
      </div>
    </div>
  );

  const RankedPost = ({ rank, title, views, category }: any) => (
    <div className="flex items-center gap-4 group p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
      <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover:bg-[#21366B] group-hover:text-white transition-all shrink-0">
        {rank}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <h4 className="text-[13px] font-semibold text-slate-700 truncate mb-1 group-hover:text-[#21366B] transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <Eye size={10} className="text-[#21366B]" />
            {views} visualizações
          </div>
          <span className="px-1.5 py-0.5 rounded bg-[#47B354]/10 text-[#47B354] text-[9px] font-bold uppercase tracking-wider">
            {category}
                      </span>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Painel de Controle">
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total de Posts" 
            value={totalPosts.toString()} 
            subtitle="Conteúdo publicado" 
            icon={FileText}
          />
          <StatCard 
            title="Comentários" 
            value={totalComments.toString()} 
            subtitle="Interações do público" 
            icon={MessageSquare}
            isSuccess={totalComments > 0}
          />
          <StatCard 
            title="Visualizações" 
            value={totalViews.toLocaleString("pt-BR")} 
            subtitle="Acessos no período" 
            icon={Eye}
          />
          <StatCard 
            title="Anúncios" 
            value={totalAds.toString()} 
            subtitle="Campanhas rodando" 
            icon={Megaphone}
            isSuccess={activeAds > 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-[#21366B] tracking-tight">Visualizações por Dia</h3>
                <span className="text-xs text-slate-400">Análise de tráfego semanal</span>
              </div>
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilterType)}>
                <SelectTrigger className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-slate-300 transition-all w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="custom">Período Customizado</SelectItem>
                </SelectContent>
              </Select>
              {dateFilter === 'custom' && (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-xs w-32"
                  />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-xs w-32"
                  />
                </div>
              )}
            </div>
            
            {chartData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-400">
                <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
              </div>
            ) : (
              <div className="h-[280px] w-full flex flex-col justify-end">
                <div className="flex items-end justify-around h-full px-2">
                  {chartData.map((data, i) => {
                    const maxViews = Math.max(...chartData.map(d => d.views));
                    const height = maxViews > 0 ? (data.views / maxViews) * 100 : 0;
                    return (
                      <div key={i} className="w-10 relative group">
                        <div 
                          style={{ height: `${height}%` }} 
                          className="w-full bg-[#21366B]/10 rounded-t-md group-hover:bg-[#21366B] transition-all duration-500 ease-out cursor-pointer relative"
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#21366B] text-white text-[9px] font-bold px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {data.views}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-around text-[10px] font-bold text-slate-300 border-t border-slate-50 pt-6 mt-2">
                  {chartData.map((data, i) => (
                    <span key={i}>{data.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Posts Mais Vistos */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Conteúdo em Destaque</h3>
              <TrendingUp size={16} className="text-[#47B354]" />
            </div>
            
            {isLoadingMostViewed ? (
              <div className="flex flex-col gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : mostViewedPosts && mostViewedPosts.length > 0 ? (
              <div className="flex flex-col gap-1">
                {mostViewedPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/noticia/${generateSlug(post.title)}`}
                  >
                    <RankedPost 
                      rank={index + 1} 
                      title={post.title} 
                      views={(post.views || 0).toLocaleString("pt-BR")} 
                      category={post.categories?.name || "Sem categoria"} 
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400">
                <p className="text-sm">Nenhum post visualizado ainda</p>
              </div>
            )}

            <button className="mt-8 w-full py-2.5 text-[11px] font-bold text-[#21366B] hover:bg-[#21366B] hover:text-white rounded-xl transition-all border border-[#21366B]/20">
              Exportar Relatório
            </button>
          </div>
        </div>

        {/* Posts Recentes */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Posts Recentes</h3>
            <Calendar size={16} className="text-[#21366B]" />
          </div>
          
          {isLoadingPosts ? (
            <div className="flex flex-col gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentPosts && recentPosts.length > 0 ? (
            <div className="flex flex-col gap-1">
              {recentPosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/admin/editor/${post.id}`}
                >
                  <div className="flex items-center gap-4 group p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover:bg-[#21366B] group-hover:text-white transition-all shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-[13px] font-semibold text-slate-700 truncate mb-1 group-hover:text-[#21366B] transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Calendar size={10} className="text-[#21366B]" />
                            {post.created_at ? format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR }) : "Sem data"}
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-[#47B354]/10 text-[#47B354] text-[9px] font-bold uppercase tracking-wider">
                            {post.categories?.name || "Sem categoria"}
                          </span>
                          {post.views && post.views > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Eye size={10} className="text-[#21366B]" />
                              {post.views.toLocaleString("pt-BR")} visualizações
                            </div>
                          )}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${
                          post.is_published 
                            ? 'bg-[#47B354]/10 text-[#47B354]' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {post.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400">
              <p className="text-sm">Nenhum post ainda</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
