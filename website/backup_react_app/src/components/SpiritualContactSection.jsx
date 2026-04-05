import { useState } from "react";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function SpiritualContactSection() {
  const { t } = useTranslation(); // Add translation hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Form validation schema with translations
  const contactSchema = yup.object().shape({
    fullName: yup
      .string()
      .required(t("contact.validation.nameRequired"))
      .min(3, t("contact.validation.nameMinLength")),
    email: yup
      .string()
      .required(t("contact.validation.emailRequired"))
      .email(t("contact.validation.emailValid")),
    subject: yup.string().required(t("contact.validation.subjectRequired")),
    message: yup
      .string()
      .required(t("contact.validation.messageRequired"))
      .min(10, t("contact.validation.messageMinLength"))
      .max(1000, t("contact.validation.messageMaxLength")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Make API call with axios
      const response = await axios.post(`${import.meta.env.VITE_APP_API_CONNECT}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle success
      if (response.status === 200 || response.status === 201) {
        setSubmitted(true);

        // Reset form after showing success message
        setTimeout(() => {
          setSubmitted(false);
          reset();
        }, 5000);
      }
    } catch (err) {
      console.error(t("contact.errors.submitFailed"), err);
      setError(err.response?.data?.message || t("contact.errors.defaultError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contactwithus" className="relative py-12 sm:py-24 overflow-hidden bg-white">
      <div className="container relative z-10 px-4 sm:px-5 mx-auto">
        {/* Section Header - Left aligned on small screens */}
        <div className="mb-12 sm:mb-16 sm:text-center text-center">
          <h2
            className="relative sm:left-4 inline-block mb-6 text-2xl sm:text-3xl lg:text-4xl font-serif text-black font-semibold
  after:content-[''] after:block after:w-20 md:after:w-32 after:h-1 after:bg-[#6E0000] after:rounded-full after:mx-auto after:mt-2"
          >
            {t("contact.sectionTitle")}
          </h2>

          <p className="max-w-2xl mx-auto sm:text-center text-left leading-relaxed text-[#6E0000]">
            {t("contact.sectionDescription")}
          </p>
        </div>

        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-5">
            {/* Contact Info */}
            <ContactInfo />

            {/* Form */}
            <div className="lg:col-span-3 relative">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-2xl  min-h-[400px]">
                  <div className="w-16 h-16 mb-4 rounded-full bg-[#B82A1E]/10 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-[#B82A1E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-2xl font-serif text-[#5D4037]">
                    {t("contact.success.title")}
                  </h3>
                  <p className="text-[#5D4037]/70">{t("contact.success.message")}</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-8 bg-white rounded-2xl  transition-all duration-500"
                >
                  {error && (
                    <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded-lg">
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <div>
                      <label className="block mb-2 font-medium text-[#6E0000]" htmlFor="fullName">
                        {t("contact.form.nameLabel")} <span className="text-[#6E0000]">*</span>
                      </label>
                      <input
                        id="fullName"
                        {...register("fullName")}
                        type="text"
                        className={`w-full p-3 transition-all duration-300  border ${
                          errors.fullName ? "border-red-500" : "border-black"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/20 focus:border-[#B82A1E]`}
                        placeholder={t("contact.form.namePlaceholder")}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-[#6E0000]" htmlFor="email">
                        {t("contact.form.emailLabel")} <span className="text-[#6E0000]">*</span>
                      </label>
                      <input
                        id="email"
                        {...register("email")}
                        type="email"
                        className={`w-full p-3 transition-all duration-300  border ${
                          errors.email ? "border-red-500" : "border-black"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/20 focus:border-[#B82A1E]`}
                        placeholder={t("contact.form.emailPlaceholder")}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block mb-2 font-medium text-[#6E0000]" htmlFor="subject">
                      {t("contact.form.subjectLabel")} <span className="text-[#6E0000]">*</span>
                    </label>
                    <input
                      id="subject"
                      {...register("subject")}
                      type="text"
                      className={`w-full p-3 transition-all duration-300  border ${
                        errors.subject ? "border-red-500" : "border-black"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/20 focus:border-[#B82A1E]`}
                      placeholder={t("contact.form.subjectPlaceholder")}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="mb-8">
                    <label className="block mb-2 font-medium text-[#6E0000]" htmlFor="message">
                      {t("contact.form.messageLabel")} <span className="text-[#6E0000]">*</span>
                    </label>
                    <textarea
                      id="message"
                      {...register("message")}
                      rows={6}
                      className={`w-full p-3 transition-all duration-300  border ${
                        errors.message ? "border-red-500" : "border-black"
                      } rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/20 focus:border-[#B82A1E]`}
                      placeholder={t("contact.form.messagePlaceholder")}
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
    flex items-center justify-center  space-x-0
    ${isSubmitting ? "opacity-90 cursor-not-allowed" : ""}
  `}
                  >
                    {/* Main red pill button */}
                    <span
                      className={`bg-[#6E0000] hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 text-white px-8 py-2 rounded-full font-medium`}
                    >
                      {isSubmitting ? t("contact.form.sending") : t("contact.form.sendButton")}
                    </span>

                    {/* Arrow inside a circle */}
                    {!isSubmitting && (
                      <span className="w-9 h-9 flex hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 items-center justify-center rounded-full bg-[#6E0000] text-white ">
                        <ArrowUpRight size={16} className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactInfo() {
  // Mock translation function for demo
  const t = (key) => {
    const translations = {
      "contact.infoTitle": "Get in Touch",
      "contact.addressTitle": "Address",
      "contact.addressText": "Harihar Aashram, Haridwar, Uttarakhand 249808",
      "contact.emailTitle": "Email",
      "contact.emailAddress": "office@avdheshanandg.org",
      "contact.phoneTitle": "Phone",
      "contact.phoneNumber": "+91 94101 60022",
      "contact.socialTitle": "Follow Us",
      "contact.socialText": "Connect with us on social media",
    };
    return translations[key] || key;
  };

  return (
    <div className="md:col-span-2 bg-[#6E0000] rounded-2xl shadow-lg border border-[#6E0000] overflow-hidden h-max relative">
      {/* Decorative Pattern Background */}
      <div className="absolute inset-0 opacity-15">
        <img
          src="/newassets/institutionPattern.png"
          alt="Decorative Pattern"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-8 relative z-10">
        <h3 className="mb-8 text-2xl font-serif text-white border-b border-white pb-4">
          {t("contact.infoTitle")}
        </h3>

        {[
          {
            title: t("contact.addressTitle"),
            text: t("contact.addressText"),
          },
          {
            title: t("contact.emailTitle"),
            text: t("contact.emailAddress"),
          },
          {
            title: t("contact.phoneTitle"),
            text: t("contact.phoneNumber"),
          },
          {
            title: t("contact.socialTitle"),
            text: t("contact.socialText"),
            social: true,
          },
        ].map((item, index) => (
          <div key={index} className="mb-8 last:mb-0">
            <div className="flex items-start">
              <div className="flex-1 ml-4">
                <h4 className="font-medium text-white">{item.title}</h4>
                <p className="mt-1 text-white/80">{item.text}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-start gap-6 pl-4 mt-4">
          <a href="https://www.facebook.com/AvdheshanandG/" target="_blank" rel="noopener noreferrer">
            <Facebook size={28} className="text-white hover:text-[#B82A1E] transition-colors" />
          </a>
          <a href="https://www.instagram.com/avdheshanandg_official/" target="_blank" rel="noopener noreferrer">
            <Instagram size={28} className="text-white hover:text-[#B82A1E] transition-colors" />
          </a>
          <a href="https://x.com/AvdheshanandG" target="_blank" rel="noopener noreferrer">
            <Twitter size={28} className="text-white hover:text-[#B82A1E] transition-colors" />
          </a>
          <a href="https://www.youtube.com/@avdheshanandg" target="_blank" rel="noopener noreferrer">
            <Youtube size={28} className="text-white hover:text-[#B82A1E] transition-colors" />
          </a>
        </div>
      </div>
    </div>
  );
}
