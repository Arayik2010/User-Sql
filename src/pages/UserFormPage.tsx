import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createUser, fetchUser, updateUser, UnauthorizedError } from "../api";
import { useAuth } from "../auth/useAuth";
import { TextField } from "../components/TextField";
import "../App.css";

type User = {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
};

// Shared form for the "create" (no :id param) and "edit" (:id param) pages.
function UserFormPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { id } = useParams();
  const userId = id ? Number(id) : null;
  const isEdit = userId !== null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleError(err: unknown, fallback: string) {
    if (err instanceof UnauthorizedError) {
      logout();
      navigate("/sign-in", { replace: true });
      return;
    }
    setError(err instanceof Error ? err.message : fallback);
  }

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;

    fetchUser<User>(userId)
      .then((user) => {
        if (cancelled) return;
        setName(user.name);
        setEmail(user.email ?? "");
      })
      .catch((err) => {
        if (!cancelled) handleError(err, "Failed to load user");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (userId === null) {
        await createUser({ name, email });
      } else {
        await updateUser(userId, { name, email });
      }
      navigate("/");
    } catch (err) {
      handleError(err, isEdit ? "Failed to update user" : "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>{isEdit ? "Edit user" : "Add user"}</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={submitting}>
              {isEdit ? "Save" : "Add"}
            </button>
            <Link to="/">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default UserFormPage;
