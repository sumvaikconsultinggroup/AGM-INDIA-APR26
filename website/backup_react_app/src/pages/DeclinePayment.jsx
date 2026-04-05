import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertTriangle, Loader2, Home } from "lucide-react";

function DeclinePayment() {
  const [searchParams] = useSearchParams();
  const razorpay_order_id = searchParams.get("razorpay_order_id");
  const razorpay_payment_id = searchParams.get("razorpay_payment_id");
  const razorpay_signature = searchParams.get("razorpay_signature");

  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyFailure() {
      // If we got an order_id but no payment_id, we assume user canceled payment
      if (razorpay_order_id && !razorpay_payment_id) {
        setStatus("canceled");
      } else if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        // There is a payment but maybe verification failed — treat as invalid/failure
        setStatus("invalid");
      } else {
        setStatus("invalid");
      }
    }

    verifyFailure();
  }, [razorpay_order_id, razorpay_payment_id, razorpay_signature]);

  const handleGoHome = () => navigate("/");

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
            <CardTitle className="text-xl">Checking Payment</CardTitle>
            <CardDescription>Please wait while we check your payment status...</CardDescription>
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

  if (status === "canceled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-yellow-800">Payment Canceled</CardTitle>
            <CardDescription className="text-lg">😔 You canceled your payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-gray-600 space-y-2">
              <p>If this was unintentional, you can try again using the payment link.</p>
            </div>
            <div className="space-y-3 flex flex-col items-center justify-center">
              <Button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r mx-auto from-[#B82A1E] to-[#8a1f16] hover:from-[#8a1f16] hover:to-[#7B0000] text-white"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4 " />
                Go to Homepage
              </Button>
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
            <CardTitle className="text-2xl text-red-800">Payment Failed</CardTitle>
            <CardDescription className="text-lg">
              ⚠️ Your payment could not be processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-gray-600 space-y-2">
              <p>We couldn’t verify your payment. This might be due to:</p>
              <ul className="text-sm text-gray-500 space-y-1 text-left list-disc list-inside">
                <li>Payment failure from bank</li>
                <li>Timeout or network error</li>
                <li>Insufficient funds</li>
              </ul>
            </div>
            <div className="space-y-3 flex flex-col items-center justify-center">
              <Button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r mx-auto from-[#B82A1E] to-[#8a1f16] hover:from-[#8a1f16] hover:to-[#7B0000] text-white"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4 " />
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

export default DeclinePayment;
