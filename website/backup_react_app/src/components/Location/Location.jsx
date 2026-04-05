const Location = () => {
  const locations = [
    {
      id: "haridwar",
      name: "Harihar Aashram, Haridwar",
      src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55322.088947561875!2d78.08337483125001!3d29.932536300000017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3909478934355be5%3A0x89099a529155ef!2sHarihar%20Aashram%2C%20Haridwar!5e0!3m2!1sen!2sin!4v1750484998168!5m2!1sen!2sin",
    },
    {
      id: "delhi",
      name: "Prabhu Shri Vihar, Delhi",
      src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56105.6983045755!2d77.08973990012497!3d28.491405613840737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1f3f9cc93035%3A0x878a8431db48516c!2sPrabhu%20Shri%20vihar!5e0!3m2!1sen!2sin!4v1761291563049!5m2!1sen!2sin",
    },
    {
      id: "jabalpur",
      name: "Prabhu Prasang Ashram , Ambala",
      src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110196.47075591366!2d76.79096826064635!3d30.332764372020637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fb78f4b714b77%3A0x30d6dafb5247f3ac!2sPrabhu%20Prem%20ashram!5e0!3m2!1sen!2sin!4v1761291826712!5m2!1sen!2sin",
    },
  ];

  return (
    <>
      <span id="location"></span>
      <section data-aos="fade-up" className="">
        <div className="container mx-auto my-4 px-4">
          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {locations.map((location) => (
              <div key={location.id} className="flex flex-col">
                <h3 className="text-sm font-semibold text-center text-[#6E0000] mb-2">
                  {location.name}
                </h3>
                <div className="rounded-lg mx-auto md:w-[400px] overflow-hidden flex-grow">
                  <div className="h-48">
                    <iframe
                      width="100%"
                      height="100%"
                      src={location.src}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full border-0"
                    ></iframe>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Location;
