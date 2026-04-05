
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import * as yup from "yup";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Upload,
  AlertTriangle,
  X,
  FileText,
  Image,
  User,
  Phone,
  Heart,
  CheckCircle,
  Loader2,
  Calendar,
  Globe,
  Shield,
} from "lucide-react";

export default function DikshRegistrationForm() {
  const { t } = useTranslation();

  // Updated Validation Schema with i18n
  const registrationSchema = yup
    .object({
      fullName: yup
        .string()
        .required(t("mantraDiksha.validation.fullNameRequired"))
        .min(2, t("mantraDiksha.validation.fullNameMin")),

      dateOfBirth: yup
        .date()
        .required(t("mantraDiksha.validation.dobRequired"))
        .max(new Date(), t("mantraDiksha.validation.dobMax")),

      gender: yup
        .string()
        .required(t("mantraDiksha.validation.genderRequired"))
        .oneOf(["Male", "Female", "Other"], t("mantraDiksha.validation.genderValid")),

      nationality: yup
        .string()
        .required(t("mantraDiksha.validation.nationalityRequired"))
        .min(2, t("mantraDiksha.validation.nationalityMin")),

      // Email field - required for all nationalities
      email: yup
        .string()
        .required(t("mantraDiksha.validation.emailRequired"))
        .email(t("mantraDiksha.validation.emailValid")),

      mobileNumber: yup
        .string()
        .required(t("mantraDiksha.validation.mobileRequired"))
        .matches(/^\+?[1-9]\d{1,14}$/, t("mantraDiksha.validation.mobileValid")),

      // Conditional validation for Indian nationals
      aadhaarNumber: yup.string().when("nationality", {
        is: (nationality) => nationality && nationality.toLowerCase().includes("india"),
        then: (schema) => schema.matches(/^\d{12}$/, t("mantraDiksha.validation.aadhaarValid")),
        otherwise: (schema) => schema.nullable(),
      }),

      // WhatsApp number - now available for all nationalities
      whatsappNumber: yup
        .string()
        .matches(/^\+?[1-9]\d{1,14}$/, t("mantraDiksha.validation.whatsappValid"))
        .nullable(),

      // Conditional validation for non-Indian nationals
      passportNumber: yup.string().when("nationality", {
        is: (nationality) => nationality && !nationality.toLowerCase().includes("india"),
        then: (schema) =>
          schema
            .required(t("mantraDiksha.validation.passportRequired"))
            .min(5, t("mantraDiksha.validation.passportMin")),
        otherwise: (schema) => schema.nullable(),
      }),

      spiritualIntent: yup
        .string()
        .required(t("mantraDiksha.validation.spiritualIntentRequired"))
        .min(50, t("mantraDiksha.validation.spiritualIntentMin")),

      spiritualPath: yup.string().nullable(),

      previousDiksha: yup.string().nullable(),

      acceptTerms: yup
        .boolean()
        .oneOf([true], t("mantraDiksha.validation.termsRequired"))
        .required(t("mantraDiksha.validation.termsRequired")),
    })
    .shape();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [fileUploads, setFileUploads] = useState({
    aadhaarDocument: null,
    recentPhoto: null,
    passportDocument: null,
  });
  const [filePreviews, setFilePreviews] = useState({
    aadhaarDocument: null,
    recentPhoto: null,
    passportDocument: null,
  });
  const [uploadLoading, setUploadLoading] = useState({
    aadhaarDocument: false,
    recentPhoto: false,
    passportDocument: false,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  // Watch the acceptTerms and nationality fields
  const acceptTerms = watch("acceptTerms", false);
  const nationality = watch("nationality", "");
  const isIndian = nationality && nationality.toLowerCase().includes("india");

  // List of countries for dropdown with translation keys
  const countries = [
    { key: "India", label: t("countries.india") },
    { key: "United States", label: t("countries.unitedStates") },
    { key: "United Kingdom", label: t("countries.unitedKingdom") },
    { key: "Canada", label: t("countries.canada") },
    { key: "Australia", label: t("countries.australia") },
    { key: "Germany", label: t("countries.germany") },
    { key: "France", label: t("countries.france") },
    { key: "Italy", label: t("countries.italy") },
    { key: "Spain", label: t("countries.spain") },
    { key: "Netherlands", label: t("countries.netherlands") },
    { key: "Belgium", label: t("countries.belgium") },
    { key: "Switzerland", label: t("countries.switzerland") },
    { key: "Sweden", label: t("countries.sweden") },
    { key: "Norway", label: t("countries.norway") },
    { key: "Denmark", label: t("countries.denmark") },
    { key: "Finland", label: t("countries.finland") },
    { key: "Austria", label: t("countries.austria") },
    { key: "Japan", label: t("countries.japan") },
    { key: "South Korea", label: t("countries.southKorea") },
    { key: "Singapore", label: t("countries.singapore") },
    { key: "Malaysia", label: t("countries.malaysia") },
    { key: "Thailand", label: t("countries.thailand") },
    { key: "Indonesia", label: t("countries.indonesia") },
    { key: "Philippines", label: t("countries.philippines") },
    { key: "Vietnam", label: t("countries.vietnam") },
    { key: "China", label: t("countries.china") },
    { key: "Hong Kong", label: t("countries.hongKong") },
    { key: "Taiwan", label: t("countries.taiwan") },
    { key: "Brazil", label: t("countries.brazil") },
    { key: "Argentina", label: t("countries.argentina") },
    { key: "Chile", label: t("countries.chile") },
    { key: "Mexico", label: t("countries.mexico") },
    { key: "South Africa", label: t("countries.southAfrica") },
    { key: "Egypt", label: t("countries.egypt") },
    { key: "United Arab Emirates", label: t("countries.uae") },
    { key: "Saudi Arabia", label: t("countries.saudiArabia") },
    { key: "Israel", label: t("countries.israel") },
    { key: "Turkey", label: t("countries.turkey") },
    { key: "Russia", label: t("countries.russia") },
    { key: "Poland", label: t("countries.poland") },
    { key: "Czech Republic", label: t("countries.czechRepublic") },
    { key: "Hungary", label: t("countries.hungary") },
    { key: "Romania", label: t("countries.romania") },
    { key: "Bulgaria", label: t("countries.bulgaria") },
    { key: "Greece", label: t("countries.greece") },
    { key: "Portugal", label: t("countries.portugal") },
    { key: "Ireland", label: t("countries.ireland") },
    { key: "New Zealand", label: t("countries.newZealand") },
    { key: "Sri Lanka", label: t("countries.sriLanka") },
    { key: "Bangladesh", label: t("countries.bangladesh") },
    { key: "Pakistan", label: t("countries.pakistan") },
    { key: "Nepal", label: t("countries.nepal") },
    { key: "Bhutan", label: t("countries.bhutan") },
    { key: "Myanmar", label: t("countries.myanmar") },
    { key: "Other", label: t("countries.other") },
  ];

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setUploadLoading((prev) => ({ ...prev, [type]: true }));

    try {
      const preview = URL.createObjectURL(file);
      setFilePreviews((prev) => ({
        ...prev,
        [type]: { url: preview, name: file.name, type: file.type },
      }));

      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file: file,
      };

      setFileUploads((prev) => ({ ...prev, [type]: fileData }));
    } catch (error) {
      console.error("Upload failed:", error);
      setFilePreviews((prev) => ({ ...prev, [type]: null }));
    } finally {
      setUploadLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const removeFile = (type) => {
    if (filePreviews[type]?.url) {
      URL.revokeObjectURL(filePreviews[type].url);
    }

    setFileUploads((prev) => ({ ...prev, [type]: null }));
    setFilePreviews((prev) => ({ ...prev, [type]: null }));
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const createFormDataWithFiles = (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        formData.append(key, data[key]);
      }
    });

    if (fileUploads.aadhaarDocument?.file) {
      formData.append("aadhaarDocument", fileUploads.aadhaarDocument.file);
    }
    if (fileUploads.recentPhoto?.file) {
      formData.append("recentPhoto", fileUploads.recentPhoto.file);
    }
    if (fileUploads.passportDocument?.file) {
      formData.append("passportDocument", fileUploads.passportDocument.file);
    }

    return formData;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage("");
    setWhatsappStatus(null);

    try {
      const formData = createFormDataWithFiles(data);
      const response = await axios.post(
        "https://swami-g-dashboard.vercel.app/api/mantra-diksha",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSubmitMessage(t("mantraDiksha.messages.success"));
        setWhatsappStatus(
          response.data.whatsappSent
            ? t("mantraDiksha.messages.whatsappSent")
            : t("mantraDiksha.messages.uploadSuccess")
        );

        // Auto-hide success messages after 5 seconds
        setTimeout(() => {
          setSubmitMessage("");
          setWhatsappStatus(null);
        }, 5000);

        reset();

        Object.values(filePreviews).forEach((preview) => {
          if (preview?.url) {
            URL.revokeObjectURL(preview.url);
          }
        });

        setFileUploads({
          aadhaarDocument: null,
          recentPhoto: null,
          passportDocument: null,
        });

        setFilePreviews({
          aadhaarDocument: null,
          recentPhoto: null,
          passportDocument: null,
        });
      }
    } catch (error) {
      console.error("Registration submission error:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          t("mantraDiksha.messages.failed", { status: error.response.status });
        setSubmitMessage(errorMessage);
      } else if (error.request) {
        setSubmitMessage(t("mantraDiksha.messages.networkError"));
      } else {
        setSubmitMessage(t("mantraDiksha.messages.generalError"));
      }

      // Auto-hide error messages after 8 seconds
      setTimeout(() => {
        setSubmitMessage("");
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadArea = ({ type, accept, label, id }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-[#5D4037]">{label}</Label>
      <div className="border-2 border-dashed border-[#B82A1E]/20 rounded-xl p-6 text-center hover:border-[#B82A1E]/30 hover:bg-[#fcf9f5] transition-all duration-200 group">
        {uploadLoading[type] ? (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-[#B82A1E] mb-3" />
            <span className="text-sm text-[#5D4037]/70 font-medium">
              {t("mantraDiksha.upload.uploading")}
            </span>
          </div>
        ) : filePreviews[type] ? (
          <div className="space-y-4">
            {filePreviews[type].type?.startsWith("image/") ? (
              <div className="relative inline-block">
                <img
                  src={filePreviews[type].url}
                  alt={t("mantraDiksha.upload.preview")}
                  className="h-24 w-24 object-cover rounded-xl mx-auto shadow-md border-2 border-white"
                />
                <div className="absolute -top-2 -right-2 bg-green-100 text-green-600 rounded-full p-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-[#fcf9f5] rounded-lg p-3 mx-auto w-fit border border-[#B82A1E]/10">
                {getFileIcon(filePreviews[type].type)}
                <span className="ml-2 text-sm text-[#5D4037] font-medium truncate max-w-[150px]">
                  {filePreviews[type].name}
                </span>
              </div>
            )}

            <div className="flex items-center justify-center space-x-3">
              <span className="text-xs text-[#5D4037]/60 bg-[#B82A1E]/10 px-2 py-1 rounded-full">
                {(fileUploads[type]?.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={() => removeFile(type)}
                className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div>
              <input
                type="file"
                accept={accept}
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) handleFileUpload(file, type);
                }}
                className="hidden"
                id={`${id}-change`}
              />
              <label
                htmlFor={`${id}-change`}
                className="cursor-pointer text-xs text-[#B82A1E] hover:text-[#8a1f16] underline font-medium"
              >
                {t("mantraDiksha.upload.changeFile")}
              </label>
            </div>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) handleFileUpload(file, type);
              }}
              className="hidden"
              id={id}
            />
            <label htmlFor={id} className="cursor-pointer block">
              <div className="text-[#B82A1E]/60 group-hover:text-[#B82A1E] transition-colors mb-3">
                <Upload className="mx-auto h-10 w-10" />
              </div>
              <span className="text-sm text-[#5D4037] font-medium block mb-1">{label}</span>
              <p className="text-xs text-[#5D4037]/60">{t("mantraDiksha.upload.clickOrDrag")}</p>
              <p className="text-xs text-[#5D4037]/40 mt-1">{t("mantraDiksha.upload.maxSize")}</p>
            </label>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Hero Banner */}
      <div className="relative h-[70vh] overflow-hidden flex items-center justify-center pt-12 sm:pt-0">
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>

        <div className="relative z-20 text-white px-4 w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-tight">
                {t("mantraDiksha.hero.join")}{" "}
                <span className="italic">{t("mantraDiksha.hero.for")}</span>
              </h1>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-4 sm:mb-6">
                {t("mantraDiksha.hero.diksha")}
              </h1>

              <div className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-red-600/20 backdrop-blur-sm border border-red-300/30 text-red-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full">
                <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm font-medium">
                  {t("mantraDiksha.hero.inPersonOnly")}
                </span>
              </div>

              <div className="mt-6 sm:mt-8 flex justify-center md:justify-start">
                <div>
                  <div className="h-0.5 w-16 sm:w-20 bg-white/70"></div>
                  <div className="h-0.5 w-10 sm:w-12 bg-white/50 mt-1"></div>
                  <div className="h-0.5 w-4 sm:w-6 bg-white/30 mt-1"></div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full border border-white/10 animate-pulse"></div>
                <div className="w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full overflow-hidden border-3 border-white/20 shadow-2xl bg-white/5 relative">
                  <img
                    src="/assets/Prabhushree ji 01_.webp"
                    alt="Swami Avdheshanand Giri"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#B82A1E]/10 via-transparent to-white/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden flex flex-col items-center mt-6 sm:mt-8">
            <div className="relative">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-3 sm:border-4 border-white/20 shadow-2xl bg-white/5">
                <img
                  src="/assets/Prabhushree ji 01_.webp"
                  alt="Swami Avdheshanand Giri"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#B82A1E]/10 via-transparent to-white/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-white/10 text-2xl sm:text-4xl font-serif z-10">
          ॐ
        </div>
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-white/10 text-2xl sm:text-4xl font-serif z-10">
          ॐ
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#B82A1E] to-[#8a1f16] text-white p-8">
              <CardTitle className="text-3xl font-serif text-center">
                {t("mantraDiksha.title")}
              </CardTitle>
              <p className="text-center text-orange-100 mt-2">{t("mantraDiksha.subtitle")}</p>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                {/* Personal Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center mb-8 mt-8">
                    <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#B82A1E]/10 rounded-lg">
                        <User className="h-5 w-5 text-[#B82A1E]" />
                      </div>
                      <h3 className="text-2xl font-serif text-[#5D4037]">
                        {t("mantraDiksha.sections.personalDetails")}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-[#5D4037]">
                        {t("mantraDiksha.fields.fullName")} *
                      </Label>
                      <Input
                        id="fullName"
                        {...register("fullName")}
                        className={`h-12 border-2 rounded-lg transition-all duration-200 ${
                          errors.fullName
                            ? "border-red-300 focus:border-red-500"
                            : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                        }`}
                        placeholder={t("mantraDiksha.placeholders.fullName")}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="dateOfBirth"
                        className="text-sm font-medium text-[#5D4037] flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        {t("mantraDiksha.fields.dateOfBirth")} *
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth")}
                        className={`h-12 border-2 rounded-lg transition-all duration-200 ${
                          errors.dateOfBirth
                            ? "border-red-300 focus:border-red-500"
                            : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                        }`}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium text-[#5D4037]">
                        {t("mantraDiksha.fields.gender")} *
                      </Label>
                      <Select onValueChange={(value) => setValue("gender", value)}>
                        <SelectTrigger
                          className={`h-12 border-2 rounded-lg transition-all duration-200 ${
                            errors.gender
                              ? "border-red-300 focus:border-red-500"
                              : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                          }`}
                        >
                          <SelectValue placeholder={t("mantraDiksha.placeholders.gender")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">{t("mantraDiksha.gender.male")}</SelectItem>
                          <SelectItem value="Female">{t("mantraDiksha.gender.female")}</SelectItem>
                          <SelectItem value="Other">{t("mantraDiksha.gender.other")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.gender.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="nationality"
                        className="text-sm font-medium text-[#5D4037] flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        {t("mantraDiksha.fields.nationality")} *
                      </Label>
                      <Select onValueChange={(value) => setValue("nationality", value)}>
                        <SelectTrigger
                          className={`h-12 border-2 rounded-lg transition-all duration-200 ${
                            errors.nationality
                              ? "border-red-300 focus:border-red-500"
                              : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                          }`}
                        >
                          <SelectValue placeholder={t("mantraDiksha.placeholders.nationality")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {countries.map((country) => (
                            <SelectItem key={country.key} value={country.key}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.nationality && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.nationality.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center mb-8">
                    <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-serif text-[#5D4037]">
                        {t("mantraDiksha.sections.contactInfo")}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email Field - Required for all nationalities */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-[#5D4037] flex items-center gap-2"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        {t("mantraDiksha.fields.email")} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("mantraDiksha.placeholders.email")}
                        {...register("email")}
                        className={`h-12 border-2 rounded-lg transition-all duration-200 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber" className="text-sm font-medium text-[#5D4037]">
                        {t("mantraDiksha.fields.mobileNumber")} *
                      </Label>
                      <Input
                        id="mobileNumber"
                        placeholder={isIndian ? "+91 98765 43210" : "+1 234 567 8900"}
                        {...register("mobileNumber")}
                        className={`h-12 border-2 rounded-lg transition-all duration-200 ${
                          errors.mobileNumber
                            ? "border-red-300 focus:border-red-500"
                            : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                        }`}
                      />
                      {errors.mobileNumber && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.mobileNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="whatsappNumber"
                        className="text-sm font-medium text-[#5D4037]"
                      >
                        {t("mantraDiksha.fields.whatsappNumber")}
                      </Label>
                      <Input
                        id="whatsappNumber"
                        placeholder={isIndian ? "+91 98765 43210" : "+1 234 567 8900"}
                        {...register("whatsappNumber")}
                        className="h-12 border-2 border-[#B82A1E]/20 rounded-lg focus:border-[#B82A1E] transition-all duration-200"
                      />
                      {errors.whatsappNumber && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.whatsappNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Conditional fields based on nationality */}
                    {isIndian ? (
                      <div className="space-y-2">
                        <Label
                          htmlFor="aadhaarNumber"
                          className="text-sm font-medium text-[#5D4037]"
                        >
                          {t("mantraDiksha.fields.aadhaarNumber")}
                        </Label>
                        <Input
                          id="aadhaarNumber"
                          placeholder="1234 5678 9012"
                          {...register("aadhaarNumber")}
                          className="h-12 border-2 border-[#B82A1E]/20 rounded-lg focus:border-[#B82A1E] transition-all duration-200"
                        />
                        {errors.aadhaarNumber && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.aadhaarNumber.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      nationality &&
                      nationality !== "Other" && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="passportNumber"
                            className="text-sm font-medium text-[#5D4037] flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4" />
                            {t("mantraDiksha.fields.passportNumber")} *
                          </Label>
                          <Input
                            id="passportNumber"
                            placeholder={t("mantraDiksha.placeholders.passportNumber")}
                            {...register("passportNumber")}
                            className={`h-12 border-2 rounded-lg transition-all duration-200 ${
                              errors.passportNumber
                                ? "border-red-300 focus:border-red-500"
                                : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                            }`}
                          />
                          {errors.passportNumber && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {errors.passportNumber.message}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* File Upload Section - Move to second row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isIndian ? (
                      <FileUploadArea
                        type="aadhaarDocument"
                        accept="image/*,.pdf"
                        label={t("mantraDiksha.fields.aadhaarDocument")}
                        id="aadhaar-upload"
                      />
                    ) : (
                      nationality &&
                      nationality !== "Other" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[#5D4037] flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t("mantraDiksha.fields.passportDocument")} *
                          </Label>
                          <FileUploadArea
                            type="passportDocument"
                            accept="image/*,.pdf"
                            label={t("mantraDiksha.fields.uploadPassport")}
                            id="passport-upload"
                          />
                          <p className="text-xs text-gray-500">
                            {t("mantraDiksha.help.passportCopy")}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Helpful message based on nationality */}
                  {nationality && nationality !== "Other" && (
                    <div
                      className={`p-4 rounded-lg border-l-4 ${
                        isIndian
                          ? "bg-green-50 border-green-400 text-green-700"
                          : "bg-blue-50 border-blue-400 text-blue-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {isIndian
                            ? t("mantraDiksha.help.indianNational")
                            : t("mantraDiksha.help.foreignNational")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Spiritual Intent Section */}
                <div className="bg-[#fcf9f5] rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 text-[#B82A1E]/5 text-[200px] font-serif">
                    ॐ
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center mb-8">
                      <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Heart className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-serif text-[#5D4037]">
                          {t("mantraDiksha.sections.spiritualIntent")}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="spiritualIntent"
                          className="text-sm font-medium text-[#5D4037]"
                        >
                          {t("mantraDiksha.fields.whyDiksha")} *
                        </Label>
                        <Textarea
                          id="spiritualIntent"
                          {...register("spiritualIntent")}
                          className={`min-h-24 border-2 rounded-lg transition-all duration-200 resize-none ${
                            errors.spiritualIntent
                              ? "border-red-300 focus:border-red-500"
                              : "border-[#B82A1E]/20 focus:border-[#B82A1E]"
                          }`}
                          placeholder={t("mantraDiksha.placeholders.spiritualIntent")}
                          rows={4}
                        />
                        {errors.spiritualIntent && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.spiritualIntent.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="spiritualPath"
                          className="text-sm font-medium text-[#5D4037]"
                        >
                          {t("mantraDiksha.fields.spiritualPath")}
                        </Label>
                        <Textarea
                          id="spiritualPath"
                          {...register("spiritualPath")}
                          className="min-h-20 border-2 border-[#B82A1E]/20 rounded-lg focus:border-[#B82A1E] transition-all duration-200 resize-none"
                          placeholder={t("mantraDiksha.placeholders.spiritualPath")}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="previousDiksha"
                          className="text-sm font-medium text-[#5D4037]"
                        >
                          {t("mantraDiksha.fields.previousDiksha")}
                        </Label>
                        <Textarea
                          id="previousDiksha"
                          {...register("previousDiksha")}
                          className="min-h-20 border-2 border-[#B82A1E]/20 rounded-lg focus:border-[#B82A1E] transition-all duration-200 resize-none"
                          placeholder={t("mantraDiksha.placeholders.previousDiksha")}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Uploads Section */}
                <div className="space-y-6">
                  <div className="flex items-center mb-8">
                    <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Upload className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-serif text-[#5D4037]">
                        {t("mantraDiksha.sections.optionalDocuments")}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FileUploadArea
                      type="recentPhoto"
                      accept="image/*"
                      label={t("mantraDiksha.fields.recentPhoto")}
                      id="photo-upload"
                    />
                    <div></div>
                  </div>
                </div>

                {/* Terms and Conditions Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 relative overflow-hidden border border-blue-100">
                  <div className="absolute -top-20 -right-20 text-blue-200 text-[150px] font-serif">
                    ॐ
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center mb-6">
                      <div className="w-1.5 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 mr-4 rounded-full"></div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-serif text-[#5D4037]">
                          {t("mantraDiksha.sections.termsConditions")}
                        </h3>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 max-h-64 overflow-y-auto">
                      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                        <h4 className="font-semibold text-[#5D4037] text-lg mb-3">
                          {t("mantraDiksha.terms.title")}
                        </h4>

                        <div className="space-y-3">
                          <p>
                            <strong>{t("mantraDiksha.terms.sacred.title")}</strong>{" "}
                            {t("mantraDiksha.terms.sacred.content")}
                          </p>
                          <p>
                            <strong>{t("mantraDiksha.terms.inPerson.title")}</strong>{" "}
                            {t("mantraDiksha.terms.inPerson.content")}
                          </p>
                          <p>
                            <strong>{t("mantraDiksha.terms.preparation.title")}</strong>{" "}
                            {t("mantraDiksha.terms.preparation.content")}
                          </p>
                          <p>
                            <strong>{t("mantraDiksha.terms.confidentiality.title")}</strong>{" "}
                            {t("mantraDiksha.terms.confidentiality.content")}
                          </p>
                          <p>
                            <strong>{t("mantraDiksha.terms.practice.title")}</strong>{" "}
                            {t("mantraDiksha.terms.practice.content")}
                          </p>
                          <p>
                            <strong>{t("mantraDiksha.terms.respect.title")}</strong>{" "}
                            {t("mantraDiksha.terms.respect.content")}
                          </p>
                          <p>
                            <strong>{t("mantraDiksha.terms.noGuarantee.title")}</strong>{" "}
                            {t("mantraDiksha.terms.noGuarantee.content")}
                          </p>
                          <p>
                            <strong>{t("mantraDiksha.terms.dataUsage.title")}</strong>{" "}
                            {t("mantraDiksha.terms.dataUsage.content")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-white/60 rounded-lg border border-blue-200">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          {...register("acceptTerms")}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor="acceptTerms"
                          className="text-sm font-medium text-[#5D4037] cursor-pointer"
                        >
                          {t("mantraDiksha.terms.acceptance")} *
                        </label>
                        {errors.acceptTerms && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-2">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.acceptTerms.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8 border-t border-[#B82A1E]/10">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !acceptTerms}
                    className={`w-full h-14 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                      acceptTerms
                        ? "bg-gradient-to-r from-[#B82A1E] to-[#8a1f16] hover:from-[#8a1f16] hover:to-[#7B0000] text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin h-5 w-5" />
                        {t("mantraDiksha.buttons.submitting")}
                      </div>
                    ) : !acceptTerms ? (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5" />
                        {t("mantraDiksha.buttons.acceptTerms")}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5" />
                        {t("mantraDiksha.buttons.submit")}
                      </div>
                    )}
                  </Button>

                  {!acceptTerms && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {t("mantraDiksha.buttons.mustAccept")}
                    </p>
                  )}
                </div>

                {/* Messages */}
                {submitMessage && (
                  <div
                    className={`p-4 rounded-xl border-l-4 ${
                      submitMessage.includes("success") ||
                      submitMessage === t("mantraDiksha.messages.success")
                        ? "bg-green-50 border-green-400 text-green-700"
                        : "bg-red-50 border-red-400 text-red-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {submitMessage.includes("success") ||
                      submitMessage === t("mantraDiksha.messages.success") ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                      <span className="font-medium">{submitMessage}</span>
                    </div>
                  </div>
                )}

                {whatsappStatus && (
                  <div className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-400 text-blue-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">{whatsappStatus}</span>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
