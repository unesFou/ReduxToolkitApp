import React, { useState, useEffect } from "react";
import { Table, Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "./../../features/dashboardSlice/dashboardSlice";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./historique.css";

// Fonction pour convertir la durée (au format HH:mm:ss) en minutes
const parseDurationToMinutes = (duration) => {
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  return hours * 60 + minutes + seconds / 60;
};

const Historique = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fonction pour gérer les deux structures de données
  const getDashboardData = () => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.data || [];
  };

  // Fonction pour obtenir la date de début
  const getStartDate = () => {
    const today = new Date();
    today.setHours(8, 0, 0, 0); // Définir l'heure à 8h00
    return today.toISOString().slice(0, 16); // Retourner la date au format ISO (YYYY-MM-DDTHH:mm)
  };

  // Fonction pour obtenir la date de fin
  const getEndDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const start = getStartDate();
    const end = getEndDate();
    dispatch(fetchDashboardData({ startDate: start, endDate: end }));
  }, [dispatch]);

  useEffect(() => {
    console.table("Données récupérées pour les statistiques :", data);
  }, [data]);

  // Filtrer et aplatir les données pour récupérer les notifications et calculer la durée
  const getFilteredRows = () => {
    const dashboardData = getDashboardData();

    if (!dashboardData.length) {
      console.error("Aucune donnée trouvée !");
      return [];
    }

    return dashboardData
      .map((region) => region.childs) // Accéder aux "childs" de chaque région
      .flatMap((company) => company) // Aplatir les "childs" (entreprises)
      .flatMap((brigade) => brigade?.childs || []) // Aplatir encore les "childs" des brigades
      .flatMap((child) =>
        child.camera_ids?.flatMap((camera) =>
          camera?.notifications?.map((notification) => {
            const durationInMinutes = parseDurationToMinutes(notification?.duration || "0:00:00");
            return {
              regionName: dashboardData?.name, // Nom de la région
              companyName: child?.name, // Nom de l'entreprise ou du "child"
              cameraName: camera.name, // Nom de la caméra
            };
          })
        )
      )
      .filter((notification) => notification); // Filtrer les notifications invalides
  };

  // Données filtrées selon le terme de recherche
  const filteredData = getFilteredRows().filter((row) => {
    if (!row || typeof row !== "object") {
      return false; // Ignorer les éléments invalides
    }

    return Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Exporter les données en Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredData");
    XLSX.writeFile(workbook, "FilteredData.xlsx");
  };

  // Exporter les données en PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Filtered Data", 20, 10);
    doc.autoTable({
      head: [Object.keys(filteredData[0] || {})],
      body: filteredData.map((row) => Object.values(row)),
    });
    doc.save("FilteredData.pdf");
  };

  return (
    <div className="container mt-4">
      {/* Champ de recherche */}
      <Form.Control
        type="text"
        placeholder="Rechercher dans tous les champs..."
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table filtrable */}
      <Table striped bordered hover responsive>
        <thead className="sticky-header">
          <tr>
            {Object.keys(filteredData[0] || {}).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Boutons d'exportation */}
      <div className="d-flex justify-content-end">
        <Button variant="success" className="mr-2" onClick={exportToExcel}>
          Exporter en Excel
        </Button>
        <Button variant="danger" onClick={exportToPDF}>
          Exporter en PDF
        </Button>
      </div>
    </div>
  );
};

export default Historique;
