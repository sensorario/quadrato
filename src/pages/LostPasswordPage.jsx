import React, { } from "react";
import { Link } from "../Router";
import { Modal } from "../components/Modal";

export const LostPasswordPage = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "#f5f5f5",
            }}
        >
            <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
                Recupera password
            </h1>

            {/* Crea un form con email per recuperare la password */}
            <form
                style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    width: "400px",
                    maxWidth: "90%",
                }}
            >
                <div
                    style={{
                        marginBottom: "10px",
                        fontSize: "12px",
                        color: "#666",
                    }}
                >
                    (la tua email sarà la tua username)
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <input
                        id="email"
                        type="email"
                        placeholder="Inserisci la tua email"
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            fontSize: "16px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        const email = document.getElementById("email").value;
                        // invia la richiesta di recupero password al server
                        fetch("/api/lost-password", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email }),
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.success) {
                                    alert(
                                        "Se l'email è registrata, riceverai un'email con le istruzioni per recuperare la password."
                                    );
                                } else {
                                    alert(
                                        "Si è verificato un errore. Riprova più tardi."
                                    );
                                }
                            })
                            .catch((error) => {
                                console.error("Errore:", error);
                                alert(
                                    "Si è verificato un errore. Riprova più tardi."
                                );
                            });
                    }}

                    style={{
                        width: "100%",
                        padding: "10px",
                        fontSize: "16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Recupera password
                </button>
            </form>
        </div>
    );
};

export default LostPasswordPage;
