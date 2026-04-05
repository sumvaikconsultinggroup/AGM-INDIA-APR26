import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Search,
  X,
  Check,
  Loader2,
  User,
  Mail,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";

// Constants - Country Codes with Flag Emojis
const COUNTRY_CODES = [
  { name: "United States", code: "+1", country: "US", flag: "🇺🇸", isPopular: true },
  { name: "India", code: "+91", country: "IN", flag: "🇮🇳", isPopular: true },
  { name: "United Kingdom", code: "+44", country: "GB", flag: "🇬🇧", isPopular: true },
  { name: "Canada", code: "+1", country: "CA", flag: "🇨🇦", isPopular: true },
  { name: "Australia", code: "+61", country: "AU", flag: "🇦🇺", isPopular: true },
  { name: "United Arab Emirates", code: "+971", country: "AE", flag: "🇦🇪", isPopular: true },
  { name: "Saudi Arabia", code: "+966", country: "SA", flag: "🇸🇦", isPopular: true },
  { name: "Germany", code: "+49", country: "DE", flag: "🇩🇪", isPopular: false },
  { name: "France", code: "+33", country: "FR", flag: "🇫🇷", isPopular: false },
  { name: "Italy", code: "+39", country: "IT", flag: "🇮🇹", isPopular: false },
  { name: "Spain", code: "+34", country: "ES", flag: "🇪🇸", isPopular: false },
  { name: "China", code: "+86", country: "CN", flag: "🇨🇳", isPopular: false },
  { name: "Japan", code: "+81", country: "JP", flag: "🇯🇵", isPopular: false },
  { name: "Russia", code: "+7", country: "RU", flag: "🇷🇺", isPopular: false },
  { name: "Brazil", code: "+55", country: "BR", flag: "🇧🇷", isPopular: false },
  { name: "South Korea", code: "+82", country: "KR", flag: "🇰🇷", isPopular: false },
  { name: "Singapore", code: "+65", country: "SG", flag: "🇸🇬", isPopular: false },
  { name: "Switzerland", code: "+41", country: "CH", flag: "🇨🇭", isPopular: false },
  { name: "Netherlands", code: "+31", country: "NL", flag: "🇳🇱", isPopular: false },
  { name: "South Africa", code: "+27", country: "ZA", flag: "🇿🇦", isPopular: false },
  { name: "Indonesia", code: "+62", country: "ID", flag: "🇮🇩", isPopular: false },
  { name: "Malaysia", code: "+60", country: "MY", flag: "🇲🇾", isPopular: false },
  { name: "Pakistan", code: "+92", country: "PK", flag: "🇵🇰", isPopular: false },
  { name: "Thailand", code: "+66", country: "TH", flag: "🇹🇭", isPopular: false },
  { name: "Philippines", code: "+63", country: "PH", flag: "🇵🇭", isPopular: false },
  { name: "Vietnam", code: "+84", country: "VN", flag: "🇻🇳", isPopular: false },
  { name: "Bangladesh", code: "+880", country: "BD", flag: "🇧🇩", isPopular: false },
  { name: "Sri Lanka", code: "+94", country: "LK", flag: "🇱🇰", isPopular: false },
  { name: "Nepal", code: "+977", country: "NP", flag: "🇳🇵", isPopular: false },
  { name: "Myanmar", code: "+95", country: "MM", flag: "🇲🇲", isPopular: false },
  { name: "Turkey", code: "+90", country: "TR", flag: "🇹🇷", isPopular: false },
  { name: "Egypt", code: "+20", country: "EG", flag: "🇪🇬", isPopular: false },
  { name: "Nigeria", code: "+234", country: "NG", flag: "🇳🇬", isPopular: false },
  { name: "Kenya", code: "+254", country: "KE", flag: "🇰🇪", isPopular: false },
  { name: "Ghana", code: "+233", country: "GH", flag: "🇬🇭", isPopular: false },
  { name: "Mexico", code: "+52", country: "MX", flag: "🇲🇽", isPopular: false },
  { name: "Argentina", code: "+54", country: "AR", flag: "🇦🇷", isPopular: false },
  { name: "Chile", code: "+56", country: "CL", flag: "🇨🇱", isPopular: false },
  { name: "Colombia", code: "+57", country: "CO", flag: "🇨🇴", isPopular: false },
  { name: "Peru", code: "+51", country: "PE", flag: "🇵🇪", isPopular: false },
  { name: "Ecuador", code: "+593", country: "EC", flag: "🇪🇨", isPopular: false },
  { name: "Venezuela", code: "+58", country: "VE", flag: "🇻🇪", isPopular: false },
  { name: "Uruguay", code: "+598", country: "UY", flag: "🇺🇾", isPopular: false },
  { name: "Paraguay", code: "+595", country: "PY", flag: "🇵🇾", isPopular: false },
  { name: "Bolivia", code: "+591", country: "BO", flag: "🇧🇴", isPopular: false },
  { name: "Guyana", code: "+592", country: "GY", flag: "🇬🇾", isPopular: false },
  { name: "Suriname", code: "+597", country: "SR", flag: "🇸🇷", isPopular: false },
  { name: "French Guiana", code: "+594", country: "GF", flag: "🇬🇫", isPopular: false },
];

