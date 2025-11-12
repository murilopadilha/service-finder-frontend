import React, { useEffect, useMemo, useState } from "react";
import "../styles/service.css";

export default function Service({ id, onBack, apiBase = "http://10.49.82.111:8080/api/v1" }) {    // CHANGE API ENDPOINT IP
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [posting, setPosting] = useState(null);
    const [provider, setProvider] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [order, setOrder] = useState(null);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState("");
    const [history, setHistory] = useState([]);

    const [requestDate, setRequestDate] = useState("");
    const [requestTime, setRequestTime] = useState("");
    const [acceptDate, setAcceptDate] = useState("");
    const [acceptTime, setAcceptTime] = useState("");

    const [flashMessage, setFlashMessage] = useState("");

    function getUid() {
        return localStorage.getItem("sf:userId") || "";
    }

    useEffect(() => {
        let cancelled = false;
        async function loadPosting() {
            setLoading(true);
            setError("");
            try {
                const r = await fetch(`${apiBase}/postings/${id}`);       
                const raw = await r.text();
                const j = raw ? JSON.parse(raw) : null;
                if (!cancelled) setPosting(j);
            } catch {
                if (!cancelled) setError("Não foi possível carregar o serviço.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        if (id) loadPosting();
        return () => {
            cancelled = true;
        };
    }, [apiBase, id]);

    useEffect(() => {
        let cancelled = false;
        async function loadProviderAndUser() {
            try {
                const providerId = posting?.ProviderID ?? posting?.providerId;
                if (providerId && !cancelled) {
                    try {
                        const r = await fetch(`${apiBase}/me?userId=${encodeURIComponent(providerId)}`);    
                        const raw = await r.text();
                        const j = raw ? JSON.parse(raw) : null;
                        if (!cancelled) setProvider(j);
                    } catch {
                    }
                }
                const uid = localStorage.getItem("sf:userId");
                if (uid && !cancelled) {
                    try {
                        const r = await fetch(`${apiBase}/me?userId=${encodeURIComponent(uid)}`);   
                        const raw = await r.text();
                        const j = raw ? JSON.parse(raw) : null;
                        if (!cancelled) setCurrentUser(j);
                    } catch {
                    }
                }
            } catch {
            }
        }
        if (posting) loadProviderAndUser();
        return () => {
            cancelled = true;
        };
    }, [apiBase, posting]);

    useEffect(() => {
        let cancelled = false;
        async function loadExistingOrder() {
            try {
                const r = await fetch(`${apiBase}/orders/mine`);   
                const raw = await r.text();
                const data = raw ? JSON.parse(raw) : [];
                const arr = Array.isArray(data) ? data : data?.content || [];
                const found = arr.find(o => {
                    const pid = o.PostingID ?? o.postingId;
                    return pid === id;
                });
                if (found && !cancelled) {
                    setOrder(found);
                    const status = normalizeStatus(found.Status ?? found.status);
                    const created = found.CreatedAt ?? found.createdAt;
                    setHistory([{ status, at: created, note: "Pedido criado" }]);
                }
            } catch {
            }
        }
        if (id) loadExistingOrder();
        return () => {
            cancelled = true;
        };
    }, [apiBase, id]);

    const vmPosting = useMemo(() => {
        if (!posting) return null;
        const title = posting.Title ?? posting.title ?? "";
        const desc = posting.Description ?? posting.description ?? "";
        const postingId = posting.postingId;
        const providerId = posting.provierId;
        const city = posting.City ?? posting.city ?? "";
        const district = posting.District ?? posting.district ?? "";
        const category = posting.Category ?? posting.category ?? "";
        const priceRaw = posting.Price ?? posting.price ?? 0;
        const priceVal = Number(priceRaw) || 0;
        const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceVal);
        const created = posting.CreatedAt ?? posting.createdAt ?? "";
        const updated = posting.UpdatedAt ?? posting.updatedAt ?? "";
        return { title, desc, city, district, category, price, created, updated, postingId, providerId };
    }, [posting]);

    const vmProvider = useMemo(() => {
        if (!provider) return null;
        const name = provider.name ?? provider.fullName ?? provider.username ?? "";
        const phone = provider.phone ?? "";
        const city = provider.city ?? "";
        const district = provider.district ?? "";
        const expertise = provider.expertise ?? provider.role ?? "";
        const bio = provider.bio ?? "";
        return { name, phone, city, district, expertise, bio };
    }, [provider]);

    const currentRole = useMemo(() => {
        if (!currentUser) return "customer";
        const roleRaw = currentUser.role ?? currentUser.Role ?? "";
        const role = String(roleRaw).toLowerCase();
        if (role === "provider") return "provider";
        return "customer";
    }, [currentUser]);

    const orderStatusRaw = useMemo(() => {
        if (!order) return null;
        return order.Status ?? order.status ?? null;
    }, [order]);

    const orderStatus = useMemo(() => {
        return normalizeStatus(orderStatusRaw);
    }, [orderStatusRaw]);

    const scheduledAt = useMemo(() => {
        if (!order) return null;
        const s = order.ScheduledAt ?? order.scheduledAt ?? null;
        return s;
    }, [order]);

    function normalizeStatus(status) {
        if (!status) return null;
        const s = String(status).toUpperCase();
        if (s === "PENDENTE" || s === "PENDING") return "PENDENTE";
        if (s === "ACEITO" || s === "ACCEPTED" || s === "ACEITO_PELO_PRESTADOR") return "ACEITO";
        if (s === "EM_ANDAMENTO" || s === "IN_PROGRESS") return "EM_ANDAMENTO";
        if (s === "CONCLUIDO" || s === "COMPLETED") return "CONCLUIDO";
        if (s === "CANCELADO" || s === "CANCELLED") return "CANCELADO";
        return s;
    }

    function statusClassName(status) {
        if (!status) return "";
        return `status-${status.toLowerCase()}`;
    }

    function pushHistory(status, note) {
        const at = new Date().toISOString();
        setHistory(prev => [...prev, { status, at, note }]);
    }

    async function handleCreateOrder(e) {
    e.preventDefault();
    setOrderError("");
    setFlashMessage("");
    if (!posting) return;

    const uid = getUid();
    if (!uid) {
        setOrderError("Usuário não identificado. Faça login novamente.");
        return;
    }

    const providerId = posting.ProviderID ?? posting.providerId;
    if (!providerId) {
        setOrderError("Não foi possível identificar o prestador.");
        return;
    }

    setOrderLoading(true);
    try {
        const body = {
            postingId: posting.ID,
            providerId: posting.ProviderID
        };
        const r = await fetch(`${apiBase}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body)
        });
        console.log(body)
        const raw = await r.text();
        const j = raw ? JSON.parse(raw) : null;
        if (!r.ok) {
            setOrderError(j?.message || "Falha ao criar pedido.");
            return;
        }
        setOrder(j);
        const status = normalizeStatus(j.Status ?? j.status ?? "PENDENTE");
        pushHistory(status, "Pedido criado");
        setFlashMessage("Pedido criado com sucesso. Aguarde o prestador aceitar.");
    } catch {
        setOrderError("Erro de conexão ao criar pedido.");
    } finally {
        setOrderLoading(false);
    }
}

    async function reloadOrderById(orderId) {
        try {
            const r = await fetch(`${apiBase}/orders/${orderId}`);     
            const raw = await r.text();
            const j = raw ? JSON.parse(raw) : null;
            setOrder(j);
            const status = normalizeStatus(j.Status ?? j.status ?? "");
            pushHistory(status, "");
        } catch {
        }
    }

    function buildIsoFromLocal(dateStr, timeStr) {
        if (!dateStr || !timeStr) return null;
        const iso = new Date(`${dateStr}T${timeStr}:00`).toISOString();
        return iso;
    }

    async function handleAcceptOrder() {
        if (!order) return;
        setOrderError("");
        setFlashMessage("");
        const iso = buildIsoFromLocal(acceptDate, acceptTime);
        if (!iso) {
            setOrderError("Informe data e horário para aceitar o pedido.");
            return;
        }
        setOrderLoading(true);
        try {
            const r = await fetch(`${apiBase}/orders/${order.ID ?? order.id}/accept`, {       
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scheduledAt: iso })
            });
            if (!r.ok) {
                setOrderError("Falha ao aceitar o pedido.");
                return;
            }
            await reloadOrderById(order.ID ?? order.id);
            setFlashMessage("Pedido aceito com sucesso.");
        } catch {
            setOrderError("Erro de conexão ao aceitar pedido.");
        } finally {
            setOrderLoading(false);
        }
    }

    async function handleStartOrder() {
        if (!order) return;
        setOrderError("");
        setFlashMessage("");
        setOrderLoading(true);
        try {
            const r = await fetch(`${apiBase}/orders`, {       
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postingId: vmPosting.postingId, providerId: vmPosting.providerId })
            });
            if (!r.ok) {
                setOrderError("Falha ao iniciar o pedido.");
                return;
            }
            await reloadOrderById(order.ID ?? order.id);
            setFlashMessage("Pedido iniciado.");
        } catch {
            setOrderError("Erro de conexão ao iniciar pedido.");
        } finally {
            setOrderLoading(false);
        }
    }

    async function handleCancelOrder() {
        if (!order) return;
        setOrderError("");
        setFlashMessage("");
        setOrderLoading(true);
        try {
            const r = await fetch(`${apiBase}/orders/${order.ID ?? order.id}/cancel`, {     
                method: "POST"
            });
            if (!r.ok) {
                setOrderError("Falha ao cancelar o pedido.");
                return;
            }
            await reloadOrderById(order.ID ?? order.id);
            setFlashMessage("Pedido cancelado.");
        } catch {
            setOrderError("Erro de conexão ao cancelar pedido.");
        } finally {
            setOrderLoading(false);
        }
    }

    async function handleCompleteOrder() {
        if (!order) return;
        setOrderError("");
        setFlashMessage("");
        setOrderLoading(true);
        try {
            const r = await fetch(`${apiBase}/orders/${order.ID ?? order.id}/complete`, {       
                method: "POST"
            });
            if (!r.ok) {
                setOrderError("Falha ao concluir o pedido.");
                return;
            }
            await reloadOrderById(order.ID ?? order.id);
            setFlashMessage("Pedido concluído.");
        } catch {
            setOrderError("Erro de conexão ao concluir pedido.");
        } finally {
            setOrderLoading(false);
        }
    }

    const canCustomerCancel = useMemo(() => {
        if (!orderStatus) return false;
        const s = orderStatus;
        if (s === "PENDENTE" || s === "ACEITO") return true;
        return false;
    }, [orderStatus]);

    const canProviderAccept = useMemo(() => {
        if (!orderStatus) return false;
        return orderStatus === "PENDENTE";
    }, [orderStatus]);

    const canProviderStart = useMemo(() => {
        if (!orderStatus) return false;
        return orderStatus === "ACEITO";
    }, [orderStatus]);

    const canProviderComplete = useMemo(() => {
        if (!orderStatus) return false;
        return orderStatus === "EM_ANDAMENTO";
    }, [orderStatus]);

    return (
        <div className="service-page">
            <div className="service-wrapper">
                <div className="service-topbar">
                    <button className="icon-back" onClick={onBack} aria-label="Voltar">←</button>
                    <h1 className="service-title">{vmPosting?.title || "Serviço"}</h1>
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

                    {!loading && !error && vmPosting && (
                        <>
                            <div className="service-card">
                                <div className="service-row">
                                    <span className="service-label">Prestador</span>
                                    <span className="service-value">{vmProvider?.name || "Prestador"}</span>
                                </div>
                                <div className="service-row">
                                    <span className="service-label">Categoria</span>
                                    <span className="service-value">{vmPosting.category}</span>
                                </div>
                                <div className="service-row">
                                    <span className="service-label">Preço</span>
                                    <span className="service-value">{vmPosting.price}</span>
                                </div>
                                <div className="service-row">
                                    <span className="service-label">Cidade</span>
                                    <span className="service-value">
                                        {vmPosting.city}
                                        {vmPosting.district ? ` • ${vmPosting.district}` : ""}
                                    </span>
                                </div>
                                <div className="service-desc">
                                    <h2>Descrição</h2>
                                    <p>{vmPosting.desc || "Sem descrição."}</p>
                                </div>
                                {vmProvider && (
                                    <div className="service-desc">
                                        <h2>Perfil do prestador</h2>
                                        <p><strong>Nome:</strong> {vmProvider.name}</p>
                                        {vmProvider.phone && <p><strong>Telefone:</strong> {vmProvider.phone}</p>}
                                        {vmProvider.expertise && <p><strong>Especialidade:</strong> {vmProvider.expertise}</p>}
                                        {(vmProvider.city || vmProvider.district) && (
                                            <p>
                                                <strong>Localização:</strong> {vmProvider.city}
                                                {vmProvider.district ? ` • ${vmProvider.district}` : ""}
                                            </p>
                                        )}
                                        {vmProvider.bio && <p>{vmProvider.bio}</p>}
                                    </div>
                                )}
                                <div className="service-meta">
                                    <span>Criado: {vmPosting.created}</span>
                                    <span>Atualizado: {vmPosting.updated}</span>
                                </div>
                            </div>

                            <div className="booking-card">
                                <h2 className="booking-title">Agendamento e acompanhamento</h2>

                                {!order && (
                                    <form className="booking-form" onSubmit={handleCreateOrder}>
                                        <div className="booking-grid">
                                            <div className="booking-field">
                                                <label>Data desejada</label>
                                                <input
                                                    type="date"
                                                    value={requestDate}
                                                    onChange={e => setRequestDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="booking-field">
                                                <label>Horário desejado</label>
                                                <input
                                                    type="time"
                                                    value={requestTime}
                                                    onChange={e => setRequestTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {orderError && (
                                            <div className="booking-error">{orderError}</div>
                                        )}
                                        <div className="booking-actions">
                                            <button type="submit" className="btn-primary" disabled={orderLoading}>
                                                {orderLoading ? "Enviando..." : "Solicitar serviço"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {order && (
                                    <div className="booking-status-block">
                                        <div className="booking-status-line">
                                            <span className="booking-status-label">Status atual:</span>
                                            <span className={`status-pill ${statusClassName(orderStatus)}`}>
                                                {orderStatus}
                                            </span>
                                        </div>

                                        {scheduledAt && (
                                            <div className="booking-status-line">
                                                <span className="booking-status-label">Agendado para:</span>
                                                <span className="service-value">{scheduledAt}</span>
                                            </div>
                                        )}

                                        {currentRole === "provider" && (
                                            <div className="booking-grid" style={{ marginTop: 10 }}>
                                                <div className="booking-field">
                                                    <label>Data agendada</label>
                                                    <input
                                                        type="date"
                                                        value={acceptDate}
                                                        onChange={e => setAcceptDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="booking-field">
                                                    <label>Horário agendado</label>
                                                    <input
                                                        type="time"
                                                        value={acceptTime}
                                                        onChange={e => setAcceptTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {orderError && (
                                            <div className="booking-error">{orderError}</div>
                                        )}
                                        {flashMessage && (
                                            <div className="booking-message">{flashMessage}</div>
                                        )}

                                        <div className="booking-actions-row">
                                            {currentRole === "provider" && canProviderAccept && (
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    disabled={orderLoading}
                                                    onClick={handleAcceptOrder}
                                                >
                                                    Aceitar
                                                </button>
                                            )}
                                            {currentRole === "provider" && canProviderStart && (
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    disabled={orderLoading}
                                                    onClick={handleStartOrder}
                                                >
                                                    Iniciar
                                                </button>
                                            )}
                                            {currentRole === "provider" && canProviderComplete && (
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    disabled={orderLoading}
                                                    onClick={handleCompleteOrder}
                                                >
                                                    Concluir
                                                </button>
                                            )}
                                            {canCustomerCancel && (
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    disabled={orderLoading}
                                                    onClick={handleCancelOrder}
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>

                                        {history.length > 0 && (
                                            <div className="booking-history">
                                                <h3>Histórico do pedido</h3>
                                                <ul>
                                                    {history.map((h, idx) => (
                                                        <li key={idx}>
                                                            <span className="booking-history-status">{h.status}</span>
                                                            <span className="booking-history-time">{h.at}</span>
                                                            {h.note && (
                                                                <span className="booking-history-note">
                                                                    {h.note}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
