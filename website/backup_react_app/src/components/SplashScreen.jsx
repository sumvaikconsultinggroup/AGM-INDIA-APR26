// components/SplashScreen.jsx
export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      {/* SVG Logo with custom pulse animation */}
      <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-lg z-10">
        <img
          src="/assets/Avdheshanandg-Splashscreen.svg"
          alt="Avdheshanand Mission Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}