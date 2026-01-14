import { Ad } from "@/types/news";

interface AdBannerProps {
  ad?: Ad;
  position?: "sidebar" | "banner" | "inline";
}

const AdBanner = ({ ad, position = "sidebar" }: AdBannerProps) => {
  if (position === "banner") {
    return (
      <div className="ad-container my-6">
        <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer">
          {ad?.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title || "Anúncio"}
              className="w-full max-h-24 object-cover rounded"
            />
          ) : (
            <div className="bg-muted h-24 rounded flex items-center justify-center">
              <span className="text-muted-foreground">Espaço Publicitário</span>
            </div>
          )}
        </a>
      </div>
    );
  }

  if (position === "inline") {
    return (
      <div className="ad-container my-4">
        <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer">
          {ad?.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title || "Anúncio"}
              className="w-full max-h-32 object-cover rounded"
            />
          ) : (
            <div className="bg-muted h-32 rounded flex items-center justify-center">
              <span className="text-muted-foreground">Anúncio</span>
            </div>
          )}
        </a>
      </div>
    );
  }

  return (
    <div className="ad-container">
      <a href={ad?.link || "#"} target="_blank" rel="noopener noreferrer">
        {ad?.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title || "Anúncio"}
            className="w-full h-60 object-cover rounded"
          />
        ) : (
          <div className="bg-muted h-60 rounded flex items-center justify-center">
            <span className="text-muted-foreground">Espaço Publicitário</span>
          </div>
        )}
      </a>
    </div>
  );
};

export default AdBanner;
