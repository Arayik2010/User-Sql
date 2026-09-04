import { useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { clearStoredToken, getToken, setStoredToken } from "./token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  function setToken(next: string) {
    setStoredToken(next);
    setTokenState(next);
  }

  function logout() {
    clearStoredToken();
    setTokenState(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
