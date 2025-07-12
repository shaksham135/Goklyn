import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FiHome, FiBriefcase, FiFileText, FiMessageSquare, FiSettings, FiMenu, FiAward, FiX } from 'react-icons/fi';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardHome from './dashboard/Home';
import ProjectsPage from './ProjectsPage';
import InternshipsPage from './InternshipsPage';
import TestimonialsPage from './TestimonialsPage';
import SettingsPage from './SettingsPage';
import StatsOverview from '../components/dashboard/StatsOverview';
import RecentActivities from '../components/dashboard/RecentActivities';
import styles from '../styles/DashboardLayout.module.css';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activitiesRefreshTrigger, setActivitiesRefreshTrigger] = useState(0);

  // Handle window resize and initial mobile check
  useEffect(() => {
    const checkIfMobile = () => window.innerWidth < 1024;
    
    const handleResize = () => {
      const isNowMobile = checkIfMobile();
      if (isMobile !== isNowMobile) {
        setIsMobile(isNowMobile);
      }
      if (!isNowMobile) {
        setShowMobileMenu(false);
      }
    };

    // Initial check
    const initialMobileCheck = checkIfMobile();
    setIsMobile(initialMobileCheck);
    if (!initialMobileCheck) {
      setShowMobileMenu(false);
    }

    // Add debounce to resize handler
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileMenu(!showMobileMenu);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const refreshActivities = () => {
    setActivitiesRefreshTrigger(prev => prev + 1);
  };

  const sidebarSections = [
    { id: 'home', label: 'Dashboard', icon: <FiHome />, component: <DashboardHome /> },
    { id: 'projects', label: 'Projects', icon: <FiBriefcase />, component: <ProjectsPage /> },
    { id: 'internships', label: 'Internships', icon: <FiAward />, component: <InternshipsPage /> },
    { id: 'testimonials', label: 'Testimonials', icon: <FiMessageSquare />, component: <TestimonialsPage /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings />, component: <SettingsPage /> },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Menu Button - Only show on mobile */}
      {isMobile && (
        <button 
          className={styles.mobileMenuButton}
          onClick={toggleSidebar}
          aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
          aria-expanded={showMobileMenu}
          aria-controls="sidebar-navigation"
        >
          {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Overlay for mobile */}
      <div 
        className={`${styles.sidebarOverlay} ${showMobileMenu ? styles.sidebarOverlayOpen : ''}`}
        onClick={closeMobileMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && closeMobileMenu()}
        aria-label="Close menu"
        aria-hidden={!showMobileMenu}
      />

      {/* Sidebar */}
      <div 
        id="sidebar-navigation"
        className={`${styles.sidebar} 
          ${!isSidebarOpen ? styles.sidebarCollapsed : ''} 
          ${showMobileMenu ? styles.sidebarOpen : ''}`}
        style={{
          zIndex: 100,
          ...(isMobile && !showMobileMenu ? { transform: 'translateX(-100%)' } : {})
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <AdminSidebar 
          sections={sidebarSections}
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div 
        className={`${styles.mainContent} ${!isSidebarOpen ? styles.mainContentExpanded : ''}`}
        style={{
          marginLeft: isMobile ? 0 : isSidebarOpen ? '240px' : '60px',
          width: isMobile ? '100%' : isSidebarOpen ? 'calc(100% - 240px)' : 'calc(100% - 60px)'
        }}
      >
        {/* Top Bar */}
        <div className={styles.topBar}>
          <h1 
            className={styles.pageTitle}
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              margin: 0,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? '200px' : 'none'
            }}
          >
            {sidebarSections.find(section => section.id === activeSection)?.label || 'Dashboard'}
          </h1>
          <div className={styles.userControls}>
            <span className={styles.welcomeText}>
              Welcome, {user?.username}
            </span>
            <button 
              onClick={logout}
              className={styles.logoutButton}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {sidebarSections.find(section => section.id === activeSection)?.component}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
