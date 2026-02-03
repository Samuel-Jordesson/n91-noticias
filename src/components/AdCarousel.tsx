import { useState, useEffect } from "react";
import { Ad } from "@/types/news";

interface AdCarouselProps {
  ads: Ad[];
  position: "sidebar" | "banner" | "inline";
  autoPlayInterval?: number;
}

const positionStyles = {
  sidebar: "aspect-[3/4]",
  banner: "h-24 md:h-28",
  inline: "aspect-[4/1]",
};

const AdCarousel = ({ ads, position, autoPlayInterval = 5000 }: AdCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeAds = ads.filter(ad => ad.isActive && ad.position === position);

  useEffect(() => {
    if (activeAds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeAds.length, autoPlayInterval, activeAds]);

  if (activeAds.length === 0) {
    return (
      <div className="my-4">
        <div className={`bg-muted flex items-center justify-center w-full ${positionStyles[position]}`}>
          <span className="text-muted-foreground text-sm">Espaço Publicitário</span>
        </div>
      </div>
    );
  }

  const currentAd = activeAds[currentIndex];

  return (
    <div className="my-4 relative">
      <a href={currentAd.link} target="_blank" rel="noopener noreferrer" className="block">
        <div className={`relative overflow-hidden w-full ${positionStyles[position]}`}>
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        </div>
      </a>
    </div>
  );
};

export default AdCarousel;
