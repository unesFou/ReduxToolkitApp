import React, { useState, useEffect } from "react";
import { Table, Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "./../../features/dashboardSlice/dashboardSlice";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./historique.css";

const Historique = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [searchTerm, setSearchTerm] = useState("");

  // Charger les données lors du montage du composant
  useEffect(() => {
    const startDate = new Date().toISOString().slice(0, 16);
    const endDate = new Date().toISOString().slice(0, 16);
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    // Format de deux chiffres
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secs).padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };
  
  // Filtrer les parents avec des `childs` et des `childs.childs` contenant `abs_duration`
  const getFilteredParents = () => {
    if (!data || !Array.isArray(data)) return [];

    return data
      .filter((region) =>
        region.childs.some((company) =>
          company.childs.some((brigade) => brigade.abs_duration)
        )
      )
      .map((region) => ({
        regionName: region.name,
        childs: region.childs.map((company) => ({
          companyName: company.name,
          brigades: company.childs
            .filter((brigade) => brigade.abs_duration !== undefined)
            .map((brigade) => ({
              brigadeName: brigade.name,
              absDuration: brigade.abs_duration,
            })),
        })),
      }));
  };

  const filteredParents = getFilteredParents();

  // Recherche
  const filteredData = filteredParents.filter((region) =>
    region.regionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour calculer le rowSpan des régions et Compagnies
  const calculateRowSpan = (region) =>
    region.childs.reduce(
      (total, company) => total + company.brigades.length,
      0
    );

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
    const pdfData = [];
    filteredData.forEach((region) => {
      region.childs.forEach((company) => {
        company.brigades.forEach((brigade) => {
          pdfData.push([
            region.regionName,
            company.companyName,
            brigade.brigadeName,
            brigade.absDuration,
          ]);
        });
      });
    });

    doc.autoTable({
      head: [["Region", "Company", "Brigade", "Absence Duration"]],
      body: pdfData,
    });
    doc.save("FilteredData.pdf");
  };

  if (loading) return <div>Chargement des données...</div>;
  if (error) return <div>Erreur lors du chargement des données.</div>;

  return (
    <div className="container mt-4">
       {/* Boutons d'exportation */}
       <div className="d-flex justify-content-end">
        <Button variant="success" className="mr-2" onClick={exportToExcel}>
          Exporter en Excel
        </Button>
        <Button variant="danger" onClick={exportToPDF}>
          Exporter en PDF
        </Button>
      </div>
      {/* Champ de recherche */}
      <Form.Control
        type="text"
        placeholder="Rechercher par nom de région..."
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tableau des données */}
      <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Région</th>
                  <th>Compagnie</th>
                  <th>Brigade</th>
                  <th>Durée d'absence</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((region, regionIdx) => {
                  const regionRowSpan = calculateRowSpan(region);

                  return region.childs.map((company, companyIdx) => {
                    const companyRowSpan = company.brigades.length;

                    return company.brigades.map((brigade, brigadeIdx) => (
                      <tr key={`${regionIdx}-${companyIdx}-${brigadeIdx}`}>
                        {/* Région */}
                        {companyIdx === 0 && brigadeIdx === 0 && (
                          <td rowSpan={regionRowSpan} className="region-column">
                            {region.regionName || <span>&nbsp;</span>}
                          </td>
                        )}

                        {/* Compagnie */}
                        {brigadeIdx === 0 && (
                          <td rowSpan={companyRowSpan} className="company-column">
                            {company.companyName || <span>&nbsp;</span>}
                          </td>
                        )}

                        {/* Brigade */}
                        <td>{brigade.brigadeName || <span>&nbsp;</span>}</td>

                        {/* Durée d'absence */}
                        <td>{formatDuration(brigade.absDuration) || <span>00:00:00</span>}</td>
                      </tr>
                    ));
                  });
                })}
              </tbody>
      </Table>


     
    </div>
  );
};

export default Historique;
