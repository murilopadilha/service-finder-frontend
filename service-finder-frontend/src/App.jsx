import React, { useState } from "react";
import Login from "./pages/Login";
import Services from "./pages/Services";
import Service from "./pages/Service";
import MyServices from "./pages/MyServices";
import Profile from "./pages/Profile";

export default function App() {
    const [screen, setScreen] = useState("login");
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const apiBase = "http://10.49.82.111:8080/api/v1"; // CHANGE API ENDPOINT IP

    function goLogin() {
        setScreen("login");
    }

    function goServices() {
        setScreen("services");
    }

    function goService(id) {
        setSelectedServiceId(id);
        setScreen("service");
    }

    function goMyServices() {
        setScreen("myservices");
    }

    function goProfile() {
        setScreen("profile");
    }

    if (screen === "login") {
        return <Login onLogin={goServices} apiBase={apiBase} />;
    }

    if (screen === "services") {
        return (
            <Services
                apiBase={apiBase}
                onBack={goLogin}
                onOpenService={goService}
                onOpenMyServices={goMyServices}
                onOpenProfile={goProfile}
            />
        );
    }

    if (screen === "service") {
        return <Service apiBase={apiBase} id={selectedServiceId} onBack={goServices} />;
    }

    if (screen === "myservices") {
        return <MyServices apiBase={apiBase} onBack={goServices} />;
    }

    if (screen === "profile") {
        return <Profile apiBase={apiBase} onBack={goServices} />;
    }

    return null;
}
