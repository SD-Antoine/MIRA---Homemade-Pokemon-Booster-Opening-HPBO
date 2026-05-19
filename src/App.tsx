import "./index.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type Pokemon from "./Entities/Pokemon";
import { DataStorer } from "./Functions/API_Data";
import { TailwindLoader } from "./Components/TailwindLoader";
import { Navbar } from "./Components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { BoostersPage } from "./Pages/Boosters";
import { DisplayPokemons } from "./Pages/Inventaire";
import { LoginPage } from "./Pages/Login";
import { RegisterPage } from "./Pages/Register";

function App() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  useEffect(() => {
    DataStorer().then(setPokemons);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <TailwindLoader />
        <div className="flex flex-col h-screen items-center justify-center">
          <Navbar />
            <main className="flex-1 overflow-auto flex">
              <Routes>
                <Route path="/" element={<BoostersPage pokemons={pokemons} />} />
                <Route path="/inventaire" element={<DisplayPokemons pokemons={pokemons} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
