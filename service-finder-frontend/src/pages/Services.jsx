// src/components/Services.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/services.css";

export default function Services({ onBack, onOpen, apiBase = "http://10.62.14.40:8080/api/v1" }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setError("");
            setLoading(true);
            try {
                const r = await fetch(`${apiBase}/postings`);
                const raw = await r.text();
                const data = raw ? JSON.parse(raw) : [];
                const arr = Array.isArray(data) ? data : data?.content || [];
                if (!cancelled) setPosts(arr);
            } catch {
                if (!cancelled) setError("Não foi possível carregar os serviços.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [apiBase]);

    const normalized = useMemo(() => {
        return posts.map(p => {
            const priceRaw = p.price ?? p.Price ?? 0;
            const priceVal = typeof priceRaw === "number" && priceRaw >= 1000 ? priceRaw / 100 : Number(priceRaw) || 0;
            const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceVal);
            const city = p.city ?? p.City ?? "";
            const title = p.Title ?? p.title ?? p.Category ?? p.category ?? "";
            const name = p.ProviderName ?? p.providerName ?? p.ProviderID ?? p.providerId ?? "";
            const id = p.ID || p.id || Math.random().toString(36).slice(2);
            return { id, price, city, title, name };
        });
    }, [posts]);

    return (
        <div className="services-page">
            <div className="services-wrapper">
                <div className="topbar">
                    <button className="icon-back" style={{color: "#000"}} onClick={onBack} aria-label="Voltar">←</button>
                    <div className="search">
                        <input
                            type="text"
                            style={{ color: "#000" }}
                            placeholder="Digite aqui o serviço que deseja procurar..."
                        />
                        <button className="icon-search" aria-label="Buscar">🔍</button>
                    </div>
                </div>

                <div className="panel">
                    <aside className="filters">
                        <div className="filters-title">FILTRAR BUSCA</div>
                        <div className="filters-box">
                            <h4>Tipos de Serviço</h4>
                            <label><input type="checkbox" /> Serviços gerais</label>
                            <label><input type="checkbox" /> Automação Residencial</label>
                            <label><input type="checkbox" /> Carpinteiro</label>
                            <label><input type="checkbox" /> Consultoria Financeira</label>
                            <label><input type="checkbox" /> Designer Gráfico</label>
                            <label><input type="checkbox" /> Eletricista</label>

                            <h4 style={{ marginTop: 16 }}>Faixa de Preço</h4>
                            <label><input type="checkbox" /> $</label>
                            <label><input type="checkbox" /> $$</label>
                            <label><input type="checkbox" /> $$$</label>
                            <label><input type="checkbox" /> $$$$</label>
                            <label><input type="checkbox" /> A combinar com o prestador</label>
                        </div>
                    </aside>

                    <section className="results">
                        {loading && (
                            <article className="result-card">
                                <div className="info">
                                    <div className="badge name">Carregando...</div>
                                </div>
                            </article>
                        )}

                        {!!error && !loading && (
                            <article className="result-card">
                                <div className="info">
                                    <div className="badge name">{error}</div>
                                </div>
                            </article>
                        )}

                        {!loading && !error && normalized.length === 0 && (
                            <article className="result-card">
                                <div className="info">
                                    <div className="badge name">Nenhum serviço encontrado</div>
                                </div>
                            </article>
                        )}

                        {!loading && !error && normalized.map(item => (
                            <article className="result-card" key={item.id}>
                                <div className="avatar">
                                    <div className="avatar-circle">
                                        <span className="avatar-initial">{String(item.name || "?").charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="badge name">{item.name}</div>
                                    <div className="badge role">{item.title}</div>
                                    <div className="badge price">{item.price}</div>
                                    <div className="badge phone">{item.city}</div>
                                </div>
                                <div className="cta">
                                    <button className="btn-call" onClick={() => onOpen(item.id)}>CHAMAR</button>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>

                <footer className="footer">
                    <div className="brand">
                        <span>SERV</span><br /><span>EASY</span>
                    </div>
                    <div className="contact">
                        <span>serveasy@gmail.com</span>
                        <span className="emoji">😊</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
