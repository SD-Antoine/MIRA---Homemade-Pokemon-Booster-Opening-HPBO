import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="w-[70vw] h-[7vh] flex items-center justify-center rounded-b-xl bg-red-700 border-x-[0.5vh] border-b-[0.5vh] portrait:border-x-[1vw] portrait:border-b-[1vw] border-black shadow-sm px-4 text-white relative">

      {/* Burger — portrait uniquement, à gauche */}
      <div ref={menuRef} className="portrait:block hidden absolute left-4">
        <button
          className="btn btn-ghost btn-square"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {menuOpen && (
          <ul className="absolute top-full left-0 mt-1 menu bg-red-700 rounded-lg z-50 w-52 p-3 shadow text-white border border-black">
            <li>
              <Link to="/inventaire" onClick={() => setMenuOpen(false)}>Inventaire</Link>
            </li>
            {!loading && (user
              ? <li><button onClick={() => { logout(); setMenuOpen(false); }}>Déconnexion</button></li>
              : <>
                  <li><Link to="/login" onClick={() => setMenuOpen(false)}>Connexion</Link></li>
                  <li><Link to="/register" onClick={() => setMenuOpen(false)}>Inscription</Link></li>
                </>
            )}
          </ul>
        )}
      </div>

      {/* Titre — toujours visible, centré */}
      <Link to="/" className="text-2xl font-bold">Gachamon</Link>

      {/* Liens desktop — masqués en portrait */}
      <div className="portrait:hidden absolute right-4 flex items-center gap-4">
        <Link to="/inventaire" className="btn btn-ghost">Inventaire</Link>
        {!loading && (
          user ? (
            <button className="btn btn-error btn-sm cursor-pointer" onClick={logout}>Déconnexion</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm cursor-pointer">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm cursor-pointer">Inscription</Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}
