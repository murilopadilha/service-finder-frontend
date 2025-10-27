import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // aqui você conecta com API
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div className="container">
      <h1 className="title">SERV EASY</h1>

      <div className="card">
        {/* Ícone de usuário */}
        <div className="icon-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="user-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M3 20a9 9 0 0 1 18 0" />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome"
                required
                className="input"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              required
              className="input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              required
              className="input"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmar">Confirmar senha</label>
              <input
                id="confirmar"
                type="password"
                placeholder="Repita a senha"
                required
                className="input"
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Botão no canto inferior direito */}
          <div className="actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "..." : isLogin ? "ENTRAR" : "CADASTRAR"}
            </button>
          </div>
        </form>
      </div>

      {/* Alternância Login/Cadastro */}
      <div className="switch">
        {isLogin ? (
          <button
            type="button"
            className="link"
            onClick={() => setMode("signup")}
          >
            Cadastrar
          </button>
        ) : (
          <button
            type="button"
            className="link"
            onClick={() => setMode("login")}
          >
            Já tenho conta
          </button>
        )}
      </div>
    </div>
  );
}
