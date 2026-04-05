const NavLinks = ({ className = "" }) => {
  return (
    <nav className={`hidden lg:flex space-x-6 ${className}`}>
      {["Home", "About", "Teachings", "Books", "Events", "Contact"].map((item) => (
        <a
          key={item}
          href={`#${item.toLowerCase()}`}
          className="text-[#1E293B] hover:text-[#f3c78b] hover:border-b-2 border-[#f3c78b] transition-all duration-200"
        >
          {item}
        </a>
      ))}
    </nav>
  );
};

export default NavLinks;
