export default function SpiritualJourney() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 relative">
      {/* Full width relative wrapper */}
      <div className="relative w-full">
        {/* Background decoration - hidden on mobile */}
        <div className="absolute -left-48 bottom-12 -translate-y-1/2 w-72 h-64 opacity-75 hidden lg:block">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/monarchbg-tk3t5XxXhQrHH4KsIGpRuI5lKiOWYG.png"
            alt="Decorative mandala pattern"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Constrained content */}
        <div className="max-w-6xl mx-auto relative px-4">
          <h1
            className="relative text-center text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-8 sm:mb-16 tracking-wide
                        after:content-[''] after:block after:w-16 sm:after:w-24 after:h-[2px] after:bg-[#6E0000] after:mx-auto after:mt-2"
          >
            Our Spiritual Journey
          </h1>

          {/* Mobile: Single column layout */}
          <div className="block lg:hidden">
            <div className="space-y-8">
              {/* Journey items for mobile */}
              <div className="border-l-2 border-[#6E0000] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6E0000] rounded-full"></div>
                <div className="text-xl font-bold text-[#6E0000] mb-1">01</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  1962 - Birth & Spiritual Inclination
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  Born in Khurja, Uttar Pradesh, showing spiritual inclination and strength from
                  early childhood.
                </div>
              </div>

              <div className="border-l-2 border-[#6E0000] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6E0000] rounded-full"></div>
                <div className="text-xl font-bold text-[#6E0000] mb-1">02</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  1979 - Renunciation at 17
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  Left home to embrace sannyasa, seeking spiritual Vedas, Yoga and Vedanta in the
                  Himalayas.
                </div>
              </div>

              <div className="border-l-2 border-[#6E0000] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6E0000] rounded-full"></div>
                <div className="text-xl font-bold text-[#6E0000] mb-1">03</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  1985 - Spiritual Initiation
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  Received diksha from H.H. Swami Satyamitranand Giri and joined the Shri Panch
                  Dashnam Juna Akhara.
                </div>
              </div>

              <div className="border-l-2 border-[#6E0000] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6E0000] rounded-full"></div>
                <div className="text-xl font-bold text-[#6E0000] mb-1">04</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  1992 - Establishing Prabhu Prem Ashram
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  Founded Prabhu Prem Ashram in Amkola, Haridwar, marking the beginning of Prabhu
                  Premi Sangh.
                </div>
              </div>

              <div className="border-l-2 border-[#6E0000] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6E0000] rounded-full"></div>
                <div className="text-xl font-bold text-[#6E0000] mb-1">05</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  1998 - Elevated as Acharya Mahamandaleshwar
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  Honored as the spiritual head of Juna Akhara, guiding millions of devotees and
                  renunciates.
                </div>
              </div>

              <div className="border-l-2 border-[#6E0000] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6E0000] rounded-full"></div>
                <div className="text-xl font-bold text-[#6E0000] mb-1">06</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  2009 - Global Recognition
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  Represented Hindu Dharma at the Parliament of World Religions in Melbourne,
                  promoting peace, love and harmony.
                </div>
              </div>

              <div className="border-l-2 border-[#6E0000] pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-[#6E0000] rounded-full"></div>
                <div className="text-xl font-bold text-[#6E0000] mb-1">07</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  2021 - Leadership Role
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  Took the leadership role to conduct Kumbh Mela during COVID-19, prioritizing
                  public health and safety.
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Original grid layout */}
          <div className="hidden lg:grid grid-cols-5 gap-8 relative min-h-[600px]">
            {/* 80% Part (col-span-4) */}
            <div className="col-span-4 flex flex-col justify-between">
              {/* Top half (Row 1) */}
              <div className="grid grid-cols-3 gap-12">
                <div className="w-52 mt-0">
                  <div className="text-2xl font-bold text-[#6E0000] mb-1">01</div>
                  <div className="text-sm font-semibold text-[#6E0000] mb-2">
                    1962 - Birth & Spiritual Inclination
                  </div>
                  <div className="text-xs text-gray-800 leading-relaxed">
                    Born in Khurja, Uttar Pradesh, showing spiritual inclination and strength from
                    early childhood.
                  </div>
                </div>

                <div className="w-52 mt-20">
                  <div className="text-2xl font-bold text-[#6E0000] mb-1">02</div>
                  <div className="text-sm font-semibold text-[#6E0000] mb-2">
                    1979 - Renunciation at 17
                  </div>
                  <div className="text-xs text-gray-800 leading-relaxed">
                    Left home to embrace sannyasa, seeking spiritual Vedas, Yoga and Vedanta in the
                    Himalayas.
                  </div>
                </div>

                <div className="w-52 mt-32">
                  <div className="text-2xl font-bold text-[#6E0000] mb-1">03</div>
                  <div className="text-sm font-semibold text-[#6E0000] mb-2">
                    1985 - Spiritual Initiation
                  </div>
                  <div className="text-xs text-gray-800 leading-relaxed">
                    Received diksha from H.H. Swami Satyamitranand Giri and joined the Shri Panch
                    Dashnam Juna Akhara.
                  </div>
                </div>
              </div>

              {/* Bottom half (Row 2) */}
              <div className="grid grid-cols-3 gap-12 mt-24">
                <div className="w-52 mt-32">
                  <div className="text-2xl font-bold text-[#6E0000] mb-1">07</div>
                  <div className="text-sm font-semibold text-[#6E0000] mb-2">
                    2021 – Leadership Role
                  </div>
                  <div className="text-xs text-gray-800 leading-relaxed">
                    Took the historic decision to conclude Kumbh Mela early during COVID-19,
                    prioritizing public health and safety.
                  </div>
                </div>

                <div className="w-52 mt-20">
                  <div className="text-2xl font-bold text-[#6E0000] mb-1">06</div>
                  <div className="text-sm font-semibold text-[#6E0000] mb-2">
                    2009 – Global Recognition
                  </div>
                  <div className="text-xs text-gray-800 leading-relaxed">
                    Represented Hindu Dharma at the Parliament of World Religions in Melbourne,
                    promoting peace and interfaith harmony.
                  </div>
                </div>

                <div className="w-52 mt-0">
                  <div className="text-2xl font-bold text-[#6E0000] mb-1">05</div>
                  <div className="text-sm font-semibold text-[#6E0000] mb-2">
                    1998 – Elevated as Acharya Mahamandaleshwar
                  </div>
                  <div className="text-xs text-gray-800 leading-relaxed">
                    Honored as the spiritual head of Juna Akhara, guiding over 100,000 renunciates.
                  </div>
                </div>
              </div>
            </div>

            {/* 20% Part (col-span-1, 7th item centered) */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="w-52">
                <div className="text-2xl font-bold text-[#6E0000] mb-1">04</div>
                <div className="text-sm font-semibold text-[#6E0000] mb-2">
                  1992 – Establishing Prabhu Prem Ashram
                </div>
                <div className="text-xs text-gray-800 leading-relaxed">
                  Founded Prabhu Prem Ashram in Ambala, marking the formal beginning of Prabhu Premi
                  Sangh.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
