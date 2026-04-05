import { useState, useEffect } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home.jsx";
import NewPage from "./pages/NewPage";
import PlacesRoute from "./pages/PlacesRoute";
import About from "./pages/About";
import BlogsDetails from "./pages/BlogsDetails";
import Blogs from "./pages/Blogs";
import AOS from "aos";
import "aos/dist/aos.css";
import Donate from "./pages/Donate";
import KumbhMela from "./pages/KumbhMela";
import DonationForm from "./components/Donate/DonationForm/DonateForm";
import InMedia from "./pages/InMedia";
import VideoSeries from "./pages/VideoSeries";
import Articles from "./pages/Articles";
import Books from "./pages/Books";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Profile from "./pages/Profile";

import Podcasts from "./pages/Podcasts.jsx";
import UserRegister from "./pages/UserRegister";
import EventRegistration from "./pages/EventRegistration";
import ProtectedRoute from "./middlewares/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import SchedulePage from "./pages/Schedule";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SplashScreen from "./components/SplashScreen";
import NotFound from "./components/NotFound.jsx";
import DeclinePayment from "./pages/DeclinePayment.jsx";
import SuccessPayment from "./pages/SuccessPayment.jsx";

import Volunteer from "./pages/Volunteer.jsx";
import { useIsMissionDomain } from "./utils/isMission.js";
import DikshRegistrationForm from "./pages/MantraDiksha.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsCondition";
import ImageLibrary from "./pages/ImageLibrary";
import FacebookDataDeletion from "./pages/FacebookDataDeletion";

const protectedRoutes = [
  { path: "/profile", element: <Profile /> },

  // Added route for path parameter
  { path: "/event-registration", element: <EventRegistration /> },
  { path: "/newpage", element: <NewPage /> },
  { path: "/image-library", element: <ImageLibrary/> },

];

const AppRoutes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMission = useIsMissionDomain();

  const publicRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/userregister", element: <UserRegister /> },
    { path: "/donate-form/:campaignId", element: <DonationForm /> },
    { index: true, element: <Home /> },
    { path: "/donate-form", element: <DonationForm /> },
    { path: "/articles", element: <Articles /> },
    { path: "/books", element: isMission ? <Home /> : <Books /> },
    { path: "/videos", element: <VideoSeries /> },
    { path: "/media", element: <InMedia /> },
    { path: "blogs/:id", element: <BlogsDetails /> },
    { path: "blogs", element: <Blogs /> },
    { path: "best-places", element: <PlacesRoute /> },
    { path: "/payment-failed", element: <DeclinePayment /> },
    { path: "/thank-you", element: <SuccessPayment /> },
    { path: "about", element: <About /> },
    { path: "/kumbh-mela-2025", element: <KumbhMela /> },
    { path: "*", element: <NotFound /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/verify-otp", element: <VerifyOtp /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/schedule", element: <SchedulePage /> },
    { path: "/podcasts", element: <Podcasts /> },
    { path: "/video-series", element: <VideoSeries /> },
    { path: "/volunteer", element: <Volunteer /> },
    { path: "/donate", element: <Donate /> },
    { path: "/mantra-diksha", element: <DikshRegistrationForm /> },
    { path: "/terms-and-conditions", element: <TermsAndConditions /> },
    { path: "/privacy-policys", element: <PrivacyPolicy /> },
    { path: "/image-library", element: <ImageLibrary/> },
    { path: "/facebook-data-deletion", element: <FacebookDataDeletion/> },
  ];

  const routing = useRoutes([
    {
      path: "/",
      element: <Layout />,
      children: [
        ...publicRoutes,
        {
          element: <ProtectedRoute />,
          children: protectedRoutes,
        },
      ],
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  return <>{routing}</>;
};

const App = () => {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 900,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppRoutes />
     
    </BrowserRouter>
  );
};

export default App;
