const getApiUrl = () => {
  // Allow overriding via query param (e.g. ?api_url=https://...)
  const params = new URLSearchParams(window.location.search);
  const paramApiUrl = params.get('api_url');
  if (paramApiUrl) {
    localStorage.setItem('override_api_url', paramApiUrl);
    return paramApiUrl;
  }
  
  const storedApiUrl = localStorage.getItem('override_api_url');
  if (storedApiUrl) {
    return storedApiUrl;
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  if (hostname.includes('github.io')) {
    return 'https://blog-platform-with-comments-9nxf.onrender.com/api';
  }
  
  return '/api';
};

export const API_URL = getApiUrl();
