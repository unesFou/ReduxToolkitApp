import React, { useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { FiAlertCircle } from "react-icons/fi";

const ErrorPage = ({ errorCode, errorMessage }) => {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [adminRequest, setAdminRequest] = useState({
    name: "",
    email: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminRequest((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simuler l'envoi à un administrateur
    console.log("Demande soumise :", adminRequest);
    setIsFormSubmitted(true);
  };

  if (isFormSubmitted) {
    return (
      <div className="text-center mt-5">
        <Alert variant="success">
          Votre demande a été envoyée à l'administrateur. Nous vous contacterons
          bientôt.
        </Alert>
        <Button
          variant="primary"
          onClick={() => setIsFormSubmitted(false)}
          className="mt-3"
        >
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "20px",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          textAlign: "center",
        }}
      >
        <FiAlertCircle
          style={{
            fontSize: "4rem",
            color: "#dc3545",
            marginBottom: "20px",
          }}
        />
        <h1
          style={{
            color: "#dc3545",
            fontSize: "2.5rem",
            marginBottom: "10px",
          }}
        >
          Données introuvables
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#6c757d",
            marginBottom: "20px",
          }}
        >
          Impossible de récupérer les informations demandées. Veuillez
          contacter un administrateur pour résoudre ce problème ou bien Cliquez sur F5.
        </p>
        <p style={{ fontSize: "1rem", color: "#495057" }}>
          Code d'erreur : {"Erreur 500"} -{" "}
          {errorMessage || "Erreur interne du serveur."}
        </p>

        {/* <Form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label>Votre nom</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={adminRequest.name}
              onChange={handleInputChange}
              required
              placeholder="Entrez votre nom"
            />
          </Form.Group>
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Adresse email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={adminRequest.email}
              onChange={handleInputChange}
              required
              placeholder="Entrez votre email"
            />
          </Form.Group>
          <Form.Group controlId="formDescription" className="mb-3">
            <Form.Label>Description du problème</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={adminRequest.description}
              onChange={handleInputChange}
              required
              placeholder="Décrivez brièvement le problème rencontré"
            />
          </Form.Group>
          <Button variant="danger" type="submit" className="w-100">
            Envoyer la demande à l'administrateur
          </Button>
        </Form> */}
      </div>
    </div>
  );
};

export default ErrorPage;
