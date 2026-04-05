import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Heart,
  Phone,
  MapPin,
  Mail,
  User,
  Users,
  Briefcase,
  SquarePen,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const Volunteer = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
  };

  // Define validation schema with Yup
  const validationSchema = yup.object().shape({
    fullName: yup
      .string()
      .required(t("volunteer.validation.nameRequired"))
      .min(3, t("volunteer.validation.nameMinLength")),

    email: yup
      .string()
      .required(t("volunteer.validation.emailRequired"))
      .email(t("volunteer.validation.emailValid")),

    phone: yup
      .string()
      .required(t("volunteer.validation.phoneRequired"))
      .matches(/^[0-9]{10}$/, t("volunteer.validation.phoneValid")),

    location: yup
      .string()
      .required(t("volunteer.validation.locationRequired"))
      .min(2, t("volunteer.validation.locationValid")),

    age: yup
      .number()
      .typeError(t("volunteer.validation.ageType"))
      .required(t("volunteer.validation.ageRequired"))
      .min(18, t("volunteer.validation.ageMin"))
      .max(100, t("volunteer.validation.ageMax")),

    occupationType: yup.string().required(t("volunteer.validation.occupationTypeRequired")),

    occupation: yup.string().when("occupationType", {
      is: (val) => val && val !== "unemployed" && val !== "retired",
      then: (schema) => schema.required(t("volunteer.validation.occupationRequired")),
      otherwise: (schema) => schema.notRequired(),
    }),

    availability: yup
      .array()
      .min(1, t("volunteer.validation.availabilityMin"))
      .required(t("volunteer.validation.availabilityRequired")),

    availableFrom: yup
      .date()
      .transform((value, originalValue) => {
        return originalValue === "" ? null : value;
      })
      .required(t("volunteer.validation.availableFromRequired"))
      .min(new Date(), t("volunteer.validation.availableFromPast")),

    availableUntil: yup
      .date()
      .nullable()
      .min(yup.ref("availableFrom"), t("volunteer.validation.availableUntilAfter")),

    skills: yup
      .array()
      .min(1, t("volunteer.validation.skillsMin"))
      .required(t("volunteer.validation.skillsRequired")),

    motivation: yup
      .string()
      .required(t("volunteer.validation.motivationRequired"))
      .min(50, t("volunteer.validation.motivationMinLength")),

    experience: yup.string(),

    consent: yup
      .boolean()
      .oneOf([true], t("volunteer.validation.consentRequired"))
      .required(t("volunteer.validation.consentRequired")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      age: "",
      occupationType: "",
      occupation: "",
      availability: [],
      availableFrom: "",
      availableUntil: "",
      skills: [],
      motivation: "",
      experience: "",
      consent: false,
    },
  });

  const skillOptions = [
    { id: "event_coordination", label: t("volunteer.skills.eventCoordination") },
    { id: "content_writing", label: t("volunteer.skills.contentWriting") },
    { id: "social_media", label: t("volunteer.skills.socialMedia") },
    { id: "photography", label: t("volunteer.skills.photography") },
    { id: "web_development", label: t("volunteer.skills.webDevelopment") },
    { id: "translation", label: t("volunteer.skills.translation") },
    { id: "medical", label: t("volunteer.skills.medical") },
    { id: "administrative", label: t("volunteer.skills.administrative") },
    { id: "film_making", label: t("volunteer.skills.filmMaking") },
    { id: "accounts", label: t("volunteer.skills.accounts") },
    { id: "organization_development", label: t("volunteer.skills.organizationDevelopment") },

  ];

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      e.target.value = null;
      return;
    }

    // Validate file type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP images and PDF files are allowed");
      e.target.value = null;
      return;
    }

    setProfileFile(file);

    // Create preview for images only
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePreview(null);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setProfileFile(null);
    setProfilePreview(null);
    // Reset file input
    const fileInput = document.getElementById("profile-upload");
    if (fileInput) fileInput.value = null;
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();

      // Append all text fields
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("location", data.location);
      formData.append("age", data.age.toString());
      formData.append("occupationType", data.occupationType);

      if (data.occupation) {
        formData.append("occupation", data.occupation);
      }

      // Append arrays as JSON strings
      formData.append("availability", JSON.stringify(data.availability));
      formData.append("skills", JSON.stringify(data.skills));

      // Append dates as ISO strings
      if (data.availableFrom) {
        formData.append("availableFrom", new Date(data.availableFrom).toISOString());
      }
      if (data.availableUntil) {
        formData.append("availableUntil", new Date(data.availableUntil).toISOString());
      }

      formData.append("motivation", data.motivation);

      if (data.experience) {
        formData.append("experience", data.experience);
      }

      formData.append("consent", data.consent.toString());

      // Append profile file if selected
      if (profileFile) {
        formData.append("profile", profileFile);
      }

      // Send data to API endpoint
      await axios.post(import.meta.env.VITE_APP_VOLUNTEER_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(t("volunteer.form.success"));
      setIsSubmitted(true);
      reset();
      removeFile();
    } catch (error) {
      console.error(t("volunteer.errors.submission"), error);

      // More specific error messages
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("volunteer.errors.submissionFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="volunteerTop" className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white">
      {/* Hero Section */}
      <div className="relative h-[530px] overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/assets/volunteer-banner.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{t("volunteer.hero.title")}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            {t("volunteer.hero.subtitle")}
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center mb-8">
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
              {t("volunteer.intro.title")}
            </h2>
          </div>

          <p className="text-[#5D4037]/80 leading-relaxed mb-6">
            {t("volunteer.intro.paragraph1")}
          </p>

          <p className="text-[#5D4037]/80 leading-relaxed mb-8">
            {t("volunteer.intro.paragraph2")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Heart className="h-8 w-8 text-white" />,
                title: t("volunteer.benefits.service.title"),
                description: t("volunteer.benefits.service.description"),
              },
              {
                icon: <Users className="h-8 w-8 text-white" />,
                title: t("volunteer.benefits.community.title"),
                description: t("volunteer.benefits.community.description"),
              },
              {
                icon: <SquarePen className="h-8 w-8 text-white" />,
                title: t("volunteer.benefits.growth.title"),
                description: t("volunteer.benefits.growth.description"),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#B82A1E] to-[#8a1f16] rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="bg-white/10 p-4 rounded-full inline-flex mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 text-[#B82A1E]/5 text-[200px] font-serif">
              ॐ
            </div>
            <div className="absolute -bottom-20 -left-20 text-[#B82A1E]/5 text-[200px] font-serif">
              ॐ
            </div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif text-[#5D4037] mb-2">
                  {t("volunteer.form.title")}
                </h3>
                <p className="text-[#5D4037]/70">{t("volunteer.form.subtitle")}</p>
              </div>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="bg-green-50 rounded-full p-6 inline-flex mb-4">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-[#5D4037] mb-2">
                    {t("volunteer.form.submitted.title")}
                  </h4>
                  <p className="text-[#5D4037]/70 mb-6">{t("volunteer.form.submitted.message")}</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2 bg-[#B82A1E] text-white rounded-md hover:bg-[#9a231a] transition-colors"
                  >
                    {t("volunteer.form.submitted.registerAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Profile Upload Section */}
                  <div>
                    <label className="block text-[#5D4037] font-medium mb-2">
                      Profile Photo / Resume (PDF)
                      <span className="text-gray-500 font-normal text-sm ml-2">
                        (Optional - Max 5MB)
                      </span>
                    </label>

                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="profile-upload"
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-gray-600" />
                        <span className="text-[#5D4037]">Choose File</span>
                        <input
                          id="profile-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {profileFile && (
                        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                          <span className="text-[#5D4037] text-sm truncate max-w-xs">
                            {profileFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {profilePreview && (
                      <div className="mt-4">
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}

                    <p className="mt-2 text-gray-500 text-xs">
                      Accepted formats: JPG, PNG, WEBP (images) or PDF (resume). Maximum size: 5MB
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.fullName")}{" "}
                        <span className="text-[#B82A1E]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("fullName")}
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                            errors.fullName ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={t("volunteer.form.placeholders.fullName")}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-red-500 text-sm">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.email")} <span className="text-[#B82A1E]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("email")}
                          type="email"
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={t("volunteer.form.placeholders.email")}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.phone")} <span className="text-[#B82A1E]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("phone")}
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={t("volunteer.form.placeholders.phone")}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-red-500 text-sm">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.location")}{" "}
                        <span className="text-[#B82A1E]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("location")}
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                            errors.location ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={t("volunteer.form.placeholders.location")}
                        />
                      </div>
                      {errors.location && (
                        <p className="mt-1 text-red-500 text-sm">{errors.location.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.age")} <span className="text-[#B82A1E]">*</span>
                      </label>
                      <input
                        {...register("age")}
                        type="number"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                          errors.age ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder={t("volunteer.form.placeholders.age")}
                      />
                      {errors.age && (
                        <p className="mt-1 text-red-500 text-sm">{errors.age.message}</p>
                      )}
                    </div>

                    {/* Occupation Type & Occupation */}
                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.occupationType")}{" "}
                        <span className="text-[#B82A1E]">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          {...register("occupationType")}
                          className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] appearance-none ${
                            errors.occupationType ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">
                            {t("volunteer.form.placeholders.occupationType")}
                          </option>
                          <option value="private">
                            {t("volunteer.form.occupationTypes.private")}
                          </option>
                          <option value="government">
                            {t("volunteer.form.occupationTypes.government")}
                          </option>
                          <option value="business">
                            {t("volunteer.form.occupationTypes.business")}
                          </option>
                          <option value="unemployed">
                            {t("volunteer.form.occupationTypes.unemployed")}
                          </option>
                          <option value="retired">
                            {t("volunteer.form.occupationTypes.retired")}
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                      {errors.occupationType && (
                        <p className="mt-1 text-red-500 text-sm">{errors.occupationType.message}</p>
                      )}
                    </div>

                    {watch("occupationType") &&
                      watch("occupationType") !== "unemployed" &&
                      watch("occupationType") !== "retired" && (
                        <div>
                          <label className="block text-[#5D4037] font-medium mb-2">
                            {t("volunteer.form.fields.occupation")}{" "}
                            <span className="text-[#B82A1E]">*</span>
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              {...register("occupation")}
                              className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                                errors.occupation ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder={
                                watch("occupationType") === "business"
                                  ? t("volunteer.form.placeholders.business")
                                  : t("volunteer.form.placeholders.occupation")
                              }
                            />
                          </div>
                          {errors.occupation && (
                            <p className="mt-1 text-red-500 text-sm">{errors.occupation.message}</p>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Availability & Skills */}
                  <div>
                    <label className="block text-[#5D4037] font-medium mb-2">
                      {t("volunteer.form.fields.availability")}{" "}
                      <span className="text-[#B82A1E]">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          id: "weekday_mornings",
                          label: t("volunteer.form.availability.weekdayMornings"),
                        },
                        {
                          id: "weekday_afternoons",
                          label: t("volunteer.form.availability.weekdayAfternoons"),
                        },
                        {
                          id: "weekday_evenings",
                          label: t("volunteer.form.availability.weekdayEvenings"),
                        },
                        { id: "weekends", label: t("volunteer.form.availability.weekends") },
                        {
                          id: "special_events",
                          label: t("volunteer.form.availability.specialEvents"),
                        },
                      ].map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            {...register("availability")}
                            type="checkbox"
                            id={option.id}
                            value={option.id}
                            className="w-4 h-4 text-[#B82A1E] focus:ring-[#B82A1E] border-gray-300 rounded"
                          />
                          <label htmlFor={option.id} className="ml-2 text-[#5D4037]">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.availability && (
                      <p className="mt-1 text-red-500 text-sm">{errors.availability.message}</p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.availableFrom")}{" "}
                        <span className="text-[#B82A1E]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register("availableFrom")}
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                            errors.availableFrom ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.availableFrom && (
                        <p className="mt-1 text-red-500 text-sm">{errors.availableFrom.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#5D4037] font-medium mb-2">
                        {t("volunteer.form.fields.availableUntil")}{" "}
                        <span className="text-gray-500 font-normal text-sm">
                          {t("volunteer.form.fields.optional")}
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          {...register("availableUntil")}
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E]"
                        />
                      </div>
                      <p className="mt-1 text-gray-500 text-xs">
                        {t("volunteer.form.fields.availableUntilNote")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#5D4037] font-medium mb-2">
                      {t("volunteer.form.fields.skills")} <span className="text-[#B82A1E]">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {skillOptions.map((skill) => (
                        <div key={skill.id} className="flex items-center">
                          <input
                            {...register("skills")}
                            type="checkbox"
                            id={skill.id}
                            value={skill.id}
                            className="w-4 h-4 text-[#B82A1E] focus:ring-[#B82A1E] border-gray-300 rounded"
                          />
                          <label htmlFor={skill.id} className="ml-2 text-[#5D4037]">
                            {skill.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.skills && (
                      <p className="mt-1 text-red-500 text-sm">{errors.skills.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#5D4037] font-medium mb-2">
                      {t("volunteer.form.fields.motivation")}{" "}
                      <span className="text-[#B82A1E]">*</span>
                    </label>
                    <textarea
                      {...register("motivation")}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                        errors.motivation ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={t("volunteer.form.placeholders.motivation")}
                    ></textarea>
                    {errors.motivation && (
                      <p className="mt-1 text-red-500 text-sm">{errors.motivation.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#5D4037] font-medium mb-2">
                      {t("volunteer.form.fields.experience")}
                    </label>
                    <textarea
                      {...register("experience")}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E]"
                      placeholder={t("volunteer.form.placeholders.experience")}
                    ></textarea>
                  </div>

                  <div className="flex items-start">
                    <input
                      {...register("consent")}
                      type="checkbox"
                      id="consent"
                      className="mt-1 w-4 h-4 text-[#B82A1E] focus:ring-[#B82A1E] border-gray-300 rounded"
                    />
                    <label htmlFor="consent" className="ml-2 text-[#5D4037] text-sm">
                      {t("volunteer.form.fields.consent")} <span className="text-[#B82A1E]">*</span>
                    </label>
                  </div>
                  {errors.consent && (
                    <p className="mt-1 text-red-500 text-sm">{errors.consent.message}</p>
                  )}

                  <div className="text-center pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-[#B82A1E] to-[#8a1f16] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("volunteer.form.processing")}
                        </span>
                      ) : (
                        t("volunteer.form.submitButton")
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <blockquote className="text-2xl md:text-3xl font-serif text-[#5D4037] italic mb-6">
            {t("volunteer.quote.text")}
          </blockquote>
          <div className="h-0.5 w-20 bg-[#B82A1E]/30 mx-auto mb-4"></div>
          <p className="text-[#5D4037] font-medium">{t("volunteer.quote.author")}</p>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
