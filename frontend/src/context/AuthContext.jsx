import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || "");

  const login = (token) => {
    setToken(token);
    sessionStorage.setItem("token", token);
  };

  const logout = () => {
    setToken("");
    sessionStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 2027 00:00:00 GMT; path=/";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);