import { MoveUpRight } from "lucide-react";

export default function MonasticOrderPage() {
  return (
    <div className=" py-16 px-4 bg-gray-50 mt-14 relative">
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Left Content Section */}
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-center md:text-left font-bold text-black mb-1">
              Monastic Order Juna Akhara
            </h1>

            <div className="space-y-4 text-center md:text-left text-[#6E0000] leading-relaxed">
              <p className="text-xl">
                At the moment, the Juna is the largest (over 200,000 members) monastic order in
                India. It unites (as was previously mentioned) ascetics from the traditions of Puri,
                Saraswati, Giri, Bharati, Tirtha, and other orders. Swami Avdheshanand Giri has been
                the Acharya of Juna Akhara since 1998.
              </p>

              <p className="text-gray-600 text-md">
                Juna Akhara includes 52 lines: 16 Puri lines, 14+2 Giri lines, 4 Bharati, 4
                Saraswati, and 11 Lama line — That is, within the Akhara, Tibetan lamas of the
                Padmasambhavas lineage are also recognized (Guru Rinpoche).
              </p>
            </div>

            <div className="flex justify-center md:justify-start">
              <a
                href="https://en.advayta.org/nasha-traditsiya/orden-dzhuna-akkhara/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center cursor-pointer"
              >
                <span className="bg-[#6E0000] text-white px-8 py-3 rounded-full font-medium transform transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-xl">
                  View More
                </span>
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#6E0000] text-white transform transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-xl">
                  <MoveUpRight className="w-5 h-5" />
                </span>
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            {/* Background pattern layer */}
            <div
              className="absolute -top-40  left-10  opacity-20"
              style={{
                backgroundImage: "url('/newassets/monarchbg.png')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                height: "900px",
                width: "900px",
                backgroundPosition: "center",
              }}
            ></div>

            {/* Image grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4  relative z-10">
              {/* Left column */}
              <div className="space-y-4">
                <img
                  src="/assets/lord-dakshinamurthy.jpg"
                  alt="Hindu deity artwork"
                  className="w-full h-64 object-cover object-top object-center rounded-xl shadow-md"
                />
                <img
                  src="/assets/lord-dataray.jpg"
                  alt="Spiritual leader in meditation"
                  className="w-full h-64 object-cover rounded-xl shadow-md object-top object-center"
                />
              </div>

              {/* Right column - shifted upward */}
              <div className="space-y-4 mt-0 lg:-mt-8">
                <img
                  src="/assets/sankaracharya.jpg"
                  alt="Hindu sage in orange robes"
                  className="w-full h-64 object-cover rounded-xl object-top object-center shadow-md"
                />
                <img
                  src="/newassets/order4.jpg"
                  alt="Group of monks at gathering"
                  className="w-full h-64 object-cover rounded-xl shadow-md object-top object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
