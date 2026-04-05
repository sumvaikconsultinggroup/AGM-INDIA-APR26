import { Link } from "react-router-dom";

const FooterLinks = () => {
  const sections = {
    "LIVE EVENTS": [
      // { name: "Upcoming Events", path: "/schedule" },
      // { name: "Register for Events", path: "/event-registration" },
    ],
    "WISDOM CONTENT": [
      { name: "Articles", path: "/articles" },
      { name: "Books", path: "/books" },
      { name: "Video Series", path: "/video-series" },
      { name: "Podcasts", path: "/podcasts" },
    ],
    MORE: [
      { name: "About Acharya Swami Avdheshanand Giri ji", path: "/about" },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Object.entries(sections).map(([title, links]) => (
        <div key={title}>
          <h3 className="text-white text-[24px] font-semibold mb-4">{title}</h3>
          <ul className="space-y-2">
            {links.length > 0 ? (
              links.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 text-[18px] hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <span className="text-gray-500 italic text-[18px]">Coming soon</span>
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FooterLinks;
