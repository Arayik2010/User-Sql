import { useEffect, useState } from "react";
import "./App.css";

type User = {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
};

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function loadUsers() {
    setLoading(true);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: User[]) => {
        setUsers(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setName("");
      setEmail("");
      loadUsers(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      loadUsers(); 
    } catch (err) {
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

export default App;
