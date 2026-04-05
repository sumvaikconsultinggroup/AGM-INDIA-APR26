import { useNavigate } from "react-router-dom";

export default function SocialInitiativePage() {
  // Array of initiative items for more dynamic rendering
  const initiatives = [
    {
      id: "avdhesham",
      title: "Founder",
      organization: "Avdheshanand G Mission",
      logo: "/newassets/logo1.png",
      externalLink: "https://www.avdheshanandgmission.org/", // External link for this item
    },
    {
      id: "hindu",
      title: "President",
      organization: "Hindu Dharma Acharya Sabha",
      logo: "/newassets/logo2.png",
    },
    {
      id: "jagannath",
      title: "Founder",
      organization: "Shri Shri Parashakti Dharmarth Trust",
      logo: "/newassets/logo3.png",
    },
    {
      id: "bharat-mata",
      title: "President",
      organization: "Bharat mata Mandir samanvaya sewa Trust",
      logo: "/newassets/logo4.png",
    },
    {
      id: "heritage",
      title: "Founder",
      organization: "Ancient Heritage Foundation",
      logo: "/newassets/logo5.png",
    },
    {
      id: "prabhu-premi",
      title: "Founder & Chairman",
      organization: "Prabhu Premi Sangh Charitable Trust",
      logo: "/newassets/logo6.png",
    },
  ];
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.externalLink) {
      window.open(item.externalLink, "_blank", "noopener,noreferrer");
    } else {
      navigate("/about", { state: { sectionId: "guiding", tabId: item.id } });
    }
  };
  return (
    <div className="min-h-[40vh] py-8 sm:py-16 px-4">
      {/* Heading outside the pattern section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
          Social Initiative
        </h1>
        <div className="w-16 sm:w-24 h-1 rounded-xl bg-[#6E0000] mx-auto"></div>
      </div>

      {/* Light pink background section */}
      <div
        className="py-8 sm:py-16 px-4  bg-[#FFF1F0] rounded-xl"
        style={{
          backgroundImage: "url(/newassets/socialinitiativebg.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Mobile View: Grid with boxes */}
          <div className="grid grid-cols-2 gap-4 sm:hidden">
            {initiatives.map((item, index) => (
              <button onClick={() => handleClick(item)} key={`mobile-${index}`}>
                <div
                  className="bg-white rounded-lg shadow-md p-3 text-center flex flex-col items-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl border border-[#f3d3d1] animate-fadeIn"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Circle - small for mobile */}
                  <div
                    className="w-16 h-16 mx-auto mb-3 
                    rounded-full bg-white shadow flex items-center justify-center border-2 border-[#f3d3d1]"
                  >
                    <img
                      src={item.logo}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title - smaller on mobile */}
                  <h3 className="text-sm font-semibold text-[#6E0000] leading-tight">
                    {item.title}
                  </h3>

                  {/* Organization - smaller on mobile */}
                  <p className="text-xs text-[#6E0000] leading-tight mt-2 max-w-[120px] mx-auto font-medium tracking-wide">
                    {item.organization}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop View: 3 top, 3 bottom */}
          <div className="hidden sm:block">
            {/* Top row - 3 items */}
            <div className="grid grid-cols-6 gap-4 mb-10">
              {initiatives.map((item, index) => (
                <button onClick={() => handleClick(item)} key={`desktop-${index}`}>
                  <div
                    key={`desktop-top-${index}`}
                    className="text-center flex flex-col items-center transition-transform duration-200 h-[300px] hover:-translate-y-2 hover:shadow-2xl border border-[#f3d3d1] rounded-xl bg-white p-4 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Circle - original size for desktop */}
                    <div
                      className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-4 
                    rounded-full bg-white shadow-lg flex items-center justify-center p-3 border-4 border-[#f3d3d1]"
                    >
                      <img
                        src={item.logo}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Title - original size */}
                    <h3 className="text-xl font-semibold text-[#6E0000] leading-tight">
                      {item.title}
                    </h3>

                    {/* Organization - original size */}
                    <p className="text-base text-[#6E0000] leading-tight mt-4 max-w-[160px] mx-auto font-medium tracking-wide">
                      {item.organization}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s both;
        }
      `}</style>
    </div>
  );
}
