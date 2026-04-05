import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AlertCircle } from "lucide-react";

const schema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/user/generate-otp`, { email: data.email });
      toast.success("OTP sent to your email");
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-16 bg-[#fcf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif text-[#5D4037]">
          Reset your password
        </h2>
        <div className="mt-4 flex justify-center">
          <div className="h-0.5 w-20 bg-[#B82A1E]/70"></div>
          <div className="h-0.5 w-12 bg-[#B82A1E]/50 mx-1"></div>
          <div className="h-0.5 w-6 bg-[#B82A1E]/30"></div>
        </div>
        <p className="mt-4 text-center text-sm text-[#5D4037]/80">
          Enter your email address and we'll send you an OTP to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B82A1E]/5 rounded-full -translate-y-12 translate-x-12 -z-0"></div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#5D4037]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className={`block w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#B82A1E] hover:bg-[#9a231a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B82A1E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-[#B82A1E] hover:text-[#9a231a] transition-colors focus:outline-none"
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-[#B82A1E]/10 text-6xl font-serif z-10">ॐ</div>
    </div>
  );
}