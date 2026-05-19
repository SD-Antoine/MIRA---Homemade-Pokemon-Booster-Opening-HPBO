import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur d'inscription"); return; }
      setUser(data);
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
        <h1 className="text-2xl font-bold text-center">Inscription</h1>

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

        <label className="form-control w-full">
          <div className="label"><span className="label-text">Confirmer le mot de passe</span></div>
          <input
            type="password"
            className="input input-bordered w-full"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm" /> : "Créer un compte"}
        </button>

        <p className="text-center text-sm">
          Déjà un compte ?{" "}
          <Link to="/login" className="link link-primary">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
