/**
 * Utility function to get the API URL with the proper protocol
 * This handles when Render provides just the host without protocol
 */
export const getApiUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // If the API URL doesn't include a protocol, add https://
  if (apiUrl && !apiUrl.startsWith('http')) {
    apiUrl = `https://${apiUrl}`;
  }
  
  return apiUrl;
};

/**
 * Constructs a full API endpoint URL
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @returns {string} The full API URL
 */
export const apiEndpoint = (endpoint) => {
  const baseUrl = getApiUrl();
  // Ensure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${formattedEndpoint}`;
}; 