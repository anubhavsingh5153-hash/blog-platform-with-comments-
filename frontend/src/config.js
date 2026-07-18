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

  let apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    apiUrl = apiUrl.trim();
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    if (!apiUrl.endsWith('/api')) {
      apiUrl = `${apiUrl}/api`;
    }
    return apiUrl;
  }
  
  const hostname = window.location.hostname;
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.endsWith('.onrender.com') ||
    hostname.endsWith('.vercel.app') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1')
  ) {
    return '/api';
  }
  
  return 'https://blog-platform-with-comments-9nxf.onrender.com/api';
};

export const API_URL = getApiUrl();
