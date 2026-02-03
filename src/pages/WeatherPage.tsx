import MainLayout from "@/layouts/MainLayout";
import NewsCard from "@/components/NewsCard";
import AdCarousel from "@/components/AdCarousel";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Cloud, Wind, Droplets, Thermometer, MapPin } from "lucide-react";
import { useCurrentWeather, useForecast, useCitiesWeather } from "@/hooks/useWeather";
import { useAdsByPosition } from "@/hooks/useAds";
import { usePostsByCategory } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import type { PostWithCategory } from "@/services/posts";
import type { NewsArticle } from "@/types/news";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Cidades da região Norte e outras importantes
const availableCities = [
  { name: "Belém", state: "PA", region: "Norte" },
  { name: "Barcarena", state: "PA", region: "Norte" },
  { name: "Ananindeua", state: "PA", region: "Norte" },
  { name: "Marituba", state: "PA", region: "Norte" },
  { name: "Manaus", state: "AM", region: "Norte" },
  { name: "Porto Velho", state: "RO", region: "Norte" },
  { name: "Rio Branco", state: "AC", region: "Norte" },
  { name: "Macapá", state: "AP", region: "Norte" },
  { name: "Boa Vista", state: "RR", region: "Norte" },
  { name: "Palmas", state: "TO", region: "Norte" },
  { name: "São Paulo", state: "SP", region: "Sudeste" },
  { name: "Rio de Janeiro", state: "RJ", region: "Sudeste" },
  { name: "Brasília", state: "DF", region: "Centro-Oeste" },
  { name: "Salvador", state: "BA", region: "Nordeste" },
  { name: "Curitiba", state: "PR", region: "Sul" },
  { name: "Porto Alegre", state: "RS", region: "Sul" },
  { name: "Recife", state: "PE", region: "Nordeste" },
];

// Converter post do Supabase para NewsArticle
const convertPostToNewsArticle = (post: PostWithCategory): NewsArticle => {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    imageUrl: post.image_url,
    category: post.categories?.name || "Geral",
    author: post.profiles?.name || "Desconhecido",
    publishedAt: post.published_at ? new Date(post.published_at) : new Date(post.created_at),
    isBreaking: post.is_breaking,
    views: post.views,
  };
};

