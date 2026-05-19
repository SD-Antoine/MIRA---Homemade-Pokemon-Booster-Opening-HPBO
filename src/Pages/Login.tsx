import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur de connexion"); return; }
      setUser(data);

      // Sync inventory depuis le serveur
      const inv = await fetch("/api/inventory", { credentials: "include" });
      if (inv.ok) localStorage.setItem("inventory", JSON.stringify(await inv.json()));

      navigate("/");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 w-96 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Connexion</h1>

        {error && <div className="alert alert-error text-sm">{error}</div>}

        <label className="form-control w-full">
          <div className="label"><span className="label-text">Nom d'utilisateur</span></div>
          <input
            type="text"
            className="input input-bordered w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="form-control w-full">
          <div className="label"><span className="label-text">Mot de passe</span></div>
          <input
            type="password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm" /> : "Se connecter"}
        </button>

        <p className="text-center text-sm">
          Pas de compte ?{" "}
          <Link to="/register" className="link link-primary">S'inscrire</Link>
        </p>
      </form>
    </div>
  );
}
