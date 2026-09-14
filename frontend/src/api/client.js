import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("alms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // ngrok's free tier shows an HTML "you're about to visit..." interstitial
  // to any browser that hasn't clicked through that specific tunnel URL
  // before, even for XHR/fetch calls — which breaks JSON parsing here.
  // This header tells ngrok to skip it. Harmless when not using ngrok.
  config.headers["ngrok-skip-browser-warning"] = "true";
  return config;
});

export default client;
