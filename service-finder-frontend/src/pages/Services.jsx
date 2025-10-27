import React from "react";
import "../styles/services.css";

export default function Services({ onBack }) {
    return (
    <div className="services-page">
      {/* Barra de busca */}
        <div className="topbar">
        <button className="icon-back" onClick={onBack} aria-label="Voltar">←</button>
        <div className="search">
            <input type="text" placeholder="Digite aqui o serviço que deseja procurar..." />
            <button className="icon-search" aria-label="Buscar">🔍</button>
        </div>
        </div>

      {/* Painel principal */}
        <div className="panel">
        {/* Filtro à esquerda */}
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

        {/* Lista de resultados à direita */}
        <section className="results">
          {/* Card 1 */}
            <article className="result-card">
            <div className="avatar">
                <div className="avatar-circle">
                <span className="avatar-initial">L</span>
                </div>
            </div>

            <div className="info">
                <div className="badge name">Leder</div>
                <div className="badge role">Serviços gerais</div>
                <div className="badge price">Valores a combinar</div>
                <div className="badge phone">51 9899-9899</div>
            </div>

            <div className="cta">
                <button className="btn-call">CHAMAR</button>
            </div>
            </article>

            {/* Card 2 */}
            <article className="result-card">
            <div className="avatar">
                <div className="avatar-circle">
                <span className="avatar-initial">A</span>
                </div>
            </div>

            <div className="info">
                <div className="badge name">Angélica</div>
                <div className="badge role">Eletricista</div>
                <div className="badge price">R$150</div>
                <div className="badge phone">51 9390-9899</div>
            </div>

            <div className="cta">
                <button className="btn-call">CHAMAR</button>
            </div>
            </article>

          {/* espaço para mais resultados... */}
            <div className="results-placeholder" />
        </section>
        </div>

      {/* rodapés simples como no mock */}
        <footer className="footer">
        <div className="brand">
            <span>SERV</span><br/><span>EASY</span>
        </div>
        <div className="contact">
            <span>serveasy@gmail.com</span>
            <span className="emoji">😊</span>
        </div>
        </footer>
    </div>
    );
}
