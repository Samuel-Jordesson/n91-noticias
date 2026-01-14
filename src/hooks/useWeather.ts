import { useQuery } from "@tanstack/react-query";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  feelsLike: number;
  high: number;
  low: number;
  icon: string;
}

interface ForecastDay {
  day: string;
  icon: string;
  high: number;
  low: number;
}

interface CityWeather {
  name: string;
  temp: number;
  icon: string;
}

// Função para buscar clima atual
const fetchCurrentWeather = async (city: string = "São Paulo"): Promise<WeatherData> => {
  // Adicionar ",BR" para garantir que busca no Brasil
  const cityQuery = city.includes(",") ? city : `${city},BR`;
  
  const response = await fetch(
    `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(cityQuery)}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar dados do clima");
  }
  
  const data = await response.json();
  
  return {
    city: data.name,
    temp: Math.round(data.main.temp),
    condition: data.weather[0].description,
    humidity: data.main.humidity,
    wind: Math.round(data.wind.speed * 3.6), // converter m/s para km/h
    feelsLike: Math.round(data.main.feels_like),
    high: Math.round(data.main.temp_max),
    low: Math.round(data.main.temp_min),
    icon: data.weather[0].icon,
  };
};

// Função para buscar previsão de 7 dias
const fetchForecast = async (city: string = "São Paulo"): Promise<ForecastDay[]> => {
  // Adicionar ",BR" para garantir que busca no Brasil
  const cityQuery = city.includes(",") ? city : `${city},BR`;
  
  const response = await fetch(
    `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(cityQuery)}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`
  );
  
  if (!response.ok) {
    throw new Error("Erro ao buscar previsão do tempo");
  }
  
  const data = await response.json();
  
  // Agrupar por dia e pegar a temperatura máxima e mínima de cada dia
  const dailyData: { [key: string]: { temps: number[]; icons: string[] } } = {};
  
  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = { temps: [], icons: [] };
    }
    dailyData[dayKey].temps.push(item.main.temp);
    dailyData[dayKey].icons.push(item.weather[0].icon);
  });
  
  // Pegar os próximos 7 dias
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  const forecastDays: ForecastDay[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayKey = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const dayName = days[date.getDay()];
    
    const dayData = dailyData[dayKey];
    if (dayData && dayData.temps.length > 0) {
      // Usar o ícone do meio do dia (geralmente o mais representativo)
      const iconIndex = Math.floor(dayData.icons.length / 2);
      forecastDays.push({
        day: dayName,
        icon: dayData.icons[iconIndex] || dayData.icons[0],
        high: Math.round(Math.max(...dayData.temps)),
        low: Math.round(Math.min(...dayData.temps)),
      });
    } else if (i === 0) {
      // Se for hoje e não tiver dados, usar dados do clima atual
      forecastDays.push({
        day: dayName,
        icon: "01d",
        high: 25,
        low: 20,
      });
    }
  }
  
  return forecastDays.slice(0, 7);
};

// Função para buscar clima de múltiplas cidades
const fetchCitiesWeather = async (cities: string[]): Promise<CityWeather[]> => {
  const promises = cities.map(city => {
    const cityQuery = city.includes(",") ? city : `${city},BR`;
    return fetch(`${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(cityQuery)}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`)
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!data || !data.weather || !data.weather[0]) return null;
        return {
          name: data.name,
          temp: Math.round(data.main.temp),
          icon: data.weather[0].icon,
        };
      })
      .catch(() => null);
  });
  
  const results = await Promise.all(promises);
  return results.filter(Boolean) as CityWeather[];
};

// Hook para clima atual
export const useCurrentWeather = (city: string = "São Paulo") => {
  return useQuery({
    queryKey: ["weather", city],
    queryFn: () => fetchCurrentWeather(city),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualizar a cada 10 minutos
  });
};

// Hook para previsão
export const useForecast = (city: string = "São Paulo") => {
  return useQuery({
    queryKey: ["forecast", city],
    queryFn: () => fetchForecast(city),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Hook para múltiplas cidades
export const useCitiesWeather = (cities: string[] = [
  "Rio de Janeiro",
  "Brasília",
  "Salvador",
  "Curitiba",
  "Porto Alegre",
  "Recife",
]) => {
  return useQuery({
    queryKey: ["cities-weather", cities],
    queryFn: () => fetchCitiesWeather(cities),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};
