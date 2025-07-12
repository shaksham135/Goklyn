import React, { Suspense, lazy, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import useAnimateOnView from './components/common/useAnimateOnView';
import ScrollTop from './components/ScrollTop/ScrollTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const CareerPage = lazy(() => import('./pages/CareerPage'));
const ApplyPage = lazy(() => import('./pages/ApplyPage'));
const AddTestimonialPage = lazy(() => import('./pages/AddTestimonialPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Define page-specific classes for different routes
const pageClasses = {
  "/": "banner-section-outer",
  "/about": "sub-banner-section-outer",
  "/about-us": "sub-banner-section-outer",
  "/services": "sub-banner-section-outer services-banner-section-outer",
  "/faqs": "sub-banner-section-outer",
  "/portfolio": "sub-banner-section-outer services-banner-section-outer",
  "/our-team": "sub-banner-section-outer",
  "/contact": "sub-banner-section-outer contact-banner-section-outer",
  "/contact-us": "sub-banner-section-outer contact-banner-section-outer",
  "/career": "sub-banner-section-outer contact-banner-section-outer"
};

// Create a separate component to handle route content
const RouteContent = () => {
  const location = useLocation();
  const containerClass = pageClasses[location.pathname] || "banner-section-outer";
  
  // Trigger all .hover-effect elements to animate on every route change
  useEffect(() => {
    const els = document.querySelectorAll('.hover-effect');
    els.forEach(el => {
      el.classList.remove('hover-effect-animate');
      void el.offsetWidth;
      el.classList.add('hover-effect-animate');
    });
    return () => {
      // Cleanup if needed
    };
  }, [location]);

  return (
    <div className={`${containerClass} position-relative`}>
      <ScrollTop>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/portfolio" element={<ProjectPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/apply/:internshipId" element={<ApplyPage />} />
          <Route path="/add-testimonial" element={<AddTestimonialPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </ScrollTop>
    </div>

  );
};

const AppWrapper = () => {
  useAnimateOnView();
  
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);
  
  return <RouteContent />;
};

const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="large" />
          </div>
        }>
          <AppWrapper />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
