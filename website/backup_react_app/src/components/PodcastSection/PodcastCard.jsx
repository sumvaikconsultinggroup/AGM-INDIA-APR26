import { Play } from "lucide-react";

const PodcastCard = ({ title, thumbnail, coverImage, onClick }) => {
  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Card Image */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
      
      {/* Title below the card */}
      <div className="p-2">
        <p className="text-sm font-normal text-[#6E0000]  transition-colors">
          {thumbnail}
        </p>
      </div>
    </div>
  );
};

export default PodcastCard;
