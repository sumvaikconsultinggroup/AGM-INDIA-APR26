import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const location = useLocation();
  const email = location.state?.email;
  const [resending, setResending] = useState(false);

  // Add timer for resend button
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("No email provided");
      navigate("/forgot-password");
      return;
    }

    // Start timer for resend button
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      otp0: "",
      otp1: "",
      otp2: "",
      otp3: "",
      otp4: "",
      otp5: "",
    },
  });

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    setValue(`otp${index}`, value);
    trigger(`otp${index}`);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    const key = e.key;
    const currentValue = getValues(`otp${index}`);
    if (key === "Backspace" && !currentValue && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data) => {
    const code = Object.values(data).join("");
    if (code.length !== 6) return toast.error("Please enter a 6-digit OTP");

    try {
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/user/verify-otp`, { otp: code, email });
      toast.success("OTP verified successfully");
      navigate("/reset-password", { state: { email: email } });
    } catch (error) {
      const message = error.response?.data?.message || "OTP verification failed";
      toast.error(message);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/resend-otp`, { email });
      toast.success("OTP resent successfully");
      setCanResend(false);
      setTimer(30);

      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen mt-16 bg-[#fcf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif text-[#5D4037]">
          Verify OTP
        </h2>
        <div className="mt-4 flex justify-center">
          <div className="h-0.5 w-20 bg-[#B82A1E]/70"></div>
          <div className="h-0.5 w-12 bg-[#B82A1E]/50 mx-1"></div>
          <div className="h-0.5 w-6 bg-[#B82A1E]/30"></div>
        </div>
        <p className="mt-4 text-center text-sm text-[#5D4037]/80">
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B82A1E]/5 rounded-full -translate-y-12 translate-x-12 -z-0"></div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div className="flex justify-between gap-2">
              {[...Array(6)].map((_, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  autoComplete="off"
                  className={`w-12 h-12 text-center border rounded-md shadow-sm focus:outline-none focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] text-xl transition-all ${
                    errors[`otp${idx}`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register(`otp${idx}`, {
                    required: "Required",
                    pattern: {
                      value: /^[0-9]$/,
                      message: "Must be a digit",
                    },
                  })}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  ref={(el) => (inputsRef.current[idx] = el)}
                />
              ))}
            </div>

            {Object.values(errors).length > 0 && (
              <p className="text-sm text-red-500 text-center flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Please fill all boxes with valid digits
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#B82A1E] hover:bg-[#9a231a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B82A1E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resending}
                className={`text-sm font-medium transition-colors focus:outline-none ${
                  !canResend
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#B82A1E] hover:text-[#9a231a]'
                }`}
              >
                {resending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Resending...
                  </span>
                ) : !canResend ? (
                  `Resend code in ${timer}s`
                ) : (
                  "Resend code"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm font-medium text-[#B82A1E] hover:text-[#9a231a] transition-colors focus:outline-none"
          >
            Back to password reset
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-[#B82A1E]/10 text-6xl font-serif z-10">ॐ</div>
    </div>
  );
}
