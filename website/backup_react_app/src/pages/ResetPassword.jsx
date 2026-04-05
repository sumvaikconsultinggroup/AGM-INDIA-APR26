import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

// ✅ Yup schema
const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  // Redirect if no email in state
  useState(() => {
    if (!email) {
      toast.error("Email not found. Please restart the password reset process.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const onSubmit = async (data) => {
    if (!email) return toast.error("Email not found. Please try again.");

    try {
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/user/reset-password`, {
        email,
        newPassword: data.newPassword,
      });
      toast.success("Password reset successfully");
      navigate("/login", { state: { resetSuccess: true } });
    } catch (error) {
      const message = error.response?.data?.message || "Reset failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen mt-16 bg-[#fcf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif text-[#5D4037]">
          Reset Password
        </h2>
        <div className="mt-4 flex justify-center">
          <div className="h-0.5 w-20 bg-[#B82A1E]/70"></div>
          <div className="h-0.5 w-12 bg-[#B82A1E]/50 mx-1"></div>
          <div className="h-0.5 w-6 bg-[#B82A1E]/30"></div>
        </div>
        <p className="mt-4 text-center text-sm text-[#5D4037]/80">
          Create a new password for <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B82A1E]/5 rounded-full -translate-y-12 translate-x-12 -z-0"></div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#5D4037]">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  className={`block w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-[#5D4037] transition-colors"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex="-1"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#5D4037]">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  className={`block w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-[#5D4037] transition-colors"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex="-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password requirements hint */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-[#5D4037]/70 font-medium">Password requirements:</p>
              <ul className="mt-1 text-xs text-[#5D4037]/70 space-y-1 pl-4">
                <li>At least 8 characters long</li>
                <li>Both passwords must match</li>
              </ul>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#B82A1E] hover:bg-[#9a231a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B82A1E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-[#B82A1E] hover:text-[#9a231a] transition-colors focus:outline-none"
          >
            Back to login
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-[#B82A1E]/10 text-6xl font-serif z-10">ॐ</div>
    </div>
  );
}
