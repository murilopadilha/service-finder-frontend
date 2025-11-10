import React, { useEffect, useMemo, useState } from "react";
import "../styles/services.css";

export default function Services({ onBack, onOpen, apiBase = "http://10.62.14.40:8080/api/v1" }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [posts, setPosts] = useState([]);

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [minRating, setMinRating] = useState("");
    const [sortBy, setSortBy] = useState("relevance");

    const [visibleCount, setVisibleCount] = useState(10);
    const [sentinelRef, setSentinelRef] = useState(null);

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
            const district = p.district ?? p.District ?? "";
            const title = p.Title ?? p.title ?? p.Category ?? p.category ?? "";
            const name = p.ProviderName ?? p.providerName ?? p.ProviderID ?? p.providerId ?? "";
            const id = p.ID || p.id || Math.random().toString(36).slice(2);
            const category = p.category ?? p.Category ?? "";
            const desc = p.description ?? p.Description ?? "";
            const rating = typeof p.rating === "number"
                ? p.rating
                : typeof p.Rating === "number"
                    ? p.Rating
                    : 4.8; 

            return { id, price, priceValue: priceVal, city, district, title, name, category, desc, rating };
        });
    }, [posts]);

    const filteredSorted = useMemo(() => {
        let arr = normalized;

        const q = query.trim().toLowerCase();
        if (q) {
            arr = arr.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.desc.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q)
            );
        }

        if (category) {
            arr = arr.filter(item => item.category === category);
        }

        if (city.trim()) {
            const c = city.trim().toLowerCase();
            arr = arr.filter(item => item.city.toLowerCase().includes(c));
        }

        if (district.trim()) {
            const d = district.trim().toLowerCase();
            arr = arr.filter(item => item.district.toLowerCase().includes(d));
        }

        const min = priceMin !== "" ? Number(priceMin) : NaN;
        const max = priceMax !== "" ? Number(priceMax) : NaN;

        if (!Number.isNaN(min)) {
            arr = arr.filter(item => item.priceValue >= min);
        }
        if (!Number.isNaN(max)) {
            arr = arr.filter(item => item.priceValue <= max);
        }

        const minRate = minRating !== "" ? Number(minRating) : NaN;
        if (!Number.isNaN(minRate)) {
            arr = arr.filter(item => (item.rating ?? 0) >= minRate);
        }

        const sorted = [...arr];
        switch (sortBy) {
            case "price-asc":
                sorted.sort((a, b) => a.priceValue - b.priceValue);
                break;
            case "price-desc":
                sorted.sort((a, b) => b.priceValue - a.priceValue);
                break;
            case "rating":
                sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
                break;
            case "relevance":
            default:
                // mantém ordem original da API
                break;
        }

        return sorted;
    }, [normalized, query, category, city, district, priceMin, priceMax, minRating, sortBy]);

    useEffect(() => {
        setVisibleCount(10);
    }, [query, category, city, district, priceMin, priceMax, minRating, sortBy]);

    useEffect(() => {
        if (!sentinelRef) return;
        if (filteredSorted.length <= visibleCount) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => Math.min(prev + 10, filteredSorted.length));
            }
        });

        observer.observe(sentinelRef);
        return () => observer.disconnect();
    }, [sentinelRef, filteredSorted.length, visibleCount]);

    const visibleItems = filteredSorted.slice(0, visibleCount);

    return (
        <div className="services-page">
            <div className="services-wrapper">
                <div className="topbar">
                    <button className="icon-back" style={{ color: "#000" }} onClick={onBack} aria-label="Voltar">
                        ←
                    </button>

                    <div className="search">
                        <input
                            type="text"
                            style={{ color: "#000" }}
                            placeholder="Digite aqui o serviço que deseja procurar..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <button
                            className="icon-search"
                            aria-label="Buscar"
                            type="button"
                            onClick={() => setVisibleCount(10)}
                        >
                            🔍
                        </button>
                    </div>

                    <div className="sort">
                        <label htmlFor="sort">Ordenar por:</label>
                        <select
                            id="sort"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="relevance">Relevância</option>
                            <option value="price-asc">Menor preço</option>
                            <option value="price-desc">Maior preço</option>
                            <option value="rating">Melhor avaliação</option>
                        </select>
                    </div>
                </div>

                <div className="panel">
                    <aside className="filters">
                        <div className="filters-title">FILTRAR BUSCA</div>
                        <div className="filters-box">
                            <h4>Tipos de Serviço</h4>

                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === ""}
                                    onChange={() => setCategory("")}
                                />
                                Todos
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === "Serviços gerais"}
                                    onChange={() => setCategory("Serviços gerais")}
                                />
                                Serviços gerais
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === "Automação Residencial"}
                                    onChange={() => setCategory("Automação Residencial")}
                                />
                                Automação Residencial
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === "Carpinteiro"}
                                    onChange={() => setCategory("Carpinteiro")}
                                />
                                Carpinteiro
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === "Consultoria Financeira"}
                                    onChange={() => setCategory("Consultoria Financeira")}
                                />
                                Consultoria Financeira
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === "Designer Gráfico"}
                                    onChange={() => setCategory("Designer Gráfico")}
                                />
                                Designer Gráfico
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={category === "Eletricista"}
                                    onChange={() => setCategory("Eletricista")}
                                />
                                Eletricista
                            </label>

                            <h4 style={{ marginTop: 16 }}>Localização</h4>
                            <label>Cidade</label>
                            <input
                                type="text"
                                placeholder="Ex.: Porto Alegre"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                            />
                            <label>Bairro</label>
                            <input
                                type="text"
                                placeholder="Ex.: Centro"
                                value={district}
                                onChange={e => setDistrict(e.target.value)}
                            />

                            <h4 style={{ marginTop: 16 }}>Faixa de Preço (R$)</h4>
                            <div className="price-range">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Mín."
                                    value={priceMin}
                                    onChange={e => setPriceMin(e.target.value)}
                                />
                                <span>até</span>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Máx."
                                    value={priceMax}
                                    onChange={e => setPriceMax(e.target.value)}
                                />
                            </div>

                            <h4 style={{ marginTop: 16 }}>Avaliação mínima</h4>
                            <select
                                value={minRating}
                                onChange={e => setMinRating(e.target.value)}
                            >
                                <option value="">Qualquer</option>
                                <option value="3">3.0+</option>
                                <option value="4">4.0+</option>
                                <option value="4.5">4.5+</option>
                                <option value="5">5.0</option>
                            </select>
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

                        {!loading && !error && visibleItems.length === 0 && (
                            <article className="result-card">
                                <div className="info">
                                    <div className="badge name">Nenhum serviço encontrado</div>
                                </div>
                            </article>
                        )}

                        {!loading && !error && visibleItems.map(item => (
                            <article
                                className="result-card"
                                key={item.id}
                                onClick={() => onOpen(item.id)}
                            >
                                <div className="avatar">
                                    <div className="avatar-circle">
                                        <span className="avatar-initial">
                                            {String(item.name || "?").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="badge name">{item.name}</div>
                                    <div className="badge role">{item.title}</div>
                                    <div className="badge price">{item.price}</div>
                                    <div className="badge phone">
                                        {item.city}
                                        {item.district ? ` - ${item.district}` : ""}
                                    </div>
                                    {item.rating && (
                                        <div className="badge rating">⭐ {item.rating.toFixed(1)}</div>
                                    )}
                                </div>
                                <div className="cta">
                                    <button
                                        className="btn-call"
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            onOpen(item.id);
                                        }}
                                    >
                                        VER DETALHES
                                    </button>
                                </div>
                            </article>
                        ))}

                        <div ref={setSentinelRef} className="results-sentinel" />
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
