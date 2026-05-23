import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem("token")
      ? {
          token: localStorage.getItem("token"),
          username: localStorage.getItem("username"),
        }
      : null,
  );

  const loginUser = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    setUser(data);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
