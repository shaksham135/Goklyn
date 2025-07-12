import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set the auth token for axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data
        const response = await api.get('/auth/me');
        
        if (response.data.success) {
          setUser(response.data.data);
          setIsAuthenticated(true);
          
          // Redirect to dashboard if on login page
          if (location.pathname === '/login') {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // Clear invalid tokens
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname]);

  // Login function
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { email });
      
      // Call the login API
      const response = await api.post('/auth/login', {
        email,
        password,
        remember: rememberMe
      });
      
      console.log('Login response:', response);
      
      // Handle the response format from the API
      const responseData = response.data || {};
      
      // Check if the response indicates success
      if (response.status >= 200 && response.status < 300) {
        // Check for token in different possible locations in the response
        const token = responseData.token || 
                     responseData.data?.token || 
                     (responseData.data?.tokens ? responseData.data.tokens.accessToken : null);
        
        // Get user data from response
        const userData = responseData.user || responseData.data?.user || responseData.data;
        
        if (!token) {
          console.error('No token received in response:', responseData);
          throw new Error('No authentication token received from server');
        }
        
        if (!userData) {
          console.warn('No user data received in login response');
        }
        
        console.log('Login successful, storing token');
        
        // Store token in appropriate storage based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        
        // Set the default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setUser(userData || { email }); // Fallback to basic user data if none provided
        setIsAuthenticated(true);
        
        // Redirect to dashboard or intended URL
        const from = location.state?.from?.pathname || '/dashboard';
        console.log('Redirecting to:', from);
        navigate(from, { replace: true });
        
        return { success: true, user: userData || { email } };
      } else {
        // Handle error response from server
        const errorMessage = responseData.message || 
                           responseData.error || 
                           responseData.data?.message || 
                           'Login failed. Please check your credentials.';
        
        console.error('Login failed:', errorMessage, 'Response:', responseData);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      } else {
        // Other errors
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate, location.state]);
  
  // Logout function
  const logout = useCallback(() => {
    // Clear tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login
    navigate('/login');
  }, [navigate]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Register function
  const register = useCallback(async (username, email, password, role = 'sub-admin') => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the register API
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        role
      });
      
      if (response && response.success) {
        // Auto-login after successful registration
        return await login(email, password, false);
      } else {
        throw new Error(response?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
        
        // Handle validation errors
        if (error.response.data?.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat();
          errorMessage = validationErrors.join(' ');
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    clearError
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
