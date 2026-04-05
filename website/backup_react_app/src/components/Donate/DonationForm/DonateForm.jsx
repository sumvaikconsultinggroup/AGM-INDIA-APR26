import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Users, Calendar, Heart, AlertCircle, Loader, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Add translation hook

const DonationForm = ({ campaignId: propCampaignId }) => {
  const { t } = useTranslation(); // Add translation hook
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryParamCampaignId = queryParams.get("campaignId");
  const campaignId = propCampaignId || queryParamCampaignId;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitType, setSubmitType] = useState("donate"); // "donate" or "subscribe"
  const [citizenStatus, setCitizenStatus] = useState("unselected"); // 'unselected', 'indian', 'foreign'
  const [selectedCitizenOption, setSelectedCitizenOption] = useState("indian");

      useEffect(() => {
          // Scroll to the top of the page when the component mounts
          window.scrollTo(0, 0);
      }, []);

  const [campaignDetails, setCampaignDetails] = useState({
    id: "",
    title: t("donateForm.loading"),
    description: "",
    additionalText: "",
    achieved: 0,
    goal: 0,
    donors: 0,
    daysLeft: 0,
    backgroundImage: "/placeholder.svg?height=400&width=600",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      fullName: "",
      mobile: "",
      email: "",
      address: "",
      termsAccepted: false,
    },
  });

  const watchAmount = watch("amount");

  const presetAmounts = [5000, 10000, 50000];

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use the same API endpoint as the FundraisingSection
        const response = await axios.get(
          `${import.meta.env.VITE_APP_DONATE_API_URL}/${campaignId}`
        );

        if (response.data && response.data.success && response.data.data) {
          const campaign = response.data.data;

          // Calculate days left based on totalDays and createdAt
          const createdDate = new Date(campaign.createdAt);
          const currentDate = new Date();
          const daysPassed = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, campaign.totalDays - daysPassed);

          setCampaignDetails({
            id: campaign._id,
            title: campaign.title || t("donateForm.unnamedCampaign"),
            description: campaign.description || "",
            additionalText: campaign.additionalText || "",
            achieved: campaign.achieved || 0,
            goal: campaign.goal || 0,
            donors: campaign.donors || 0,
            daysLeft: daysLeft,
            backgroundImage: campaign.backgroundImage || "/placeholder.svg?height=400&width=600",
            bulletPoints: campaign.bulletPoints || [],
          });
        } else {
          throw new Error("Invalid campaign data received");
        }
      } catch (err) {
        console.error("Failed to fetch campaign details:", err);
        const errorMessage =
          axios.isAxiosError && axios.isAxiosError(err)
            ? `${t("donateForm.error.failedToLoad")}: ${err.response?.status || ""} ${err.message}`
            : t("donateForm.error.failedToLoadDetails");
        setError(errorMessage);

        // Fallback to default data
        setCampaignDetails({
          id: "default",
          title: t("donateForm.defaultCampaign.title"),
          description: t("donateForm.defaultCampaign.description"),
          additionalText: "",
          achieved: 2861796,
          goal: 20000000,
          donors: 324,
          daysLeft: 25,
          backgroundImage: "/placeholder.svg?height=400&width=600",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [campaignId, t]); // Add t to dependencies

  const onSubmit = async (data) => {
    try {
      const donationData = {
        ...data,
        campaignId: campaignDetails.id,
        amount: Number(data.amount),
        termsAccepted: Boolean(data.termsAccepted),
      };

      delete donationData.presetAmount;

      // 1️⃣ Call backend to create Razorpay order
      const response = await axios.post(
        `${import.meta.env.VITE_APP_RAZOR_DONATE_API_URL}/create-checkout-session`,
        donationData
      );

      if (!response.data?.orderId) {
        throw new Error("Failed to create Razorpay order");
      }

      // 2️⃣ Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        amount: donationData.amount * 100,
        currency: "INR",
        name: "SwamiG Mission",
        description: "Donation",
        order_id: response.data.orderId,
        prefill: {
          name: donationData.fullName,
          email: donationData.email,
          contact: donationData.mobile,
        },
        theme: { color: "#3399cc" },
        handler: async function (paymentResponse) {
          try {
            // 3️⃣ Verify payment on backend
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_APP_RAZOR_DONATE_API_URL}/verify-session`,
              paymentResponse
            );

            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResponse;

            if (verifyRes.data.status === "success") {
              setSuccessMessage(t("donateForm.successMessage"));
              navigate(
                `/thank-you/?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
              );
            } else {
              alert("Payment verification failed. Please try again.");
              navigate("/payment-failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please try again.");
            navigate("/payment-failed");
          }
        },
        modal: {
          ondismiss: () => console.log("Payment popup closed by user"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(t("donateForm.error.processingDonation"));
    }
  };

  const onSubscribe = async (data) => {
    try {
      // 1️⃣ Prepare data
      const subscriptionData = {
        ...data,
        campaignId: campaignDetails.id,
        amount: Number(data.amount),
        termsAccepted: Boolean(data.termsAccepted),
      };

      delete subscriptionData.presetAmount;

      // 2️⃣ Call backend to create subscription (dynamic plan)
      const response = await axios.post(
        `${import.meta.env.VITE_APP_RAZOR_DONATE_API_URL}/create-custom-subs`,
        subscriptionData
      );

      if (!response.data?.subscriptionId) {
        throw new Error("Failed to create Razorpay subscription");
      }

      // 3️⃣ Open Razorpay Checkout with subscription_id
      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        subscription_id: response.data.subscriptionId,
        name: "SwamiG Mission",
        description: `Recurring Donation - ₹${subscriptionData.amount} / ${subscriptionData.interval || "month"
          }`,
        prefill: {
          name: subscriptionData.fullName,
          email: subscriptionData.email,
          contact: subscriptionData.mobile,
        },
        theme: { color: "#3399cc" },
        handler: async function (paymentResponse) {
          try {
            // 4️⃣ Verify subscription payment
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_APP_RAZOR_DONATE_API_URL}/verify-session`,
              paymentResponse
            );

            const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
              paymentResponse;

            if (verifyRes.data.status === "success") {
              setSuccessMessage(t("donateForm.successMessage"));
              navigate(
                `/thank-you/?razorpay_payment_id=${razorpay_payment_id}&razorpay_subscription_id=${razorpay_subscription_id}&razorpay_signature=${razorpay_signature}`
              );
            } else {
              alert("Subscription verification failed. Please try again.");
              navigate("/payment-failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Subscription verification failed. Please try again.");
            navigate("/payment-failed");
          }
        },
        modal: {
          ondismiss: () => console.log("Subscription popup closed by user"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert(t("donateForm.error.processingDonation"));
    }
  };
  const handleFormSubmit = (data) => {
    if (submitType === "subscribe") {
      onSubscribe(data);
    } else {
      onSubmit(data);
    }
  };

  const handleCitizenSelection = () => {
    if (selectedCitizenOption === "indian") {
      setCitizenStatus("indian");
      setValue("nationality", "Indian");
    } else {
      setCitizenStatus("foreign");
    }
  };

  return (
    <>
      <div className="relative h-[60vh] bg-[#7B0000] flex items-center justify-center">
        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{t("donate.hero.title")}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            {t("donate.hero.subtitle")}
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
      <div className="max-w-7xl mx-auto px-4 py-16">
        {successMessage && (
          <div className="mb-8 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium mb-2">{t("donateForm.thankYou")}</h3>
            <p>{successMessage}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="animate-spin h-12 w-12 text-[#B82A1E] mx-auto mb-4" />
              <p className="text-[#5D4037]">{t("donateForm.loadingCampaign")}</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-medium mb-2">{t("donateForm.error.title")}</h3>
            <p>{error}</p>
            <div className="mt-4">
              <button
                onClick={() => navigate("/donate")}
                className="bg-white text-[#B82A1E] border border-[#B82A1E] px-4 py-2 rounded hover:bg-[#B82A1E]/10 transition-colors"
              >
                {t("donateForm.returnToDonation")}
              </button>
            </div>
          </div>
        ) : (
          !successMessage && (
            <>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
                  <h1 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
                    {campaignDetails.title}
                  </h1>
                </div>
                <h2 className="text-xl text-[#5D4037]/80 mb-4">
                  {t("donateForm.requiredFundsFor", {
                    month: new Date().toLocaleString(t("common.locale") || "default", {
                      month: "long",
                    }),
                    year: new Date().getFullYear(),
                  })}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div className="space-y-8">
                  <div></div>

                  <div className="flex gap-8">
                    <div className="flex items-center gap-2"></div>
                  </div>

                  <p className="text-[#5D4037]/80 leading-relaxed">{campaignDetails.description}</p>

                  {campaignDetails.additionalText && (
                    <p className="text-[#5D4037]/80 leading-relaxed">
                      {campaignDetails.additionalText}
                    </p>
                  )}

                  <div className="relative">
                    <div className="absolute -bottom-4 -right-4 h-24 w-24 border-4 border-[#B82A1E]/10 rounded-lg -z-10"></div>
                    <img
                      src={campaignDetails.backgroundImage}
                      alt={campaignDetails.title}
                      className="rounded-lg shadow-md w-full h-auto object-cover"
                    />
                  </div>

                  {/* Supporting Section - Moved Here */}
                  <div className="pt-16">
                    <div className="space-y-8">
                      <div className="flex items-center mb-8">
                        <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
                        <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
                          {t("donateForm.supportingSection.title")}
                        </h2>
                      </div>

                      {/* Change starts here */}
                      <div className="flex flex-col md:flex-row gap-8 text-[#5D4037]/80">
                        <p className="leading-relaxed flex-1">
                          {t("donateForm.supportingSection.paragraph1")}
                        </p>
                        <p className="leading-relaxed flex-1">
                          {t("donateForm.supportingSection.paragraph2")}
                        </p>
                      </div>
                      {/* Change ends here */}

                      <div className="space-y-4">
                        <h3 className="text-2xl font-serif text-[#5D4037]">
                          {t("donateForm.supportingSection.impactTitle")}
                        </h3>
                        <p className="leading-relaxed text-[#5D4037]/80">
                          {t("donateForm.supportingSection.impactParagraph1")}
                        </p>
                        <p className="leading-relaxed text-[#5D4037]/80">
                          {t("donateForm.supportingSection.impactParagraph2")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Dynamic Content */}
                {citizenStatus === "unselected" && (
                  <div className="bg-[#fcf9f5] rounded-xl shadow-md p-8 text-center">
                    <h2 className="text-2xl font-serif text-[#5D4037] mb-4">
                      {t("donateForm.nationality.title")}
                    </h2>
                    <p className="text-[#5D4037]/80 mb-8">{t("donateForm.nationality.subtitle")}</p>
                    <div className="space-y-4 mb-8">
                      <button
                        onClick={() => setSelectedCitizenOption("indian")}
                        className={`w-full text-left p-4 border rounded-lg transition-all ${selectedCitizenOption === "indian"
                            ? "bg-[#B82A1E]/10 border-[#B82A1E] ring-2 ring-[#B82A1E]/50"
                            : "bg-white border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <span className="font-medium text-[#5D4037]">
                          {t("donateForm.nationality.indian")}
                        </span>
                      </button>
                      <button
                        onClick={() => setSelectedCitizenOption("foreign")}
                        className={`w-full text-left p-4 border rounded-lg transition-all ${selectedCitizenOption === "foreign"
                            ? "bg-[#B82A1E]/10 border-[#B82A1E] ring-2 ring-[#B82A1E]/50"
                            : "bg-white border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <span className="font-medium text-[#5D4037]">
                          {t("donateForm.nationality.foreign")}
                        </span>
                      </button>
                    </div>
                    <button
                      onClick={handleCitizenSelection}
                      className="w-full bg-[#B82A1E] text-white py-3 px-6 rounded-lg hover:bg-[#9a231a] transition-colors"
                    >
                      {t("common.continue")}
                    </button>
                  </div>
                )}

                {citizenStatus === "indian" && (
                  <div className="bg-[#fcf9f5] rounded-xl shadow-md p-8 relative">
                    <button
                      onClick={() => setCitizenStatus("unselected")}
                      className="absolute top-4 left-4 flex items-center gap-2 text-[#5D4037]/70 hover:text-[#5D4037] transition-colors text-sm"
                      type="button"
                    >
                      <ArrowLeft size={16} />
                      <span>{t("common.back")}</span>
                    </button>

                    <div className="relative z-10">
                      <h3 className="text-2xl font-serif text-[#5D4037] mb-6 text-center">
                        {t("donateForm.supportOurMission")}
                      </h3>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {presetAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setValue("amount", amount.toString())}
                            className={`py-2 px-4 rounded-lg border transition-colors ${watchAmount === amount.toString()
                                ? "border-[#B82A1E] bg-[#B82A1E]/10 text-[#B82A1E]"
                                : "border-gray-300 text-[#5D4037] hover:border-[#B82A1E]/60"
                              }`}
                            type="button"
                          >
                            ₹ {amount.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                        <div>
                          <input
                            type="number"
                            placeholder={t("donateForm.otherAmount")}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] bg-white transition-colors ${errors.amount ? "border-red-500" : "border-gray-300"
                              }`}
                            {...register("amount", {
                              required: t("donateForm.validation.amountRequired"),
                              min: {
                                value: 100,
                                message: t("donateForm.validation.minimumAmount", { amount: 100 }),
                              },
                            })}
                          />
                          {errors.amount && (
                            <p className="mt-1 text-red-500 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.amount.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder={t("donateForm.fullName")}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] bg-white transition-colors ${errors.fullName ? "border-red-500" : "border-gray-300"
                              }`}
                            {...register("fullName", {
                              required: t("donateForm.validation.nameRequired"),
                              minLength: {
                                value: 3,
                                message: t("donateForm.validation.nameMinLength", { length: 3 }),
                              },
                            })}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-red-500 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.fullName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            type="tel"
                            placeholder={t("donateForm.mobileNumber")}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] bg-white transition-colors ${errors.mobile ? "border-red-500" : "border-gray-300"
                              }`}
                            maxLength={10}
                            {...register("mobile", {
                              required: t("donateForm.validation.mobileRequired"),
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: t("donateForm.validation.mobilePattern"),
                              },
                            })}
                          />
                          {errors.mobile && (
                            <p className="mt-1 text-red-500 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.mobile.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            type="email"
                            placeholder={t("donateForm.email")}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] bg-white transition-colors ${errors.email ? "border-red-500" : "border-gray-300"
                              }`}
                            {...register("email", {
                              required: t("donateForm.validation.emailRequired"),
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: t("donateForm.validation.emailPattern"),
                              },
                            })}
                          />
                          {errors.email && (
                            <p className="mt-1 text-red-500 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <textarea
                            placeholder={t("donateForm.address")}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-[#B82A1E]/30 focus:border-[#B82A1E] bg-white transition-colors ${errors.address ? "border-red-500" : "border-gray-300"
                              }`}
                            rows={3}
                            {...register("address", {
                              required: t("donateForm.validation.addressRequired"),
                            })}
                          />
                          {errors.address && (
                            <p className="mt-1 text-red-500 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.address.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-start gap-2 text-[#5D4037]/80">
                            <input
                              type="checkbox"
                              className={`mt-1 ${errors.termsAccepted ? "border-red-500" : ""}`}
                              {...register("termsAccepted", {
                                required: t("donateForm.validation.termsRequired"),
                              })}
                            />
                            <span>{t("donateForm.termsAgreement")}</span>
                          </label>
                          {errors.termsAccepted && (
                            <p className="mt-1 text-red-500 text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.termsAccepted.message}
                            </p>
                          )}
                        </div>

                        <div className=" flex gap-4">
                          <button
                            onClick={() => setSubmitType("subscribe")}
                            type="submit"
                            className="w-full bg-[#B82A1E] text-white py-3 px-6 rounded-lg hover:bg-[#9a231a] transition-colors flex items-center justify-center gap-2"
                          >
                            <Heart size={18} />
                            <span>Subscribe</span>
                          </button>
                          <button
                            onClick={() => setSubmitType("donate")}
                            type="submit"
                            className="w-full bg-[#B82A1E] text-white py-3 px-6 rounded-lg hover:bg-[#9a231a] transition-colors flex items-center justify-center gap-2"
                          >
                            <Heart size={18} />
                            <span>{t("donateForm.donateNow")}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {citizenStatus === "foreign" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-md p-8 text-center relative">
                    <button
                      onClick={() => setCitizenStatus("unselected")}
                      className="absolute top-4 left-4 flex items-center gap-2 text-blue-700/80 hover:text-blue-800 transition-colors text-sm"
                      type="button"
                    >
                      <ArrowLeft size={16} />
                      <span>{t("common.back")}</span>
                    </button>

                    <h2 className="text-2xl font-serif text-blue-800 mb-4">
                      {t("donateForm.foreignDonation.title")}
                    </h2>
                    <p className="text-blue-700/90 mb-6">
                      {t("donateForm.foreignDonation.message")}
                    </p>
                    <a
                      href="https://www.every.org/avdheshanandg-mission?search_meta=%7B%22query%22%3A%22avd%22%7D&donateTo=avdheshanandg-mission#/donate/card"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("donateForm.foreignDonation.buttonText")}
                    </a>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </>
  );
};

export default DonationForm;
