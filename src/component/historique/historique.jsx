import React, { useState, useEffect, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "./../../features/dashboardSlice/dashboardSlice";
import { setDates } from './../../features/dateSlice/dateSlice';
import { Spinner } from 'react-bootstrap';
import ErrorPage from './../error/Error';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Historique = () => {
  const { startDate, endDate } = useSelector((state) => state.dates);
  
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // état pour suivre l'ordre du tri
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    // Initialisation des dates si elles ne sont pas définies dans l'état
    const defaultStartDate = new Date();
    defaultStartDate.setHours(8, 0, 0, 0); // 08h00 du jour

    const defaultEndDate = new Date();
    defaultEndDate.setHours(23, 59, 0, 0); // 23h59 du jour

    // Vérifier si startDate et endDate existent et les formater
    const finalStartDate = startDate
        ? new Date(startDate).setHours(7, 0, 0, 0)  // Utiliser startDate si disponible
        : defaultStartDate.getTime(); // sinon utiliser la date par défaut

    const finalEndDate = endDate
        ? new Date(endDate).setHours(23, 59, 0, 0) // Utiliser endDate si disponible
        : defaultEndDate.getTime(); // sinon utiliser la date par défaut

    // Convertir en format 'YYYY-MM-DDTHH:MM' (format personnalisé sans secondes ni fuseau horaire)
    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Mois en format 2 chiffres
        const day = String(d.getDate()).padStart(2, '0'); // Jour en format 2 chiffres
        const hours = String(d.getHours()).padStart(2, '0'); // Heure en format 2 chiffres
        const minutes = String(d.getMinutes()).padStart(2, '0'); // Minutes en format 2 chiffres

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const isoStartDate = formatDate(finalStartDate);
    const isoEndDate = formatDate(finalEndDate);

    console.log('finalStartDate', isoStartDate, 'finalEndDate', isoEndDate);

    // Chargement des données avec les dates choisies
    dispatch(fetchDashboardData({ date_start: isoStartDate, date_end: isoEndDate }));
}, [dispatch, startDate, endDate]);



  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const getFilteredParents = () => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((region) => {
      const totalAbsRegion = region.childs
        .flatMap((company) => company.childs)
        .reduce((sum, brigade) => sum + (brigade.abs_duration || 0), 0);
  
      return {
        regionName: region.name,
        totalAbsRegion, // Total absence pour la région
        childs: region.childs.map((company) => {
          const totalAbsCompany = company.childs.reduce(
            (sum, brigade) => sum + (brigade.abs_duration || 0),
            0
          );
  
          return {
            companyName: company.name,
            totalAbsCompany, // Total absence pour la compagnie
            brigades: company.childs
              .filter((brigade) => brigade.abs_duration !== undefined)
              .map((brigade) => ({
                brigadeName: brigade.name,
                absDuration: formatDuration(brigade.abs_duration),
                absDurationInSeconds: brigade.abs_duration,
              })),
          };
        }),
      };
    });
  };

  const handleSort = () => {
    const sorted = [...sortedData];
    sorted.forEach((region) => {
      region.childs.forEach((company) => {
        company.brigades.sort((a, b) => {
          if (sortOrder === "asc") {
            return a.absDurationInSeconds - b.absDurationInSeconds;
          } else {
            return b.absDurationInSeconds - a.absDurationInSeconds;
          }
        });
      });
    });
    setSortedData(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredData = getFilteredParents().filter((region) =>
    region.regionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flattenDataForExcel = () => {
    const flattenedData = [];
    filteredData.forEach((region) => {
      region.childs.forEach((company, companyIdx) => {
        company.brigades.forEach((brigade, brigadeIdx) => {
          flattenedData.push({
            Region: companyIdx === 0 && brigadeIdx === 0 ? region.regionName : "", // Fusionner les cellules Région
            "Total Absence Région": companyIdx === 0 && brigadeIdx === 0 ? formatDuration(region.totalAbsRegion) : "", // Fusionner Total Région
            Compagnie: brigadeIdx === 0 ? company.companyName : "", // Fusionner les cellules Compagnie
            "Total Absence Compagnie": brigadeIdx === 0 ? formatDuration(company.totalAbsCompany) : "", // Fusionner Total Compagnie
            Brigade: brigade.brigadeName,
            "Durée d'absence": brigade.absDuration,
          });
        });
      });
    });
    return flattenedData;
  };

  const exportToExcel = () => {
    const flattenedData = flattenDataForExcel();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredData");
    XLSX.writeFile(workbook, "FilteredData.xlsx");
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Filtered Data", 20, 10);

    const pdfData = [];
    filteredData.forEach((region) => {
      region.childs.forEach((company, companyIdx) => {
        company.brigades.forEach((brigade, brigadeIdx) => {
          pdfData.push([
            companyIdx === 0 && brigadeIdx === 0 ? region.regionName : "", // Fusion Région
            companyIdx === 0 && brigadeIdx === 0 ? formatDuration(region.totalAbsRegion) : "", // Total Région
            brigadeIdx === 0 ? company.companyName : "", // Fusion Compagnie
            brigadeIdx === 0 ? formatDuration(company.totalAbsCompany) : "", // Total Compagnie
            brigade.brigadeName,
            brigade.absDuration,
          ]);
        });
      });
    });

    doc.autoTable({
      head: [["Région", "Total Région", "Compagnie", "Total Compagnie", "Brigade", "Durée d'absence"]],
      body: pdfData,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 }, // Région
        1: { cellWidth: 30 }, // Total Région
        2: { cellWidth: 40 }, // Compagnie
        3: { cellWidth: 30 }, // Total Compagnie
        4: { cellWidth: 40 }, // Brigade
        5: { cellWidth: 30 }, // Durée
      },
    });

    doc.save("FilteredData.pdf");
  };

  const sortedAndFilteredData = useMemo(() => {
    return filteredData.map((region) => {
      return {
        ...region,
        childs: region.childs.map((company) => ({
          ...company,
          brigades: [...company.brigades].sort((a, b) => {
            return sortOrder === "asc"
              ? a.absDurationInSeconds - b.absDurationInSeconds
              : b.absDurationInSeconds - a.absDurationInSeconds;
          }),
        })),
      };
    });
  }, [filteredData, sortOrder]);

  if (loading) return  <Spinner animation="border" variant="primary" />;
  if (error) return <ErrorPage errorMessage={error} />;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" className="mr-2" onClick={exportToExcel} style={{ marginRight: '10px' }}>
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

      <TableContainer component={Paper} style={{ maxHeight: '1000px', overflowY: 'auto' }}>
        <Table>
          <TableHead style={{ backgroundColor: '#fff893', position: 'sticky', top: 0, zIndex: 1 }}>
            <TableRow>
              <TableCell align="center">Région</TableCell>
              <TableCell align="center">Compagnie</TableCell>
              <TableCell align="center">Total Absence Compagnie</TableCell>
              <TableCell align="center">Brigade</TableCell>
              <TableCell align="center" onClick={handleSort} style={{ cursor: "pointer" }}>
                Durée d'absence {sortOrder === "asc" ? "↑" : "↓"}
              </TableCell>
              <TableCell align="center">Total Absence Région</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndFilteredData.map((region) => {
              const regionRowSpan = region.childs.reduce(
                (total, company) => total + company.brigades.length,
                0
              );
              return region.childs.map((company, companyIdx) => {
                const companyRowSpan = company.brigades.length;
                return company.brigades.map((brigade, brigadeIdx) => (
                  <TableRow key={`${region.regionName}-${company.companyName}-${brigade.brigadeName}`}>
                    {companyIdx === 0 && brigadeIdx === 0 && (
                      <TableCell rowSpan={regionRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                        {region.regionName}
                      </TableCell>
                    )}

                    {brigadeIdx === 0 && (
                      <>
                        <TableCell rowSpan={companyRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                          {company.companyName}
                        </TableCell>
                        <TableCell rowSpan={companyRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                          {formatDuration(company.totalAbsCompany)}
                        </TableCell>
                      </>
                    )}

                    <TableCell align="center">{brigade.brigadeName}</TableCell>
                    <TableCell align="center">{brigade.absDuration}</TableCell>
                    {companyIdx === 0 && brigadeIdx === 0 && (
                      <TableCell rowSpan={regionRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                        {formatDuration(region.totalAbsRegion)}
                      </TableCell>
                    )}
                  </TableRow>
                ));
              });
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Historique;
