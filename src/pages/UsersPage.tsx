import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteUser, fetchUsers, fetchUserSalary, fetchUsersWork, UnauthorizedError } from "../api";
import { useAuth } from "../auth/useAuth";
import "../App.css";

type User = {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
};

function UsersPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUsersWork<User[]>()
    fetchUserSalary<User[]>()

    fetchUsers<User[]>()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof UnauthorizedError) {
          logout();
          navigate("/sign-in", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout, navigate, reloadKey]);

  async function handleDelete(id: number) {
    try {
      await deleteUser(id);
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        navigate("/sign-in", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Users</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} {user.email ? `— ${user.email}` : ""}
            <Link to={`/users/${user.id}/edit`}>Edit</Link>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <Link to="/users/new">Add user</Link>
    </div>
  );
}

export default UsersPage;
