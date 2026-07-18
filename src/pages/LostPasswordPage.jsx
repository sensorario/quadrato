import React, { } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "../Router";
import { Modal } from "../components/Modal";

export const LostPasswordPage = () => {
    const { t } = useTranslation();
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100dvh",
                backgroundColor: "#f5f5f5",
                boxSizing: "border-box",
                padding: "24px 16px",
            }}
        >
            <h1 style={{ fontSize: "clamp(24px, 7vw, 32px)", marginBottom: "20px", textAlign: "center" }}>
                {t('lostPasswordPage.title')}
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
                    {t('lostPasswordPage.emailHint')}
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <input
                        id="email"
                        type="email"
                        placeholder={t('lostPasswordPage.emailPlaceholder')}
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
                                    alert(t('lostPasswordPage.successAlert'));
                                } else {
                                    alert(t('lostPasswordPage.errorAlert'));
                                }
                            })
                            .catch((error) => {
                                console.error("Errore:", error);
                                alert(t('lostPasswordPage.errorAlert'));
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
                    {t('lostPasswordPage.submitButton')}
                </button>
            </form>
        </div>
    );
};

export default LostPasswordPage;
