import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, deleteUser, fetchUsers, UnauthorizedError } from "../api";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUser({ name, email });
      setName("");
      setEmail("");
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        navigate("/sign-in", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to add user");
    }
  }

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
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Add user</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default UsersPage;
