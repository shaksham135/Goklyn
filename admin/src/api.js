import axios from 'axios';

// Define the base URL for the API. It uses an environment variable for production
// and falls back to a local development URL.
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

// Create a new Axios instance with a custom configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is crucial for sending cookies (like auth tokens) with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // Set a 10-second timeout for requests
});

// Use an interceptor to handle all outgoing requests
api.interceptors.request.use(
  (config) => {
    // In a real app, you would get the auth token from storage (e.g., localStorage)
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    
    // Log the request in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    // Handle any errors that occur during request setup
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Use an interceptor to handle all incoming responses
api.interceptors.response.use(
  (response) => {
    // Return the full response object so we can access status, headers, etc.
    return response;
  },
  (error) => {
    // Any status codes that fall outside the range of 2xx will cause this function to trigger
    
    // Enhanced error logging
    console.groupCollapsed('[API Response Error]');
    console.log('Error Object:', error);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Response Data:', error.response.data);
    } else if (error.request) {
      console.log('Request:', error.request);
    }
    console.groupEnd();

    // Create a user-friendly error object to be passed to the UI
    const customError = {
      message: 'An unexpected error occurred.',
      status: 500,
      data: error.response?.data,
      errors: error.response?.data?.errors,
    };

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx.
      customError.message = error.response.data?.message || 'An error occurred on the server.';
      customError.status = error.response.status;
      
      // Include validation errors if available
      if (error.response.data?.errors) {
        customError.errors = error.response.data.errors;
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., network error)
      customError.message = 'Network error. Please check your connection and try again.';
    } else {
      // Something happened in setting up the request that triggered an Error
      customError.message = error.message;
    }

    // Reject the promise with the custom error object so the UI can handle it
    return Promise.reject(customError);
  }
);

export default api;

