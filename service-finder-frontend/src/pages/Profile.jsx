import React, { useEffect, useState } from "react";
import "../styles/service.css";

export default function Profile({ onBack, apiBase = "http://localhost:8080/api/v1" }) {    // CHANGE API ENDPOINT IP
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const userId = localStorage.getItem("sf:userId");
        if (!userId) {
            setError("Usuário não identificado");
            setLoading(false);
            return;
        }
        async function load() {
            setLoading(true);
            try {
                const r = await fetch(`${apiBase}/me?userId=${userId}`);       
                const raw = await r.text();
                const j = raw ? JSON.parse(raw) : null;
                setData(j);
            } catch {
                setError("Falha ao carregar perfil");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [apiBase]);

    async function handleSave() {
        setMsg("");
        setError("");
        const userId = localStorage.getItem("sf:userId");
        if (!userId) {
            setError("Usuário não identificado");
            return;
        }
        setSaving(true);
        try {
            const r = await fetch(`${apiBase}/providers/profile?userId=${userId}`, {       
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bio: data.bio,
                    phone: data.phone,
                    expertise: data.expertise,
                    city: data.city,
                    district: data.district
                })
            });
            if (!r.ok) {
                setError("Falha ao salvar perfil");
                return;
            }
            setMsg("Perfil atualizado com sucesso");
        } catch {
            setError("Erro de conexão ao salvar perfil");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="service-page"><div className="badge name">Carregando...</div></div>;
    if (error) return <div className="service-page"><div className="badge name">{error}</div></div>;

    return (
        <div className="service-page">
            <div className="service-wrapper">
                <div className="service-topbar">
                    <button className="icon-back" onClick={onBack}>←</button>
                    <h1 className="service-title">Meu Perfil</h1>
                </div>

                <div className="service-card">
                    <div className="service-row">
                        <span className="service-label">Nome</span>
                        <span className="service-value">{data.name}</span>
                    </div>
                    <div className="service-row">
                        <span className="service-label">Email</span>
                        <span className="service-value">{data.email}</span>
                    </div>

                    <div className="service-row"><span className="service-label">Telefone</span>
                        <input type="text" value={data.phone || ""} onChange={e => setData({ ...data, phone: e.target.value })} />
                    </div>

                    <div className="service-row"><span className="service-label">Cidade</span>
                        <input type="text" value={data.city || ""} onChange={e => setData({ ...data, city: e.target.value })} />
                    </div>

                    <div className="service-row"><span className="service-label">Bairro</span>
                        <input type="text" value={data.district || ""} onChange={e => setData({ ...data, district: e.target.value })} />
                    </div>

                    <div className="service-row"><span className="service-label">Especialidade</span>
                        <input type="text" value={data.expertise || ""} onChange={e => setData({ ...data, expertise: e.target.value })} />
                    </div>

                    <div className="service-row"><span className="service-label">Bio</span>
                        <textarea value={data.bio || ""} onChange={e => setData({ ...data, bio: e.target.value })} />
                    </div>

                    {msg && <div className="booking-message">{msg}</div>}
                    {error && <div className="booking-error">{error}</div>}

                    <div className="booking-actions">
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