const WeatherPage = () => {
  const [selectedCity, setSelectedCity] = useState("Belém");
  const { data: bannerAds } = useAdsByPosition("banner");
  const { data: sidebarAds } = useAdsByPosition("sidebar");
  const { data: climatePosts } = usePostsByCategory("clima");
  
  // Converter posts de clima para NewsArticle
  const weatherNews = climatePosts?.map(convertPostToNewsArticle) || [];

  // Converter ads do Supabase para o formato esperado
  const convertAds = (ads: any[]) => {
    return ads?.map(ad => ({
      id: ad.id,
      title: ad.title,
      imageUrl: ad.image_url,
      link: ad.link,
      position: ad.position,
      isActive: ad.is_active,
    })) || [];
  };

  const bannerAdsConverted = convertAds(bannerAds || []);
  const sidebarAdsConverted = convertAds(sidebarAds || []);

  // Buscar dados reais do clima
  const { data: currentWeather, isLoading: isLoadingCurrent, error: errorCurrent } = useCurrentWeather(selectedCity);
  const { data: forecast, isLoading: isLoadingForecast } = useForecast(selectedCity);
  
  // Cidades para a sidebar (exceto a selecionada)
  const sidebarCities = availableCities
    .filter(city => city.name !== selectedCity)
    .slice(0, 6);
  
  const { data: cities, isLoading: isLoadingCities } = useCitiesWeather(
    sidebarCities.map(c => c.name)
  );

  // Função para obter ícone baseado no código do OpenWeatherMap
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <>
      <SEO
        title="Previsão do Tempo | Portal Barcarena - Clima e Meteorologia"
        description="Previsão do tempo atualizada para cidades do Brasil. Temperatura, umidade, vento e previsão para os próximos 7 dias. Clima em tempo real."
        keywords="previsão do tempo, clima, meteorologia, temperatura, chuva, brasil, belém, barcarena, manaus, previsão climática"
        type="website"
      />
      <MainLayout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/20">
                <Cloud className="h-6 w-6 text-sky-600 dark:text-sky-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Previsão do Tempo</h1>
            </div>
            
            {/* City Selector */}
            <div className="w-full sm:w-auto">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full sm:w-[280px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Norte" disabled className="font-semibold text-muted-foreground">
                    Região Norte
                  </SelectItem>
                  {availableCities
                    .filter(city => city.region === "Norte")
                    .map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name} - {city.state}
                      </SelectItem>
                    ))}
                  <SelectItem value="outras" disabled className="font-semibold text-muted-foreground mt-2">
                    Outras Regiões
                  </SelectItem>
                  {availableCities
                    .filter(city => city.region !== "Norte")
                    .map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name} - {city.state}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Weather Card */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            {isLoadingCurrent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-24 w-24 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              </div>
            ) : errorCurrent ? (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Erro ao carregar dados do clima. Tente novamente mais tarde.</p>
              </div>
            ) : currentWeather ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Weather */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20">
                      <img
                        src={getWeatherIcon(currentWeather.icon)}
                        alt={currentWeather.condition}
                        className="h-16 w-16"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{currentWeather.city}</span>
                    </div>
                    <div className="text-6xl font-bold text-foreground mb-1">{currentWeather.temp}°</div>
                    <p className="text-muted-foreground mb-2 capitalize">{currentWeather.condition}</p>
                    <p className="text-sm text-muted-foreground">
                      Máx: {currentWeather.high}° • Mín: {currentWeather.low}°
                    </p>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
                    <Thermometer className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Sensação</p>
                    <p className="text-xl font-bold text-foreground">{currentWeather.feelsLike}°</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
                    <Droplets className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Umidade</p>
                    <p className="text-xl font-bold text-foreground">{currentWeather.humidity}%</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
                    <Wind className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Vento</p>
                    <p className="text-xl font-bold text-foreground">{currentWeather.wind} km/h</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-lg font-serif font-bold mb-4 pb-2 border-b border-border">Previsão 7 Dias</h2>
            {isLoadingForecast ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : forecast && forecast.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className={`text-center p-4 rounded-lg border transition-all ${
                      index === 0 
                        ? "bg-primary/5 border-primary/20" 
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <p className="text-sm font-medium mb-2 text-foreground">{day.day}</p>
                    <img
                      src={getWeatherIcon(day.icon)}
                      alt=""
                      className="h-12 w-12 mx-auto mb-2"
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-foreground">{day.high}°</p>
                      <p className="text-xs text-muted-foreground">{day.low}°</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">Nenhuma previsão disponível</p>
            )}
          </div>
        </div>

        {/* Ad Banner */}
        {bannerAdsConverted.length > 0 && (
          <AdCarousel ads={bannerAdsConverted} position="banner" autoPlayInterval={5000} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-serif font-bold">Notícias sobre Clima</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {weatherNews.length > 0 ? (
                weatherNews.slice(0, 4).map((article, index) => (
                  <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <NewsCard article={article} />
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <p>Nenhuma notícia sobre clima disponível no momento.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Other Cities */}
            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="font-serif font-bold mb-4 pb-2 border-b border-border flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Outras Cidades
              </h3>
              {isLoadingCities ? (
                <div className="space-y-1">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-md" />
                  ))}
                </div>
              ) : cities && cities.length > 0 ? (
                <div className="space-y-1">
                  {cities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => setSelectedCity(city.name)}
                      className="w-full flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors rounded-md px-2 -mx-2 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getWeatherIcon(city.icon)}
                          alt=""
                          className="h-5 w-5"
                        />
                        <span className="text-sm font-medium text-foreground">{city.name}</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">{city.temp}°</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">Nenhuma cidade disponível</p>
              )}
            </div>

            {/* Sidebar Ad */}
            {sidebarAdsConverted.length > 0 && (
              <AdCarousel ads={sidebarAdsConverted} position="sidebar" autoPlayInterval={5000} />
            )}
          </aside>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default WeatherPage;