// Phone validation rules for different countries
const PHONE_VALIDATION_RULES = {
  "+1": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+91": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+44": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+61": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+971": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+966": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+49": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+33": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+39": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+34": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+86": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+81": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+7": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+55": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+82": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+65": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+92": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  "+880": { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
  default: { pattern: /^[0-9]{10}$/, message: "Phone number must have 10 digits" },
};

// Dynamic validation schema
const createValidationSchema = () => {
  return yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must not exceed 50 characters")
      .matches(
        /^[a-zA-Z\s.'-]+$/,
        "Name can only contain letters, spaces, periods, apostrophes, and hyphens"
      ),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address"
      ),
    countryCode: yup.string().required("Country code is required"),
    phone: yup
      .string()
      .required("Phone number is required")
      .test("phone-validation", "Invalid phone number", function (value) {
        const countryCode = this.parent.countryCode;
        const validationRule =
          PHONE_VALIDATION_RULES[countryCode] || PHONE_VALIDATION_RULES.default;

        if (!validationRule.pattern.test(value)) {
          return this.createError({
            path: this.path,
            message: validationRule.message,
          });
        }
        return true;
      }),
    purpose: yup.string().required("Purpose is required").notOneOf([""], "Please select a purpose"),
    preferredTime: yup.string().when("$isWholeDay", {
      is: true,
      then: (schema) => schema.required("Please select a preferred time"),
      otherwise: (schema) => schema.notRequired(),
    }),
    additionalInfo: yup.string().max(500, "Additional information must not exceed 500 characters"),
  });
};

const PURPOSE_OPTIONS = [
  "Personal Guidance",
  "Spiritual Discussion",
  "Community Event",
  "Organization Collaboration",
  "Media Interview",
  "Educational Institution Visit",
  "Cultural Program",
  "Charitable Work Discussion",
  "Other",
];

const DEFAULT_FORM_VALUES = {
  name: "",
  email: "",
  countryCode: "+91", // Default to India
  phone: "",
  purpose: "",
  preferredTime: "",
  additionalInfo: [],
};

