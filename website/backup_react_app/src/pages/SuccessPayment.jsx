// src/pages/SuccessPayment.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle, AlertTriangle, Loader2, Home } from "lucide-react";

function SuccessPayment() {
  const [searchParams] = useSearchParams();
  const razorpay_order_id = searchParams.get("razorpay_order_id");
  const razorpay_payment_id = searchParams.get("razorpay_payment_id");
  const razorpay_signature = searchParams.get("razorpay_signature");

  const [status, setStatus] = useState("loading");
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyPayment() {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_RAZOR_DONATE_API_URL}/verify-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          }),
        });

        console.log("verifyRe new  s", res);

        const data = await res.json();

        if (res.ok && data.status === "success") {
          setStatus("success");
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    }

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      verifyPayment();
    } else {
      setStatus("invalid");
    }
  }, [razorpay_order_id, razorpay_payment_id, razorpay_signature]);

  // Countdown for redirect after success
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const handleGoHome = () => navigate("/");

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
            <CardTitle className="text-xl">Verifying Payment</CardTitle>
            <CardDescription>Please wait while we confirm your payment...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                />
              </div>
              <p className="text-sm text-gray-600">This may take a few moments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">🎉 Thank you for your donation!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-600">Your payment has been processed successfully.</p>
              <p className="text-sm text-gray-500">
                You will be redirected to the homepage in{" "}
                <span className="font-semibold text-blue-600">{countdown}</span> seconds
              </p>
            </div>
            <div className="space-y-3 flex flex-col items-center justify-center">
              <Button
                onClick={handleGoHome}
                className="bg-gradient-to-r mx-auto w-full from-[#B82A1E] to-[#8a1f16] hover:from-[#8a1f16] hover:to-[#7B0000] text-white"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((60 - countdown) / 60) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "invalid" || status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Payment Issue</CardTitle>
            <CardDescription className="text-lg">⚠️ Could not verify your payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                We couldn't verify your payment session. This might be due to:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• Expired payment session</li>
                <li>• Invalid payment link</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button onClick={handleGoHome} className="w-full" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default SuccessPayment;
