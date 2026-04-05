import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Define validation schema with Yup
const schema = yup
  .object({
    username: yup
      .string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters"),
    email: yup.string().required("Email is required").email("Must be a valid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must include uppercase, lowercase, number and special character"
      ),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
  })
  .required();

export default function UserRegister() {
  const navigate = useNavigate();
  const { registerUser, loading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    trigger,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const password = watch("password");
  const confirmPasswordState = watch("confirmPassword");
  const { isDirty } = useFormState({ control, name: "confirmPassword" });

  useEffect(() => {
    if (isDirty) {
      trigger("confirmPassword");
    }
  }, [password, confirmPasswordState, trigger, isDirty]);

  const onSubmit = async (data) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      reset();
      navigate("/profile", { replace: true });
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const navigateToLogin = () => navigate("/login");

  return (
    <div className="min-h-screen mt-16 bg-[#fcf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif text-[#5D4037]">Create your account</h2>
        <p className="mt-2 text-center text-sm text-[#5D4037]/70">
          Fill in your details to register
        </p>
        <div className="mt-4 flex justify-center">
          <div className="h-0.5 w-20 bg-[#B82A1E]/70"></div>
          <div className="h-0.5 w-12 bg-[#B82A1E]/50 mx-1"></div>
          <div className="h-0.5 w-6 bg-[#B82A1E]/30"></div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B82A1E]/5 rounded-full -translate-y-12 translate-x-12 -z-0"></div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#5D4037]">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  {...register("username")}
                  type="text"
                  autoComplete="username"
                  className={`block w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="mt-1 text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#5D4037]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className={`block w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                    errors.email ? "border-red-500" : "border-gray-300"
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
              <label htmlFor="password" className="block text-sm font-medium text-[#5D4037]">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`block w-full px-4 py-3 pr-10 border rounded-lg transition-colors focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#5D4037]">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`block w-full px-4 py-3 pr-10 border rounded-lg transition-colors focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#B82A1E] hover:bg-[#9a231a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B82A1E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-[#5D4037]/80">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={navigateToLogin}
                  className="font-medium text-[#B82A1E] hover:text-[#9a231a] transition-colors focus:outline-none"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-[#B82A1E]/10 text-6xl font-serif z-10">ॐ</div>
    </div>
  );
}
