import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const TopBanner = () => {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  
  // Get current language to determine which shloka to display
  const currentLang = i18n.language;
  
  // Effect for continuous scrolling animation
  useEffect(() => {
    if (!scrollRef.current || !contentRef.current) return;
    
    const scrollContainer = scrollRef.current;
    const content = contentRef.current;
    
    // Clone the content for seamless looping
    const clonedContent = content.cloneNode(true);
    scrollContainer.appendChild(clonedContent);
    
    // Calculate animation duration based on content length
    const contentWidth = content.offsetWidth;
    const duration = contentWidth * 40; // 40ms per pixel - adjust for speed
    
    // Create scrolling animation
    const animate = () => {
      if (!scrollContainer) return;
      
      // Increment scroll position
      if (scrollContainer.scrollLeft >= contentWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
      
      // Continue animation
      animationId = requestAnimationFrame(animate);
    };
    
    // Start animation
    let animationId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Additional hover effect handling
  const handleMouseEnter = () => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = 'paused';
    }
  };

  const handleMouseLeave = () => {
    if (scrollRef.current) {
      scrollRef.current.style.animationPlayState = 'running';
    }
  };

  // Sanskrit shlokas and their translations
  const getShloka = () => {
    if (currentLang === 'hi') {
      return [
        "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥",
        "ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते। पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥",
        "ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥",
        "ॐ वसुधैव कुटुम्बकम्"
      ].join(" • ");
    }
    
    return [
      "Om Sarve Bhavantu Sukhinah Sarve Santu Niraamayaah | Sarve Bhadraanni Pashyantu Maa Kashchid-Duhkha-Bhaag-Bhavet ||",
      "Om Poornamadah Poornamidam Poornaat Poornamudachyate | Poornasya Poornamaadaaya Poornamevaavasishyate ||",
      "Om Asato Maa Sad-Gamaya | Tamaso Maa Jyotir-Gamaya | Mrityor-Maa Amritam Gamaya ||",
      "Om Vasudhaiva Kutumbakam"
    ].join(" • ");
  };

  return (
    <div className="bg-white  py-2 overflow-hidden relative border-b border-[#7C1D14]/10">
      {/* Gradient overlay for edges */}
      <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent z-10"></div>
      <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10"></div>
      
      {/* Scrolling container */}
      <div 
        ref={scrollRef}
        className="flex whitespace-nowrap overflow-x-scroll scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={contentRef} 
          className="inline-flex items-center px-4 font-sanskrit"
        >
          <span className="text-[#7C1D14] text-sm mr-4 whitespace-nowrap">
            {getShloka()}
          </span>
          
          {/* Spacer */}
          <span className=" w-5">&nbsp;</span>
        </div>
      </div>
    </div>
  );
};

// Hide scrollbars
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @font-face {
    font-family: 'Sanskrit';
    src: url('/fonts/Sanskrit2003.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    color: #7C1D14;
  }
  
  .font-sanskrit {
    font-family: 'Sanskrit', 'Noto Sans Devanagari', sans-serif;
  }
`;
document.head.appendChild(style);

export default TopBanner;