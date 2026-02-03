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
        <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer">
          {ad?.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title || "Anúncio"}
              className="w-full h-[300px] object-cover"
            />
          ) : (
            <div className="bg-muted h-[300px] flex items-center justify-center">
              <span className="text-muted-foreground">Anúncio</span>
            </div>
          )}
        </a>
      </div>
    );
  }

  return (
    <div>
      <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer">
        {ad?.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title || "Anúncio"}
            className="w-full h-[400px] object-cover"
          />
        ) : (
          <div className="bg-muted h-[400px] flex items-center justify-center">
            <span className="text-muted-foreground">Espaço Publicitário</span>
          </div>
        )}
      </a>
    </div>
  );
};

export default AdBanner;
