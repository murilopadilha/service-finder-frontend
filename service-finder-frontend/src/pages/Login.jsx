import React, { useState } from "react";
import "../styles/login.css";

const DEV_BYPASS_AUTH = true; // <- enquanto a API não funciona, deixa true

export default function Login({ onLogin, apiBase = "/api/v1" }) {
    const [mode, setMode] = useState("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isLogin = mode === "login";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("provider");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // MODO DEV: ignora API e entra direto na aplicação
        if (DEV_BYPASS_AUTH) {
            onLogin?.();
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const res = await req(`http://10.62.14.40:8080/api/v1/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await safeJson(res);
                if (!res.ok) throw new Error(msgFrom(res.status, data) || "Falha no login");

                const userId = data?.userId || data?.id || data?.user?.id;
                if (userId) localStorage.setItem("sf:userId", String(userId));
                onLogin?.();
            } else {
                const res = await req(`http://10.62.14.40:8080/api/v1/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, role }),
                });

                const data = await safeJson(res);
                if (!res.ok) throw new Error(msgFrom(res.status, data) || "Falha no cadastro");

                const resLogin = await req(`${apiBase}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const dataLogin = await safeJson(resLogin);
                if (!resLogin.ok) {
                    onLogin?.();
                    return;
                }
                const userId = dataLogin?.userId || dataLogin?.id || dataLogin?.user?.id;
                if (userId) localStorage.setItem("sf:userId", String(userId));
                onLogin?.();
            }
        } catch (err) {
            setError(humanizeErr(err));
        } finally {
            setLoading(false);
        }
    }

    async function req(url, options, timeoutMs = 12000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            return res;
        } catch (e) {
            if (e.name === "AbortError") {
                throw new Error("Tempo de requisição excedido. Tente novamente.");
            }
            throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão ou CORS.");
        } finally {
            clearTimeout(id);
        }
    }

    async function safeJson(res) {
        try {
            const txt = await res.text();
            if (!txt) return {};
            try {
                return JSON.parse(txt);
            } catch {
                return { message: txt };
            }
        } catch {
            return {};
        }
    }

    function msgFrom(status, data) {
        const backendMsg = data?.message || data?.error;
        if (backendMsg && String(backendMsg).trim()) return backendMsg;
        switch (status) {
            case 400: return "Dados inválidos. Confira os campos.";
            case 401: return "Credenciais incorretas.";
            case 403: return "Acesso negado.";
            case 404: return "Endpoint não encontrado.";
            case 409: return "Registro em conflito (talvez email já utilizado).";
            case 422: return "Dados incompletos/ inválidos.";
            default:
                if (status >= 500) return "Erro no servidor. Tente novamente em instantes.";
                return "";
        }
    }

    function humanizeErr(err) {
        const msg = err?.message || "Algo deu errado";
        return msg.replace(/\s*\(HTTP\s*\d+\)\s*$/i, "").trim();
    }

    return (
        <div className="page">
            <div className="container">
                <div className="auth-card">
                    <h1 className="title">SERV EASY</h1>

                    <div className="icon-wrap" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            className="user-icon" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                            <path d="M3 20a9 9 0 0 1 18 0" />
                        </svg>
                    </div>

                    <form onSubmit={handleSubmit} className="form" noValidate>
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="nome">Nome</label>
                                <input
                                    id="nome"
                                    type="text"
                                    placeholder="Seu nome"
                                    required
                                    className="input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                minLength={8}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {!isLogin && (
                            <fieldset className="form-group" style={{ border: "none", padding: 0, margin: 0 }}>
                                <legend style={{ fontSize: 14, marginBottom: 6 }}>Tipo de conta</legend>

                                <label htmlFor="role-provider" style={{ display: "block", marginBottom: 4 }}>
                                    <input
                                        id="role-provider"
                                        type="radio"
                                        name="role"
                                        value="provider"
                                        checked={role === "provider"}
                                        onChange={() => setRole("provider")}
                                        style={{ marginRight: 8 }}
                                    />
                                    Estou prestando serviços
                                </label>

                                <label htmlFor="role-customer" style={{ display: "block" }}>
                                    <input
                                        id="role-customer"
                                        type="radio"
                                        name="role"
                                        value="customer"
                                        checked={role === "user"}
                                        onChange={() => setRole("user")}
                                        style={{ marginRight: 8 }}
                                    />
                                    Estou buscando serviços
                                </label>
                            </fieldset>
                        )}

                        {error && (
                            <p className="error" style={{ color: "#b91c1c", marginTop: 8 }} aria-live="polite">
                                {error}
                            </p>
                        )}

                        <div className="actions">
                            <button type="submit" disabled={loading} className="btn-submit">
                                {loading ? "Enviando..." : isLogin ? "ENTRAR" : "CADASTRAR"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="switch">
                    {isLogin ? (
                        <button type="button" className="link" onClick={() => setMode("signup")} disabled={loading}>
                            Cadastrar
                        </button>
                    ) : (
                        <button type="button" className="link" onClick={() => setMode("login")} disabled={loading}>
                            Já tenho conta
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
