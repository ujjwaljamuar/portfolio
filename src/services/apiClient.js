import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../config/constants";

export const ADMIN_AUTH_KEY = "adminAuthenticated";
export const ADMIN_COOKIE_NAME = "portfolio_admin_token";

const adminLoginPath = `${import.meta.env.BASE_URL || "/"}admin/login`;

export const getAdminCookieToken = () => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_COOKIE_NAME}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  config.withCredentials = true;

  const cookieToken = getAdminCookieToken();

  if (cookieToken) {
    config.headers.Authorization = `Bearer ${cookieToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Something went wrong";

    if (status === 401) {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }

    if (!error?.config?.silentError) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
