import { Ad } from "@/types/news";

interface AdBannerProps {
  ad?: Ad;
  position?: "sidebar" | "banner" | "inline";
}

const AdBanner = ({ ad, position = "sidebar" }: AdBannerProps) => {
  if (position === "banner") {
    return (
      <div className="my-6">
        <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer">
          {ad?.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title || "Anúncio"}
              className="w-full max-h-24 object-cover"
            />
          ) : (
            <div className="bg-muted h-24 flex items-center justify-center">
              <span className="text-muted-foreground">Espaço Publicitário</span>
            </div>
          )}
        </a>
      </div>
    );
  }

  if (position === "inline") {
    return (
      <div className="my-4">
        <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
          {ad?.imageUrl ? (
            <div className="w-full aspect-[4/1] overflow-hidden">
              <img
                src={ad.imageUrl}
                alt={ad.title || "Anúncio"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="bg-muted aspect-[4/1] flex items-center justify-center">
              <span className="text-muted-foreground">Anúncio</span>
            </div>
          )}
        </a>
      </div>
    );
  }

  return (
    <div>
      <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
        {ad?.imageUrl ? (
          <div className="w-full aspect-[3/4] overflow-hidden">
            <img
              src={ad.imageUrl}
              alt={ad.title || "Anúncio"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="bg-muted aspect-[3/4] flex items-center justify-center">
            <span className="text-muted-foreground">Espaço Publicitário</span>
          </div>
        )}
      </a>
    </div>
  );
};

export default AdBanner;
