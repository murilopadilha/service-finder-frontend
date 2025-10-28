import React, { useState } from "react";
import Login from "./pages/Login";
import Services from "./pages/Services";

export default function App() {
  const [screen, setScreen] = useState("login");

  const handleLogin = () => setScreen("services");
  const handleBackToLogin = () => setScreen("login");

  return screen === "login" ? (
    <Login onLogin={handleLogin} />
  ) : (
    <Services onBack={handleBackToLogin} />
  );
}
