import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  const login = async (emailOrPhone, password) => {
    const res = await API.post("/auth/login", {
      emailOrPhone,
      password,
    });

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    return res.data.user;
  };

  const register = async (payload) => {
    const res = await API.post("/auth/register", payload);
    return res.data;
  };

  const googleLogin = async ({ credential, role } = {}) => {
    const res = await API.post("/auth/google", {
      credential,
      role,
    });

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    return res.data.user;
  };

  const forgotPassword = async (email) => {
    const res = await API.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async (token, password) => {
    const res = await API.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.log(error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const fetchMe = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      try {
        const refreshRes = await API.post("/auth/refresh-token");
        localStorage.setItem("accessToken", refreshRes.data.accessToken);

        if (refreshRes.data.user) {
          localStorage.setItem("user", JSON.stringify(refreshRes.data.user));
          setUser(refreshRes.data.user);
          return refreshRes.data.user;
        }
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
        return null;
      }
    }

    try {
      const res = await API.get("/auth/me");

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }
  };

  const checkAuth = async () => {
    try {
      await fetchMe();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => setUser(null);

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        forgotPassword,
        resetPassword,
        logout,
        fetchMe,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
