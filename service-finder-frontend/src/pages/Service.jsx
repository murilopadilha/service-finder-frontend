// src/components/Service.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/service.css";

export default function Service({ id, onBack, apiBase = "http://10.62.14.40:8080/api/v1" }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setError("");
            setLoading(true);
            try {
                const r = await fetch(`${apiBase}/postings/${id}`);
                const raw = await r.text();
                const j = raw ? JSON.parse(raw) : null;
                if (!cancelled) setData(j);
            } catch {
                if (!cancelled) setError("Não foi possível carregar o serviço.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        if (id) load();
        return () => { cancelled = true; };
    }, [apiBase, id]);

    const vm = useMemo(() => {
        if (!data) return null;
        const title = data.Title ?? data.title ?? "";
        const desc = data.Description ?? data.description ?? "";
        const city = data.City ?? data.city ?? "";
        const district = data.District ?? data.district ?? "";
        const category = data.Category ?? data.category ?? "";
        const provider = data.ProviderName ?? data.providerName ?? "";
        const priceRaw = data.Price ?? data.price ?? 0;
        const priceVal = typeof priceRaw === "number" && priceRaw >= 1000 ? priceRaw / 100 : Number(priceRaw) || 0;
        const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceVal);
        const created = data.CreatedAt ?? data.createdAt ?? "";
        const updated = data.UpdatedAt ?? data.updatedAt ?? "";
        return { title, desc, city, district, category, provider, price, created, updated };
    }, [data]);

    return (
        <div className="service-page">
            <div className="service-wrapper">
                <div className="service-topbar">
                    <button className="icon-back" onClick={onBack} style={{color: "#000"}} aria-label="Voltar">←</button>
                    <h1 className="service-title">{vm?.title || "Serviço"}</h1>
                </div>

                <div className="service-content">
                    {loading && (
                        <div className="service-card">
                            <div className="service-row">Carregando...</div>
                        </div>
                    )}

                    {!!error && !loading && (
                        <div className="service-card">
                            <div className="service-row">{error}</div>
                        </div>
                    )}

                    {!loading && !error && vm && (
                        <div className="service-card">
                            <div className="service-row">
                                <span className="service-label">Prestador</span>
                                <span className="service-value">{vm.provider}</span>
                            </div>
                            <div className="service-row">
                                <span className="service-label">Categoria</span>
                                <span className="service-value">{vm.category}</span>
                            </div>
                            <div className="service-row">
                                <span className="service-label">Preço</span>
                                <span className="service-value">{vm.price}</span>
                            </div>
                            <div className="service-row">
                                <span className="service-label">Cidade</span>
                                <span className="service-value">{vm.city}</span>
                            </div>
                            <div className="service-row">
                                <span className="service-label">Bairro</span>
                                <span className="service-value">{vm.district}</span>
                            </div>
                            <div className="service-desc">
                                <h2>Descrição</h2>
                                <p>{vm.desc || "Sem descrição."}</p>
                            </div>
                            <div className="service-meta">
                                <span>Criado: {vm.created}</span>
                                <span>Atualizado: {vm.updated}</span>
                            </div>
                            <div className="service-cta">
                                <button className="btn-primary">Chamar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
