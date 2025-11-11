import React, { useEffect, useMemo, useState } from "react";
import "../styles/services.css";

export default function Services({onBack, onOpenService, onOpenMyServices, onOpenProfile, apiBase = "http://localhost:8080/api/v1"}) {  // CHANGE API ENDPOINT IP
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [posts, setPosts] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");
    const [sortBy, setSortBy] = useState("relevance");

    const [page, setPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setError("");
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search.trim()) params.set("q", search.trim());
                if (city.trim()) params.set("city", city.trim());
                if (category.trim()) params.set("category", category.trim());
                if (district.trim()) params.set("district", district.trim());
                if (minPrice) params.set("price_min", String(Number(minPrice) || 0));
                if (maxPrice) params.set("price_max", String(Number(maxPrice) || 0));
                if (minRating) params.set("rating_min", String(Number(minRating) || 0));
                if (sortBy === "price-asc") {
                    params.set("sort", "price");
                    params.set("order", "asc");
                } else if (sortBy === "price-desc") {
                    params.set("sort", "price");
                    params.set("order", "desc");
                } else if (sortBy === "rating-desc") {
                    params.set("sort", "rating");
                    params.set("order", "desc");
                }
                const qs = params.toString();
                const url = qs ? `${apiBase}/postings?${qs}` : `${apiBase}/postings`;
                const r = await fetch(url);
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
        return () => {
            cancelled = true;
        };
    }, [apiBase, search, city, category, district, minPrice, maxPrice, minRating, sortBy]);

    const normalized = useMemo(() => {
        return posts.map(p => {
            const priceRaw = p.price ?? p.Price ?? 0;
            const priceNumber = Number(priceRaw) || 0;
            const priceLabel = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceNumber);
            const title = p.Title ?? p.title ?? "";
            const description = p.Description ?? p.description ?? "";
            const city = p.City ?? p.city ?? "";
            const district = p.District ?? p.district ?? "";
            const category = p.Category ?? p.category ?? "";
            const rating = p.Rating ?? p.rating ?? 0;
            const createdAt = p.CreatedAt ?? p.createdAt ?? "";
            const createdTime = createdAt ? Date.parse(createdAt) || 0 : 0;
            const id = p.ID || p.id || Math.random().toString(36).slice(2);
            const providerId = p.ProviderID ?? p.providerId ?? "";
            return { id, title, description, city, district, category, priceNumber, priceLabel, rating, createdTime, providerId };
        });
    }, [posts]);

    const filteredSorted = useMemo(() => {
        let arr = normalized;

        if (minRating) {
            const minR = Number(minRating) || 0;
            arr = arr.filter(n => (n.rating || 0) >= minR);
        }

        const q = search.trim().toLowerCase();

        const withScore = arr.map(n => {
            let score = 0;
            if (q) {
                const t = n.title.toLowerCase();
                const d = n.description.toLowerCase();
                if (t.startsWith(q)) score += 40;
                if (t.includes(q)) score += 25;
                if (d.includes(q)) score += 15;
            }
            score += (n.rating || 0) * 10;
            score += n.createdTime / 1000000000000;
            return { ...n, score };
        });

        const sorted = [...withScore].sort((a, b) => {
            if (sortBy === "price-asc") {
                return a.priceNumber - b.priceNumber;
            }
            if (sortBy === "price-desc") {
                return b.priceNumber - a.priceNumber;
            }
            if (sortBy === "rating-desc") {
                return (b.rating || 0) - (a.rating || 0);
            }
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.createdTime - a.createdTime;
        });

        return sorted;
    }, [normalized, search, minRating, sortBy]);

    const visible = useMemo(() => {
        return filteredSorted.slice(0, page * pageSize);
    }, [filteredSorted, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [search, city, category, district, minPrice, maxPrice, minRating, sortBy]);

    useEffect(() => {
        function onScroll() {
            if (filteredSorted.length === 0) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
                setPage(prev => {
                    const maxPage = Math.ceil(filteredSorted.length / pageSize);
                    if (prev >= maxPage) return prev;
                    return prev + 1;
                });
            }
        }
        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [filteredSorted.length, pageSize]);

    return (
        <div className="services-page">
            <div className="services-wrapper">
                <div className="topbar">
                    <button className="icon-back" onClick={onBack}>←</button>
                    <div className="nav-buttons">
                        <button className="btn-nav" onClick={onOpenMyServices}>Meus serviços</button>
                        <button className="btn-nav" onClick={onOpenProfile}>Meu perfil</button>
                    </div>
                    <div className="search">
                        <input
                            type="text"
                            placeholder="Digite aqui o serviço que deseja procurar..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button className="icon-search">🔍</button>
                    </div>
                </div>

                <div className="panel">
                    <aside className="filters">
                        <div className="filters-title">FILTRAR BUSCA</div>
                        <div className="filters-box">
                            <div className="filters-field">
                                <span className="filters-label">Categoria</span>
                                <input
                                    type="text"
                                    placeholder="Ex: Eletricista"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                />
                            </div>

                            <div className="filters-field">
                                <span className="filters-label">Cidade</span>
                                <input
                                    type="text"
                                    placeholder="Ex: Porto Alegre"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                />
                            </div>

                            <div className="filters-field">
                                <span className="filters-label">Bairro</span>
                                <input
                                    type="text"
                                    placeholder="Ex: Centro"
                                    value={district}
                                    onChange={e => setDistrict(e.target.value)}
                                />
                            </div>

                            <div className="filters-range-row">
                                <div className="filters-field">
                                    <span className="filters-label">Preço mín. (R$)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)}
                                    />
                                </div>
                                <div className="filters-field">
                                    <span className="filters-label">Preço máx. (R$)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="filters-field">
                                <span className="filters-label">Nota mínima</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={minRating}
                                    onChange={e => setMinRating(e.target.value)}
                                />
                            </div>

                            <div className="filters-field">
                                <span className="filters-label">Ordenar por</span>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="relevance">Relevância</option>
                                    <option value="price-asc">Preço: menor para maior</option>
                                    <option value="price-desc">Preço: maior para menor</option>
                                    <option value="rating-desc">Melhor avaliação</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    <section className="results">
                        <div className="results-header">
                            <div className="results-count">
                                {filteredSorted.length === 0
                                    ? "Nenhum serviço encontrado"
                                    : `Mostrando ${visible.length} de ${filteredSorted.length} serviços`}
                            </div>
                        </div>

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

                        {!loading && !error && visible.map(item => (
                            <article className="result-card" key={item.id}>
                                <div className="avatar">
                                    <div className="avatar-circle">
                                        <span className="avatar-initial">
                                            {String(item.title || "?").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="badge name">{item.title}</div>
                                    <div className="badge role">{item.category || "Serviço"}</div>
                                    <div className="badge price">{item.priceLabel}</div>
                                    <div className="badge phone">
                                        {item.city}
                                        {item.district ? ` • ${item.district}` : ""}
                                    </div>
                                </div>
                                <div className="cta">
                                    <button
                                        className="btn-call"
                                        onClick={() => onOpenService && onOpenService(item.id)}
                                    >
                                        VER DETALHES
                                    </button>
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
