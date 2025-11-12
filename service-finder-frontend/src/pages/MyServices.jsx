import React, { useEffect, useMemo, useState } from "react";
import "../styles/services.css";

export default function MyServices({ onBack, apiBase = "http://10.49.82.111:8080/api/v1" }) {     // CHANGE API ENDPOINT IP
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const userId = localStorage.getItem("sf:userId");
        if (!userId) {
            setError("Usuário não identificado");
            setLoading(false);
            return;
        }
        let cancelled = false;
        async function load() {
            setError("");
            setLoading(true);
            try {
                const r = await fetch(`${apiBase}/postings/mine?userId=${userId}`);    
                const raw = await r.text();
                const data = raw ? JSON.parse(raw) : [];
                const arr = Array.isArray(data) ? data : data?.content || [];
                if (!cancelled) setPosts(arr);
            } catch {
                if (!cancelled) setError("Erro ao carregar serviços do usuário");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true };
    }, [apiBase]);

    const normalized = useMemo(() => {
        return posts.map(p => ({
            id: p.ID || p.id,
            title: p.Title ?? p.title,
            category: p.Category ?? p.category,
            city: p.City ?? p.city,
            price: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.Price ?? p.price ?? 0)
        }));
    }, [posts]);

    return (
        <div className="services-page">
            <div className="services-wrapper">
                <div className="topbar">
                    <button className="icon-back" onClick={onBack}>←</button>
                    <h1 style={{ color: "#fff" }}>Meus Serviços</h1>
                </div>

                <div className="panel">
                    <section className="results" style={{ gridColumn: "1 / -1" }}>
                        {loading && <div className="badge name">Carregando...</div>}
                        {error && <div className="badge name">{error}</div>}
                        {!loading && !error && normalized.length === 0 && (
                            <div className="badge name">Nenhum serviço cadastrado</div>
                        )}
                        {normalized.map(s => (
                            <article key={s.id} className="result-card">
                                <div className="info">
                                    <div className="badge name">{s.title}</div>
                                    <div className="badge role">{s.category}</div>
                                    <div className="badge phone">{s.city}</div>
                                    <div className="badge price">{s.price}</div>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}
