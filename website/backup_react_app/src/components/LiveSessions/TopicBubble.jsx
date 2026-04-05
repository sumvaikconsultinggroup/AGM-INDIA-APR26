const TopicBubble = ({ title, position }) => {
  return (
    <div className={`absolute ${position}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${title}`}
          alt={title}
          className="h-12 w-12 rounded-full"
        />
      </div>
    </div>
  );
};

export default TopicBubble;
