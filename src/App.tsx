import { Link, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { GuestRoute, ProtectedRoute } from "./auth/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import SignInPage from "./pages/SignInPage";
import UsersPage from "./pages/UsersPage";
import "./App.css";

function Layout() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  function handleSignOut() {
    logout();
    navigate("/sign-in", { replace: true });
  }

  return (
    <>
      <nav className="nav">
        {isAuthenticated ? (
          <>
            <Link to="/">Users</Link>
            <button type="button" className="nav-button" onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<UsersPage />} />
        </Route>
        <Route element={<GuestRoute />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