// Appointment Request Modal Component
function AppointmentRequestModal({ isOpen, onClose, scheduleItem, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createValidationSchema()),
    defaultValues: DEFAULT_FORM_VALUES,
    context: {
      isWholeDay: scheduleItem?.period?.toLowerCase() === "whole day",
    },
  });

  const watchedCountryCode = watch("countryCode");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const isWholeDay = scheduleItem?.period?.toLowerCase() === "whole day";
      reset({
        ...DEFAULT_FORM_VALUES,
        preferredTime: isWholeDay ? "" : scheduleItem?.period || "",
      });
      setError("");
      setSuccessMessage("");
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  // Get phone validation info for current country
  const getPhoneValidationInfo = useCallback((countryCode) => {
    const validationRule = PHONE_VALIDATION_RULES[countryCode] || PHONE_VALIDATION_RULES.default;
    const countryInfo = COUNTRY_CODES.find((c) => c.code === countryCode);

    let digitInfo = "number";
    if (validationRule.message) {
      const match = validationRule.message.match(/(\d+(-\d+)?)(?=\s*digits)/);
      if (match) {
        digitInfo = `${match[0]}-digit`;
      }
    }

    return {
      placeholder: `Enter your ${digitInfo} number`,
      validationRule,
      countryName: countryInfo?.name || "phone",
    };
  }, []);

  // Form submission handler
  const onFormSubmit = useCallback(
    async (data) => {
      setIsSubmitting(true);
      setError("");

      try {
        const formData = new FormData();

        // Format the phone number with country code
        const formattedData = {
          ...data,
          phone: `${data.countryCode}${data.phone}`,
        };

        // Remove separate countryCode since it's now part of phone
        delete formattedData.countryCode;

        if (scheduleItem?.period?.toLowerCase() !== "whole day") {
          formattedData.preferredTime = scheduleItem.period;
        }

        // Add form fields to FormData
        Object.entries(formattedData).forEach(([key, value]) => {
          formData.append(key, value || "");
        });

        formData.append("status", "PENDING");
        formData.append("isDeleted", false);
        formData.append("submittedAt", new Date().toISOString());

        // Add requested schedule fields
        const scheduleData = {
          scheduleId: scheduleItem.id,
          eventDate:
            scheduleItem.startDate !== "Not Available" ? scheduleItem.startDate : "To be announced",
          eventTime:
            scheduleItem.time && scheduleItem.time !== "Time TBD"
              ? scheduleItem.time
              : "To be announced",
          eventLocation: scheduleItem.location || "To be announced",
          eventDetails: scheduleItem.details || "Details to be announced",
        };

        Object.entries(scheduleData).forEach(([key, value]) => {
          formData.append(`requestedSchedule[${key}]`, value);
        });


        // Submit the form
        await axios.post(import.meta.env.VITE_APP_API_BASE_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // 30 second timeout
        });

        setSuccessMessage(
          "Your appointment request has been submitted successfully! We will contact you within 24-48 hours to confirm the details."
        );

        onSubmit?.({
          ...formattedData,
          status: "PENDING",
          requestedSchedule: scheduleData,
          submittedAt: new Date().toISOString(),
        });

        // Auto close after 5 seconds
        setTimeout(onClose, 5000);
      } catch (err) {
        console.error("Failed to request appointment:", err);

        let errorMessage = "Failed to submit your request. Please try again later.";

        if (err.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection and try again.";
        } else if (err.response?.status === 429) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (err.response?.status >= 500) {
          errorMessage = "Server error. Please try again in a few minutes.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [scheduleItem, onSubmit, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#5a0000] to-[#8a0000] text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold">Request Appointment</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successMessage ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Check size={16} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium">Success!</p>
                <p className="text-sm mt-1">{successMessage}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Event Details Summary */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Event Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#e63946]" />
                    <span className="text-gray-700">
                      {scheduleItem.startDate}
                      {scheduleItem.startDate !== scheduleItem.endDate &&
                        scheduleItem.endDate !== "Not Available " && (
                          <span className="ml-1">to {scheduleItem.endDate}</span>
                        )}
                      {scheduleItem.startDate === "Not Available " && (
                        <span className="ml-1 text-xs text-[#e63946]">(To be announced)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#e63946]" />
                    <span className="text-gray-700">{scheduleItem.location || "Location TBD"}</span>
                  </div>

                  {/* Add appointment availability info */}
                  {scheduleItem.allowAppointment && (
                    <div className="flex items-start gap-2 border-t border-gray-200 pt-2 mt-2">
                      <div className="bg-gray-100 p-1 rounded-full mt-0.5">
                        <Users size={14} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {scheduleItem.remainingSlots} of {scheduleItem.maxPeople} appointment
                          slots available
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{
                              width: `${
                                (scheduleItem.currentAppointments / scheduleItem.maxPeople) * 100
                              }%`,
                              backgroundColor:
                                scheduleItem.remainingSlots < 10 ? "#e63946" : "#22c55e",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <div className="bg-red-100 rounded-full p-1 mt-0.5">
                      <X size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Error</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment Request Form */}
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                {/* Name Field */}
                <FormField label="Full Name" required icon={User} error={errors.name}>
                  <input
                    {...register("name")}
                    className={getInputClasses(errors.name)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </FormField>

                {/* Email Field */}
                <FormField label="Email Address" required icon={Mail} error={errors.email}>
                  <input
                    {...register("email")}
                    type="email"
                    className={getInputClasses(errors.email)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </FormField>

                {/* Phone Field with Country Code */}
                <FormField label="Phone Number" required error={errors.phone || errors.countryCode}>
                  {/* Replace the existing phone field with this responsive version */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <div className="relative w-full sm:w-auto">
                      <select
                        {...register("countryCode")}
                        className="appearance-none bg-gray-50 border border-gray-300 rounded-md sm:rounded-r-none py-2 px-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5a0000]/30 w-full sm:w-[120px]"
                      >
                        <optgroup label="Popular Countries">
                          {COUNTRY_CODES.filter((c) => c.isPopular).map((country) => (
                            <option key={`${country.code}-${country.country}`} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="All Countries">
                          {COUNTRY_CODES.filter((c) => !c.isPopular).map((country) => (
                            <option key={`${country.code}-${country.country}`} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div className="relative flex-1 w-full">
                      <input
                        {...register("phone")}
                        type="tel"
                        className={`w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md sm:rounded-l-none focus:outline-none focus:ring-2 focus:ring-[#5a0000]/30 ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                        placeholder={getPhoneValidationInfo(watchedCountryCode).placeholder}
                        autoComplete="tel"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm sm:hidden">
                        {watchedCountryCode}
                      </span>
                    </div>
                  </div>
                </FormField>

                {/* Purpose Field */}
                <FormField
                  label="Purpose of Meeting"
                  required
                  icon={FileText}
                  error={errors.purpose}
                >
                  <select {...register("purpose")} className={getInputClasses(errors.purpose)}>
                    <option value="">Select purpose</option>
                    {PURPOSE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Preferred Time Field */}
                {scheduleItem?.period?.toLowerCase() === "whole day" ? (
                  <FormField label="Preferred Time" required icon={Calendar} error={errors.preferredTime}>
                    <div className="pl-10 pt-2 pb-1">
                      {["Morning", "Afternoon", "Evening"].map((timeSlot) => (
                        <div key={timeSlot} className="flex items-center mb-2">
                          <input
                            type="radio"
                            id={`time-${timeSlot.toLowerCase()}`}
                            value={timeSlot}
                            {...register("preferredTime")}
                            className="w-4 h-4 mr-2 text-[#5a0000] focus:ring-[#5a0000]"
                          />
                          <label
                            htmlFor={`time-${timeSlot.toLowerCase()}`}
                            className="text-sm text-gray-700"
                          >
                            {timeSlot}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormField>
                ) : (
                  <FormField label="Scheduled Time" icon={Calendar}>
                    <div className="pl-10 pr-3 py-2 text-gray-800">
                      {scheduleItem?.period ? (
                        <span className="font-medium">
                          {scheduleItem.period.charAt(0).toUpperCase() + scheduleItem.period.slice(1)}
                        </span>
                      ) : (
                        <span className="text-gray-500">Time not specified</span>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        This is the scheduled time for the event.
                      </p>
                    </div>
                  </FormField>
                )}
                {/* Number of People Field */}
                <FormField
                  label="Number of People"
                  required
                  icon={Users}
                  error={errors.numberOfPeople}
                >
                  <div className="flex items-center">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      {...register("numberOfPeople")}
                      className={getInputClasses(errors.numberOfPeople)}
                      placeholder="1"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      person{watch("numberOfPeople") > 1 ? "s" : ""}
                    </span>
                  </div>
                </FormField>

                {/* Names Field */}
                <FormField label="Names" required error={errors.name}>
                  <div className="pl-6 pt-2 pb-1">
                    {Array.from({ length: watch("numberOfPeople") || 0 }).map((_, i) => (
                      <div key={i} className="flex items-center mb-2">
                        <input
                          type="text"
                          {...register(`names.${i}`)}
                          className={getInputClasses(errors.name && errors.name[i])}
                          placeholder={`Name ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </FormField>

                {/* Additional Info Field */}
                <FormField
                  label="Additional Information"
                  icon={MessageSquare}
                  error={errors.additionalInfo}
                  helpText="Max 500 characters (Optional)"
                >
                  <textarea
                    {...register("additionalInfo")}
                    rows="3"
                    className={getInputClasses(errors.additionalInfo)}
                    placeholder="Provide any additional details about your request (optional)"
                    maxLength={500}
                  />
                </FormField>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#5a0000] hover:bg-[#8a0000] text-white py-3 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Submitting Request...
                      </>
                    ) : (
                      "Submit Appointment Request"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Field Component
function FormField({ label, required, icon: Icon, error, helpText, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        )}
        {children}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

// Utility function for input classes
function getInputClasses(error) {
  const baseClasses =
    "w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a0000]/30 transition-colors";
  return error ? `${baseClasses} border-red-500` : `${baseClasses} border-gray-300`;
}

// Main Schedule Component
export default function SchedulePage() {
  const { t } = useTranslation();
  const [activeMonth, setActiveMonth] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Format time slot helper with improved error handling
  const formatTimeSlot = useCallback((slot) => {
    let formattedStartDate = "Not Available";
    let formattedEndDate = "Not Available";
    let month = "Upcoming";
    let timeDisplay = "Not Available";

    try {
      if (slot.startDate) {
        const startDate = new Date(slot.startDate);

        if (isNaN(startDate.getTime())) {
          console.warn("Invalid start date:", slot.startDate);
        } else {
          formattedStartDate = startDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          month = startDate.toLocaleDateString("en-US", { month: "long" });

          const startTime = startDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });

          if (slot.endDate) {
            const endDate = new Date(slot.endDate);

            if (!isNaN(endDate.getTime())) {
              formattedEndDate = endDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              const endTime = endDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });

              timeDisplay = startTime !== endTime ? `${startTime} - ${endTime}` : startTime;
            }
          } else {
            formattedEndDate = formattedStartDate;
            timeDisplay = startTime;
          }

          if (slot.period) {
            const periodText = slot.period.charAt(0).toUpperCase() + slot.period.slice(1);
            timeDisplay = `${periodText} Session (${timeDisplay})`;
          }
        }
      } else if (slot.period) {
        const periodText = slot.period.charAt(0).toUpperCase() + slot.period.slice(1);
        timeDisplay = `${periodText} Session (Time details to be announced)`;
      }
    } catch (error) {
      console.error("Error formatting time slot:", slot, error);
    }

    return { formattedStartDate, formattedEndDate, month, timeDisplay };
  }, []);

  // Format schedule data with enhanced error handling
  const formatScheduleData = useCallback((data) => {
    if (!Array.isArray(data)) {
      console.warn("Invalid data format received:", data);
      return [];
    }

    return data.flatMap((item) => {
      try {
        // ✅ Allow "India", "USA", or undefined place
        if (item.place !== "India" && item.place !== "USA" && item.place !== undefined) {
          return [];
        }

        // Check if appointments can be requested based on appointment field
        const allowAppointment = Boolean(item.appointment);

        // Get appointment limit and current count for capacity tracking
        const maxPeople = item.maxPeople || 100; // Default to 100 if not specified
        const currentAppointments = item.currentAppointments || 0;
        const isAtCapacity = currentAppointments >= maxPeople;
        const remainingSlots = Math.max(0, maxPeople - currentAppointments);

        // Handle empty or undefined timeSlots
        if (!item.timeSlots || item.timeSlots.length === 0) {
          return [
            {
              id: item._id || `default-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              startDate: "Not Available",
              endDate: "Not Available",
              time: "Not Available",
              location: item.locations || "Not Available",
              city: "",
              note: `Details will be announced for ${item.locations || "this event"}`,
              details: "Details will be announced soon.",
              month: "Upcoming",
              allowAppointment: allowAppointment,
              isHighlighted: false,
              // Add capacity information
              maxPeople: maxPeople,
              currentAppointments: currentAppointments,
              isAtCapacity: isAtCapacity,
              remainingSlots: remainingSlots,
            },
          ];
        }

        // Map each time slot to an event
        return item.timeSlots.map((slot) => {
          const { formattedStartDate, formattedEndDate, month, timeDisplay } = formatTimeSlot(slot);

          return {
            id: slot._id || `slot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            time: timeDisplay,
            rawStartDate: slot.startDate,
            rawEndDate: slot.endDate,
            location: item.locations || "Location TBD",
            city: "",
            note: slot.period
              ? `${slot.period.charAt(0).toUpperCase() + slot.period.slice(1)} session at ${
                  item.locations || "Location TBD"
                }`
              : `Session at ${item.locations || "Location TBD"}`,
            details: `Join us at ${item.locations || "Location TBD"}.`,
            month,
            period: slot.period,
            isHighlighted: false,
            allowAppointment: allowAppointment,
            // Add capacity information
            maxPeople: maxPeople,
            currentAppointments: currentAppointments,
            isAtCapacity: isAtCapacity,
            remainingSlots: remainingSlots,
          };
        });
      } catch (error) {
        console.error("Error formatting schedule item:", item, error);
        return [];
      }
    });
  }, [formatTimeSlot]); // Add formatTimeSlot as dependency

  // Fetch schedule data with retry logic
  const fetchSchedule = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(import.meta.env.VITE_APP_SCHEDULE_API, {
          timeout: 30000, // 30 second timeout
        });

        console.log(response)

        if (response.data && response.data.data) {
          const formattedSchedule = formatScheduleData(response.data.data);
          setScheduleItems(formattedSchedule);
        } else {
          throw new Error("Invalid response format");
        }

        setLoading(false);
        setTimeout(() => setIsLoaded(true), 100);
      } catch (err) {
        console.error("Failed to fetch schedule:", err);

        if (retryCount < maxRetries) {
          console.log(`Retrying... Attempt ${retryCount + 1} of ${maxRetries}`);
          setTimeout(() => fetchSchedule(retryCount + 1), 2000 * (retryCount + 1));
          return;
        }

        let errorMessage = "Failed to load schedule. Please try again later.";

        if (err.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection.";
        } else if (err.response?.status >= 500) {
          errorMessage = "Server error. Please try again in a few minutes.";
        }

        setError(errorMessage);
        setLoading(false);
      }
    },
    [formatScheduleData] // Now formatScheduleData is defined above
  );

  // Initial data fetch
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Memoized months calculation - only show current and future months
  const months = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of today for date-only comparison

    // Get months from items that are in the present or future
    const futureMonths = scheduleItems
      .filter((item) => {
        if (item.rawStartDate) {
          const eventDate = new Date(item.rawStartDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        }
        // Keep items without a specific date (e.g., "Upcoming")
        return true;
      })
      .map((item) => item.month);

    const uniqueMonths = [...new Set(futureMonths)];

    // Sort months chronologically
    return uniqueMonths.sort((a, b) => {
      if (a === "Upcoming") return -1; // "Upcoming" comes first
      if (b === "Upcoming") return 1;

      const monthOrder = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });
  }, [scheduleItems]);

  // Memoized filtered items - exclude past months from "All" view
  const filteredItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of today for date-only comparison

    // First filter out past events
    const currentAndFutureItems = scheduleItems.filter((item) => {
      if (item.rawStartDate) {
        const eventDate = new Date(item.rawStartDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      }
      // Keep items without a specific date (e.g., "Upcoming")
      return true;
    });

    // Then apply month and search filters
    return currentAndFutureItems.filter((item) => {
      const monthMatch = activeMonth === "All" || item.month === activeMonth;
      const searchMatch =
        searchQuery === "" ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.note?.toLowerCase().includes(searchQuery.toLowerCase());

      return monthMatch && searchMatch;
    });
  }, [scheduleItems, activeMonth, searchQuery]);

  // Calculate current and future events count for display
  const currentAndFutureEventsCount = useMemo(() => {
    return filteredItems.length;
  }, [scheduleItems]);

  // Update the useEffect to set activeMonth to current month
  useEffect(() => {
    const currentMonth = new Date().toLocaleDateString("en-US", { month: "long" });
    if (months.includes(currentMonth)) {
      setActiveMonth(currentMonth);
    } else if (months.length > 0) {
      setActiveMonth(months[0]); // Fallback to the first available month
    }
  }, []);

  // Event handlers
  const handleRequestAppointment = useCallback((item) => {
    setSelectedItem(item);
    setAppointmentModalOpen(true);
  }, []);

  const handleAppointmentSubmit = useCallback((appointmentData) => {
    console.log("Appointment submitted:", appointmentData);

    // Update the local state to reflect the new appointment count
    setScheduleItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === appointmentData.requestedSchedule.scheduleId) {
          const updatedCurrentAppointments = item.currentAppointments + 1;
          const updatedRemainingSlots = Math.max(0, item.maxPeople - updatedCurrentAppointments);

          return {
            ...item,
            currentAppointments: updatedCurrentAppointments,
            remainingSlots: updatedRemainingSlots,
            isAtCapacity: updatedCurrentAppointments >= item.maxPeople,
          };
        }
        return item;
      })
    );
  }, []);

  const handleCloseModal = useCallback(() => {
    setAppointmentModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleRetry = useCallback(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Loading State Component
  function LoadingState() {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 mb-4">
          <div className="w-full h-full border-4 border-gray-200 border-t-[#e63946] rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading schedule...</p>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we fetch the latest information
        </p>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-gradient-to-br from-[#fcf5eb] to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#5a0000] to-[#8a0000] text-white md:h-[400px] py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-5"></div>
        <div className="max-w-6xl mt-20 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#ffd700]">
                {t("hero.title")}
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold mb-4">{t("hero.subtitle")}</h2>
              <p className="text-lg opacity-90 max-w-2xl">
                {t("navLinks.schedule")} {t("common.of")} {t("hero.title")}
              </p>
            </div>
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#ffd700] shadow-xl">
                <img
                  src="/assets/swamiji-blue-bg.jpg"
                  alt={t("hero.title")}
                  className="w-full h-full object-top object-center object-cover"
                  loading="lazy"
                  style={{ objectPosition: "center 20%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#e63946] to-[#d62c39] text-white p-6 flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold mb-4 md:mb-0">
              Schedule: {new Date().getFullYear()}
            </h2>
            {!loading && !error && scheduleItems.length > 0 && (
              <div className="text-sm opacity-75">
                {filteredItems.length} of {currentAndFutureEventsCount} events
              </div>
            )}
          </div>

          {/* Show filters only when data is loaded */}
          {!loading && !error && scheduleItems.length > 0 && (
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                  <button
                    onClick={() => setActiveMonth("All")}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      activeMonth === "All"
                        ? "bg-[#5a0000] text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    All Events ({currentAndFutureEventsCount})
                  </button>
                  {months.map((month) => {
                    const monthCount = filteredItems.filter(
                      (item) => item.month === month
                    ).length;
                    return (
                      <button
                        key={month}
                        onClick={() => setActiveMonth(month)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          activeMonth === month
                            ? "bg-[#5a0000] text-white"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {month} ({monthCount})
                      </button>
                    );
                  })}
                </div>
                <div className="relative w-full md:w-64">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by location..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#5a0000]/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schedule List */}
          <div className="divide-y divide-gray-100">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onRetry={handleRetry} />
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <ScheduleItem
                  key={item.id}
                  item={item}
                  index={index}
                  isLoaded={isLoaded}
                  onRequestAppointment={handleRequestAppointment}
                />
              ))
            ) : (
              <EmptyState searchQuery={searchQuery} activeMonth={activeMonth} />
            )}
          </div>
        </div>
      </div>

      {/* Appointment Request Modal */}
      {appointmentModalOpen && selectedItem && (
        <AppointmentRequestModal
          isOpen={appointmentModalOpen}
          onClose={handleCloseModal}
          scheduleItem={selectedItem}
          onSubmit={handleAppointmentSubmit}
        />
      )}
    </div>
  );
}

// Supporting Components
function ErrorState({ error, onRetry }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Schedule</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-[#5a0000] hover:bg-[#8a0000] text-white px-4 py-2 rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ searchQuery, activeMonth }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No Events Found</h3>
      <p className="text-gray-500">
        {searchQuery
          ? `No events found matching "${searchQuery}". Try a different search term.`
          : `No events scheduled for ${activeMonth === "All" ? "this period" : activeMonth}.`}
      </p>
    </div>
  );
}

function ScheduleItem({ item, index, isLoaded, onRequestAppointment }) {
  return (
    <div
      className={`p-6 hover:bg-gray-50 transition-all duration-300 ${
        item.isHighlighted ? "border-l-4 border-[#e63946] bg-red-50" : ""
      }`}
      style={{
        animationDelay: `${index * 100}ms`,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 500ms ${index * 50}ms, transform 500ms ${index * 50}ms`,
      }}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Date Column */}
        <div className="md:w-1/4">
          <div className="flex items-start gap-3">
            <Calendar className="text-[#e63946] mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-gray-900">{item.startDate}</p>
              {item.startDate !== item.endDate && item.endDate !== "Not Available" && (
                <p className="text-gray-600 text-sm">to {item.endDate}</p>
              )}
              {item.startDate === "Not Available" && (
                <p className="text-[#e63946] text-xs">(To be announced)</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Column */}
        <div className="md:w-2/4">
          <div className="flex items-start gap-3">
            <MapPin className="text-[#e63946] mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-gray-900">{item.location}</p>
              {item.city && <p className="text-gray-600 text-sm">{item.city}</p>}
              {item.note && <p className="text-gray-500 text-xs mt-1">{item.note}</p>}

              {/* Show appointment capacity info when appointments are allowed */}
              {item.allowAppointment && (
                <p className="text-xs mt-1">
                  {item.isAtCapacity ? (
                    <span className="text-red-600 font-medium">Appointments full</span>
                  ) : (
                    <span className="text-green-600">
                      {item.remainingSlots}{" "}
                      {item.remainingSlots === 1 ? "appointment" : "appointments"} available
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Column - Show button only if allowAppointment is true AND not at capacity */}
        <div className="md:w-1/4 flex md:justify-end items-start">
          {item.allowAppointment ? (
            item.isAtCapacity ? (
              <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm flex items-center">
                <span>No appointments available</span>
              </div>
            ) : (
              <button
                onClick={() => onRequestAppointment(item)}
                className="flex items-center gap-2 bg-[#5a0000] hover:bg-[#8a0000] text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-md"
              >
                <span>Request Appointment</span>
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
