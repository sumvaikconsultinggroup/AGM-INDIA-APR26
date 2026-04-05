"use client";

import { useState } from "react";
import { ChevronDown, Search, Phone, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export default function FAQ({faqData}) {
  const [openItems, setOpenItems] = useState(new Set([0]));

  // Toggle FAQ item
  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  // Expand all items
  const expandAll = () => {
    setOpenItems(new Set(faqData.map((faq) => faq.id)));
  };

  // Collapse all items
  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container relative z-10 px-5 mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="text-center mb-6">
            <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl font-serif text-black inline-block">
              Frequently Asked Questions
            </h2>
            <div className="md:w-48 w-32 h-1 bg-[#6E0000] rounded-lg mx-auto mt-2"></div>
          </div>

          <p className="max-w-3xl mx-auto text-center leading-relaxed text-[#6E0000]">
            Find answers to common questions about our spiritual practices, community, programs, and
            how you can begin your journey with us. If you don&apos;t find what you&apos;re looking
            for, please don&apos;t hesitate to contact us.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Expand/Collapse Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={expandAll}
              className="px-6 py-2 text-sm bg-white text-[#6E0000] border border-[#6E0000] rounded-full hover:bg-[#6E0000] hover:text-white transition-all duration-300"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-6 py-2 text-sm bg-white text-[#5D4037] border border-[#5D4037]/30 rounded-full hover:bg-[#5D4037]/10 transition-all duration-300"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="container mx-auto">
          {faqData.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#B82A1E]/10 flex items-center justify-center">
                <Search className="w-12 h-12 text-[#B82A1E]/50" />
              </div>
              <h3 className="text-2xl font-serif text-[#5D4037] mb-4">No Questions Found</h3>
              <p className="text-[#5D4037]/70 mb-6">We couldnt find any FAQ For You</p>
            </div>
          ) : (
            <div className="flex flex-col-reverse md:flex-row gap-12 md:gap-20 lg:gap-28">
              {/* Left side - Image */}
              <div className="w-full md:w-1/3 lg:w-2/5">
                <div className="sticky top-8">
                  <div className=" rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
                    <img
                      src="/newassets/faqImg.png"
                      alt="FAQ Image"
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - FAQ Items */}
              <div className="w-full md:w-2/3 lg:w-3/5">
                <div className="space-y-6">
                  {faqData.map((faq, index) => (
                    <div key={faq.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full text-left flex items-start justify-between hover:opacity-80 transition-opacity duration-300"
                      >
                        <div className="flex items-start space-x-4 flex-1">
                          <span className="text-gray-400 font-bold text-lg mt-1 flex-shrink-0">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-lg font-serif text-[#5D4037] leading-relaxed pr-4 font-medium">
                            {faq.question}
                          </h3>
                        </div>
                        <ChevronDown
                          className={`w-6 h-6 text-[#B82A1E] transition-transform duration-300 flex-shrink-0 mt-1 ${
                            openItems.has(faq.id) ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          openItems.has(faq.id) ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="pl-8">
                          <div className="text-[#5D4037]/70 leading-relaxed">
                            <ReactMarkdown
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                              components={{
                                a: ({ ...props }) => (
                                  <a
                                    {...props}
                                    className="text-[#B82A1E] underline hover:text-[#a32519] transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  />
                                ),
                              }}
                            >
                              {faq.answer}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative max-w-full flex justify-end">
          {/* Contact Section */}
          <div className="relative max-w-4xl mx-auto mt-16">
            {/* Background color + pattern */}
            <div className="absolute inset-0 -z-10 bg-[#FFFAF0]">
              <img
                src="/newassets/institutionPattern.png"
                alt="decorative pattern"
                className="w-full h-full object-cover opacity-35"
              />
            </div>

            <div className="rounded-2xl p-8 shadow-lg border text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white text-[#B82A1E] shadow-md">
                <Mail size={28} />
              </div>
              <h3 className="text-2xl font-serif text-[#6E0000] mb-4">Still Have Questions?</h3>
              <p className="text-[#5D4037]/80 leading-relaxed mb-6 max-w-2xl mx-auto">
                If you couldn&apos;t find the answer you were looking for, our spiritual guides are
                here to help. Feel free to reach out to us directly, and we&apos;ll be happy to
                assist you on your spiritual journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:office@avdheshanandg.org"
                  className="inline-flex items-center px-6 py-3 bg-[#6E0000] text-white rounded-full transition-colors shadow-md"
                >
                  <Mail size={18} className="mr-2" />
                  Email Us
                </a>
                <a
                  href="tel:+91 9410160022"
                  className="inline-flex items-center px-6 py-3 bg-white text-[#6E0000] border border-[#6E0000] rounded-full hover:bg-[#6E0000] hover:text-white transition-colors shadow-md"
                >
                  <Phone size={18} className="mr-2" />
                  Call Us
                </a>
              </div>
            </div>
          </div>

          {/* Decorative pattern on the right */}
          {/* <div className="absolute -right-72 top-1/2 -translate-y-1/2 z-0  hidden sm:block">
            <img
              src="/newassets/downPattern.png"
              alt=""
              className="w-[30vw] h-[70vh] max-w-sm md:max-w-md lg:max-w-lg object-contain"
              aria-hidden="true"
            />
          </div> */}
        </div>
      </div>
    </section>
  );
}