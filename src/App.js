import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import SplashScreen from "./components/SplashScreen/SplashScreen";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage/LandingPage";
import Questionaire from "./pages/Questionaire/Questionaire";
import ResultsPage from "./pages/ResultsPage/ResultsPage";
import MobileLogin from "./pages/MobileLogin/MobileLogin";
import EnhancedQuestions from "./pages/EnhancedQuestions/EnhancedQuestions";
import AboutUs from "./pages/AboutUs/AboutUs";
import AboutIITs from "./pages/AboutIITs/AboutIITs";
import BranchComparison from "./pages/BranchComparison/BranchComparison";
import CollegePredictor from "./pages/CollegePredictor/CollegePredictor";
import CollegePredictorResults from "./pages/CollegePredictor/CollegePredictorResults";
import ContactUs from "./pages/ContactUs/ContactUs";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import Team from "./components/Team/Team";
import CancellationRefundPolicy from "./pages/CancellationRefundPolicy/CancellationRefundPolicy";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import ProtectedRoute from "./Routes/ProtectedRoute";
import ComingSoon from "./pages/ComingSoon/ComingSoon";
import SeminarPage from "./pages/SeminarPage/SeminarPage";
import ResourcesPage from "./pages/ResourcesPage/ResourcesPage";
import NewsPage from "./pages/NewsPage/NewsPage";
import CBTPortal from "./pages/CBTPortal/CBTPortal";
import TestInterface from "./pages/CBTPortal/TestInterface";
import CustomTestBuilder from "./pages/CBTPortal/CustomTestBuilder";
import ProfileSetup from "./pages/ProfileSetup/ProfileSetup";
import CBTDashboard from "./pages/CBTPortal/CBTDashboard";
import HomePage from "./pages/Home/HomePage";
import PYQPage from "./pages/PYQPage/PYQPage";
import EnergyBatch from "./pages/EnergyBatch/EnergyBatch";
import StudyWithIITians from "./pages/StudyWithIITians/StudyWithIITians";
import Home2 from "./pages/Home_2/Home2";
import Login2 from "./pages/Login_2/login2";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // if (showSplash) {
  //   return <SplashScreen />;
  // }

  return (
    <Router>
      <ScrollToTop />
      <Layout isLoggedIn={isLoggedIn}>
        <Routes>
          <Route path="/lp" element={<LandingPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/Questionaire" element={<Questionaire />} />
          <Route path="/ResultsPage" element={<ResultsPage />} />
          <Route path="/MobileLogin" element={<MobileLogin />} />
          <Route path="/login" element={<Login2 />} />
          {/* Correct placement of ProtectedRoute */}
          <Route path="/EnhancedQuestions" element={<ProtectedRoute requirePayment={false}><EnhancedQuestions /></ProtectedRoute>} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/AboutIITs" element={<AboutIITs />} />
          <Route path="/Contact-Us" element={<ContactUs />} />
          <Route path="/HowItWorks" element={<HowItWorks />} />
          <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
          <Route path="/Our-Team" element={<Team />} />
          <Route path="/Cancellation-and-Refund" element={<CancellationRefundPolicy />} />
          <Route path="/Terms-and-Conditions" element={<TermsAndConditions />} />
          <Route path="/ComingSoon" element={<ComingSoon />} />
          <Route path="/seminar" element={<SeminarPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/pyq" element={<PYQPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/branch-comparison" element={<BranchComparison />} />
          <Route path="/college-predictor" element={<CollegePredictor />} />
          <Route path="/college-predictor/results" element={<CollegePredictorResults />} />
          <Route path="/energy-batch" element={<EnergyBatch />} />
          <Route path="/study-with-iitians" element={<StudyWithIITians />} />
          <Route path="/home-2" element={<Home2 />} />
          <Route path="/cbt-portal" element={<CBTPortal />} />
          <Route path="/cbt-portal/custom-test" element={<CustomTestBuilder />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/cbt-portal/test/:testId" element={<TestInterface />} />
          <Route path="/cbt-portal/dashboard" element={<CBTDashboard />} />
          {/* Add other routes as needed */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;