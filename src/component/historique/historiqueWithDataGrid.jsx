import React, { useEffect, useState, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { fetchDashboardData } from "./../../features/dashboardSlice/dashboardSlice";
import { Spinner } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Historique = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const startDate = new Date().toISOString().slice(0, 16);
    const endDate = new Date().toISOString().slice(0, 16);
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const getFlattenedData = () => {
    if (!data || !Array.isArray(data)) return [];
    const flattened = [];
    data.forEach((region) => {
      region.childs.forEach((company, companyIdx) => {
        company.childs.forEach((brigade, brigadeIdx) => {
          flattened.push({
            id: `${region.name}-${company.name}-${brigade.name}`,
            region: companyIdx === 0 && brigadeIdx === 0 ? region.name : "",
            totalAbsRegion:
              companyIdx === 0 && brigadeIdx === 0
                ? formatDuration(
                    region.childs
                      .flatMap((c) => c.childs)
                      .reduce((sum, b) => sum + (b.abs_duration || 0), 0)
                  )
                : "",
            company: brigadeIdx === 0 ? company.name : "",
            totalAbsCompany:
              brigadeIdx === 0
                ? formatDuration(
                    company.childs.reduce(
                      (sum, b) => sum + (b.abs_duration || 0),
                      0
                    )
                  )
                : "",
            brigade: brigade.name,
            absDuration: formatDuration(brigade.abs_duration || 0),
          });
        });
      });
    });
    return flattened;
  };

  const flattenedData = useMemo(() => getFlattenedData(), [data]);

  const filteredData = useMemo(() => {
    return flattenedData.filter((row) =>
      row.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedData, searchTerm]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historique");
    XLSX.writeFile(workbook, "Historique.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Historique des absences", 20, 10);
    doc.autoTable({
      head: [
        [
          "Région",
          "Total Absence Région",
          "Compagnie",
          "Total Absence Compagnie",
          "Brigade",
          "Durée d'absence",
        ],
      ],
      body: filteredData.map((row) => [
        row.region,
        row.totalAbsRegion,
        row.company,
        row.totalAbsCompany,
        row.brigade,
        row.absDuration,
      ]),
      styles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 40 } },
    });
    doc.save("Historique.pdf");
  };

  const columns = [
    {
      field: "region",
      headerName: "Région",
      width: 150,
      renderCell: (params) => (
        <strong>{params.value ? params.value : ""}</strong>
      ),
    },
    { field: "totalAbsRegion", headerName: "Total Région", width: 150 },
    {
      field: "company",
      headerName: "Compagnie",
      width: 150,
      renderCell: (params) => (
        <strong>{params.value ? params.value : ""}</strong>
      ),
    },
    { field: "totalAbsCompany", headerName: "Total Compagnie", width: 150 },
    { field: "brigade", headerName: "Brigade", width: 150 },
    { field: "absDuration", headerName: "Durée d'absence", width: 150 },
  ];

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <div>Erreur lors du chargement des données.</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" onClick={exportToExcel} style={{ marginRight: '10px' }}>
          Exporter en Excel
        </Button>
        <Button variant="danger" onClick={exportToPDF}>
          Exporter en PDF
        </Button>
      </div>
      <Form.Control
        type="text"
        placeholder="Rechercher par nom de région..."
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableColumnMenu
        />
      </div>
    </div>
  );
};

export default Historique;
