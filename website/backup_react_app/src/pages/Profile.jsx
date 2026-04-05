import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { AlertCircle, Trash2, Edit, Save, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  // Simple Yup validation schema
  const validationSchema = Yup.object().shape({
    // Personal details
    fullName: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),

    age: Yup.number()
      .typeError("Age must be a number")
      .required("Age is required")
      .positive("Age must be positive")
      .integer("Age must be a whole number")
      .min(1, "Age must be at least 1")
      .max(120, "Age must be less than 120"),

    contact: Yup.string()
      .required("Contact number is required")
      .matches(/^[0-9]{10}$/, "Must be exactly 10 digits"),

    // Address and optional fields
    address: Yup.string()
      .required("Address is required")
      .min(5, "Address must be at least 5 characters"),

    wishes: Yup.string()
      .required("Please share your wishes")
      .min(5, "Please write at least 5 characters"),

    personalStory: Yup.string(),

    dikshaPlace: Yup.string(),

    // Dates and status
    maritalStatus: Yup.string()
      .required("Please select your marital status")
      .oneOf(["Married", "Unmarried"], "Please select a valid option"),

    dob: Yup.date()
      .transform((value, originalValue) => (originalValue === "" ? null : value))
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),

    anniversary: Yup.date()
      .transform((value, originalValue) => (originalValue === "" ? null : value))
      .when("maritalStatus", {
        is: "Married",
        then: (schema) =>
          schema
            .required("Anniversary date is required")
            .max(new Date(), "Anniversary date cannot be in the future"),
      }),
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [profileId, setProfileId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      maritalStatus: "",
    },
  });

  const maritalStatus = watch("maritalStatus");

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_GET_USER_API}/${user.id}`);

      // Check if user has profile data
      if (response.data && response.data.profile) {
        setProfileExists(true);

        // Set form values from nested profile data
        const profileData = response.data.profile;

        // Map schema field names to form fields
        if (profileData.fullName) setValue("fullName", profileData.fullName);
        if (profileData.age) setValue("age", profileData.age);
        if (profileData.contact) setValue("contact", profileData.contact);
        if (profileData.address) setValue("address", profileData.address);
        if (profileData.wishes) setValue("wishes", profileData.wishes);
        if (profileData.personalStory) setValue("personalStory", profileData.personalStory);
        if (profileData.dikshaPlace) setValue("dikshaPlace", profileData.dikshaPlace);
        if (profileData.maritalStatus) setValue("maritalStatus", profileData.maritalStatus);

        // Handle date fields
        if (profileData.dob) {
          setValue("dob", new Date(profileData.dob).toISOString().split("T")[0]);
        }

        if (profileData.maritalStatus === "Married" && profileData.anniversary) {
          setValue("anniversary", new Date(profileData.anniversary).toISOString().split("T")[0]);
        }

        // Set profile image if exists
        if (profileData.profileImage) {
          setPreview(profileData.profileImage);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // If 404, profile doesn't exist yet - that's okay
      if (error.response && error.response.status !== 404) {
        alert("Error loading profile data. Please try again later.");
      }
    } finally {
      setIsLoading(false);
      // If no profile exists, enable editing mode
      if (!profileExists) {
        setIsEditing(true);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Check if profile image exists
      if (!preview) {
        alert("Profile image is required");
        setIsSaving(false);
        return;
      }

      // Create profile data object with exact field names from the ProfileSchema
      const profileData = {
        profileImage: preview,
        fullName: data.fullName,
        age: Number(data.age), // Ensure it's sent as a number
        contact: data.contact,
        address: data.address,
        wishes: data.wishes,
        personalStory: data.personalStory || "",
        dikshaPlace: data.dikshaPlace || "",
        maritalStatus: data.maritalStatus,
        dob: data.dob,
      };

      // Only include anniversary if user is married
      if (data.maritalStatus === "Married" && data.anniversary) {
        profileData.anniversary = data.anniversary;
      }

      let response;

      // Use POST for both creating and updating profile
      // Your backend controller already handles both cases
      response = await axios.post(
        `${import.meta.env.VITE_APP_POST_USER_API}/${user.id}`,
        profileData
      );

      setProfileExists(true);
      setSaveSuccess(true);

      // Exit edit mode after successful save
      setIsEditing(false);

      // Refresh the user profile data
      await fetchUserProfile();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);

      // Display specific validation errors from the backend if available
      if (error.response && error.response.data && error.response.data.errors) {
        alert(`Failed to save profile: ${error.response.data.errors.join(", ")}`);
      } else if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to save profile: ${error.response.data.message}`);
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setPreview(imageData);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfileImage = async () => {
    setPreview(null);
    setProfileImage(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!profileExists) {
      reset();
      setPreview(null);
    } else {
      fetchUserProfile();
      setIsEditing(false);
    }
  };

  const RequiredIndicator = () => (
    <span className="text-[#B82A1E] ml-1" aria-label="required">
      *
    </span>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-10 w-10 text-[#B82A1E] mx-auto mb-4" />
          <p className="text-[#5D4037]">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        id="aboutTop"
        className="relative h-[60vh] overflow-hidden flex items-center justify-center"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />

        {/* Red Overlay - Semi-transparent */}
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Your Profile</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            Manage your profile information and settings.
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>

        {/* Decorative Om Symbol */}
        <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 bg-[#fcf9f5]">
        <div className="container mx-auto  pb-16">
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Form Section */}
          <div className="bg-white rounded-xl shadow-md p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B82A1E]/5 rounded-full -translate-y-12 translate-x-12 -z-0"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-[#5D4037]">Personal Information</h2>
                {profileExists && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded-lg bg-[#B82A1E]/10 text-[#B82A1E] hover:bg-[#B82A1E]/20 transition-colors flex items-center gap-2"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                )}
                {profileExists && !isEditing && (
                  <div className="text-sm text-[#5D4037]/60">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    Profile Picture <RequiredIndicator />
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-[#B82A1E]/10 flex items-center justify-center overflow-hidden relative group">
                      {preview ? (
                        <>
                          <img
                            src={preview}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={handleDeleteProfileImage}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full"
                              aria-label="Delete profile picture"
                            >
                              <Trash2 size={24} className="text-white" />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-3xl text-[#B82A1E]">U</span>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="block w-full text-sm text-[#5D4037]/80
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#B82A1E]/10 file:text-[#B82A1E]
                        hover:file:bg-[#B82A1E]/20"
                        />
                        {preview && (
                          <p className="text-xs text-[#5D4037]/70 mt-1">
                            Hover over image to delete
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 text-[#5D4037]/80">
                        {preview ? "Profile picture set" : "No profile picture set"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-1">
                      Full Name <RequiredIndicator />
                    </label>
                    <input
                      type="text"
                      {...register("fullName")}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!isEditing}
                    />
                    {errors.fullName && isEditing && (
                      <p className="text-red-500 text-sm flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-1">
                      Age <RequiredIndicator />
                    </label>
                    <input
                      type="number"
                      {...register("age")}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                        errors.age ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!isEditing}
                    />
                    {errors.age && isEditing && (
                      <p className="text-red-500 text-sm flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-1">
                      Contact Number <RequiredIndicator />
                    </label>
                    <input
                      type="tel"
                      {...register("contact")}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                        errors.contact ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!isEditing}
                    />
                    {errors.contact && isEditing && (
                      <p className="text-red-500 text-sm flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.contact.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-1">
                      Diksha Place
                    </label>
                    <input
                      type="text"
                      {...register("dikshaPlace")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E]"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-1">
                    Address <RequiredIndicator />
                  </label>
                  <textarea
                    rows="3"
                    {...register("address")}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!isEditing}
                  ></textarea>
                  {errors.address && isEditing && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Personal Wishes */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-1">
                    Personal Wishes <RequiredIndicator />
                  </label>
                  <textarea
                    rows="3"
                    {...register("wishes")}
                    placeholder="Share your wishes and aspirations..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                      errors.wishes ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!isEditing}
                  ></textarea>
                  {errors.wishes && isEditing && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.wishes.message}
                    </p>
                  )}
                </div>

                {/* Personal Story */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-1">
                    Personal Story
                  </label>
                  <textarea
                    rows="5"
                    {...register("personalStory")}
                    placeholder="Share your personal journey..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E]"
                    disabled={!isEditing}
                  ></textarea>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-1">
                    Marital Status <RequiredIndicator />
                  </label>
                  <select
                    {...register("maritalStatus")}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                      errors.maritalStatus ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!isEditing}
                  >
                    <option value="">Select</option>
                    <option value="Unmarried">Unmarried</option>
                    <option value="Married">Married</option>
                  </select>
                  {errors.maritalStatus && isEditing && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.maritalStatus.message}
                    </p>
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-1">
                    Date of Birth <RequiredIndicator />
                  </label>
                  <input
                    type="date"
                    {...register("dob", { valueAsDate: true })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                      errors.dob ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!isEditing}
                  />
                  {errors.dob && isEditing && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dob.message}
                    </p>
                  )}
                </div>

                {maritalStatus === "Married" && (
                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-1">
                      Anniversary <RequiredIndicator />
                    </label>
                    <input
                      type="date"
                      {...register("anniversary", { valueAsDate: true })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                        errors.anniversary ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!isEditing}
                    />
                    {errors.anniversary && isEditing && (
                      <p className="text-red-500 text-sm flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.anniversary.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Swamiji Images - Only show in edit mode */}
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-2">
                      Manage Your Gallery
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/image-library")}
                      className="w-full px-4 py-3 bg-[#B82A1E]/10 text-[#B82A1E] rounded-lg font-semibold hover:bg-[#B82A1E]/20 transition-colors"
                    >
                      Go to Image Library
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      You can upload, view, and manage your photos in the Image Library.
                    </p>
                  </div>
                )}

                {/* Form actions */}
                {isEditing && (
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 rounded-lg border border-gray-300 text-[#5D4037] hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isSaving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#B82A1E] hover:bg-[#9a231a]"
                      } text-white`}
                    >
                      {isSaving ? (
                        <>
                          <Loader className="animate-spin h-4 w-4" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>{profileExists ? "Update Profile" : "Save Profile"}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {saveSuccess && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Profile {profileExists ? "updated" : "saved"} successfully!
                  </div>
                )}
              </form>
            </div>

            <div className="absolute bottom-4 right-4 text-[#B82A1E]/10 text-6xl font-serif z-0">
              ॐ
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
