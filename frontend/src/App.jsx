import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Layout
import Navbar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Appointment from './pages/Appointment';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmailLogs from './pages/AdminEmailLogs';
import PaymentPage from './pages/PaymentPage';

// Clear any stuck toasts on app start
const clearStuckToasts = () => {
  if (typeof window !== 'undefined') {
    // Clear localStorage toast data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('toast') || key.includes('react-toastify')) {
        localStorage.removeItem(key);
      }
    });
    
    // Dismiss all active toasts
    setTimeout(() => {
      toast.dismiss();
    }, 100);
  }
};

// Safe Toast Container Component
const SafeToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={4000}
    hideProgressBar={false}
    newestOnTop={true}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss={false}
    draggable
    pauseOnHover
    theme="light"
    limit={3}
  />
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const token = sessionStorage.getItem('adminToken');
  
  if (!isAdmin || !token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  // Clear stuck toasts on mount
  useEffect(() => {
    clearStuckToasts();
  }, []);

  return (
    <>
      <Helmet>
        <title>MindWell Psychology | Professional Mental Health Services</title>
        <meta 
          name="description" 
          content="Licensed clinical psychologist providing evidence-based therapy for individuals, couples, and families." 
        />
      </Helmet>
      
      <Router>
        <div className="App">
          <Navbar />
          <main style={{ minHeight: '80vh' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/email-logs" 
                element={
                  <ProtectedRoute>
                    <AdminEmailLogs />
                  </ProtectedRoute>
                } 
              />
              <Route path="/payment" element={<PaymentPage />} />
            </Routes>
          </main>
          <footer style={{
            backgroundColor: '#333',
            color: 'white',
            padding: '2rem',
            marginTop: '2rem'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <p>© 2024 MindWell Psychology. All rights reserved.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: '0.8' }}>
                Professional clinical psychology services for individuals, couples, and families
              </p>
            </div>
          </footer>
        </div>
        <SafeToastContainer />
      </Router>
    </>
  );
}

export default App;