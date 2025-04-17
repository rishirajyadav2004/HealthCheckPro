const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL
  : process.env.REACT_APP_API_URL_DEV;

export const fetchData = async () => {
  const response = await fetch(`${API_URL}/api/data`);
  return await response.json();
};