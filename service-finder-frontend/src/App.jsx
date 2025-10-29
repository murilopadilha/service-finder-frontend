import React, { useState } from "react";
import Login from "./pages/Login.jsx";
import Services from "./pages/Services.jsx";
import Service from "./pages/Service.jsx";

export default function App() {
    const [screen, setScreen] = useState("login");
    const [selectedId, setSelectedId] = useState(null);

    const handleLogin = () => setScreen("services");
    const handleBackToLogin = () => setScreen("login");
    const handleOpenService = (id) => {
        setSelectedId(id);
        setScreen("service");
    };
    const handleBackToServices = () => setScreen("services");

    if (screen === "login") return <Login onLogin={handleLogin} />;
    if (screen === "services") return <Services onBack={handleBackToLogin} onOpen={handleOpenService} />;
    if (screen === "service") return <Service id={selectedId} onBack={handleBackToServices} />;
    return null;
}
