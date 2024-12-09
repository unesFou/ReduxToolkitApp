import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "./../../features/dashboardSlice/dashboardSlice";
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
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // état pour suivre l'ordre du tri
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    const startDate = new Date().toISOString().slice(0, 16);
    const endDate = new Date().toISOString().slice(0, 16);
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch]);

  useEffect(() => {
    setSortedData(getFilteredParents()); // mettre à jour les données triées lorsque les données changent
  }, [data]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // const getFilteredParents = () => {
  //   if (!data || !Array.isArray(data)) return [];
  //   return data
  //     // .filter((region) =>
  //     //   region.childs.some((company) =>
  //     //     company.childs.some((brigade) => brigade.abs_duration)
  //     //   )
  //     // )
  //     .map((region) => ({
  //       regionName: region.name,
  //       childs: region.childs.map((company) => ({
  //         companyName: company.name,
  //         brigades: company.childs
  //           .filter((brigade) => brigade.abs_duration !== undefined)
  //           .map((brigade) => ({
  //             brigadeName: brigade.name,
  //             absDuration: formatDuration(brigade.abs_duration),
  //             absDurationInSeconds: brigade.abs_duration,
  //           })),
  //       })),
  //     }));
  // };

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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredData");
    XLSX.writeFile(workbook, "FilteredData.xlsx");
  };

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
      <div className="d-flex justify-content-end mb-3" >
        <Button variant="success" className="mr-2" onClick={exportToExcel} style={{marginRight: '10px'}}>
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

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
        <TableHead>
  <TableRow>
    <TableCell align="center">Région</TableCell>
    <TableCell align="center">Compagnie</TableCell>
    <TableCell align="center">Total Absence Compagnie</TableCell>
    <TableCell align="center">Brigade</TableCell>
    <TableCell 
      align="center" 
      onClick={handleSort} 
      style={{ cursor: "pointer" }}
    >
      Durée d'absence {sortOrder === "asc" ? "↑" : "↓"}
    </TableCell>
    <TableCell align="center">Total Absence Région</TableCell>
  </TableRow>
</TableHead>

<TableBody>
  {filteredData.map((region) => {
    const regionRowSpan = region.childs.reduce(
      (total, company) => total + company.brigades.length,
      0
    );
    return region.childs.map((company, companyIdx) => {
      const companyRowSpan = company.brigades.length;
      return company.brigades.map((brigade, brigadeIdx) => (
        <TableRow
          key={`${region.regionName}-${company.companyName}-${brigade.brigadeName}`}
        >
          {/* Région */}
          {companyIdx === 0 && brigadeIdx === 0 && (
            <TableCell
              rowSpan={regionRowSpan}
              align="center"
              style={{ verticalAlign: "middle" }}
            >
              {region.regionName}
            </TableCell>
          )}

          {/* Compagnie */}
          {brigadeIdx === 0 && (
            <>
              <TableCell
                rowSpan={companyRowSpan}
                align="center"
                style={{ verticalAlign: "middle" }}
              >
                {company.companyName}
              </TableCell>
              <TableCell
                rowSpan={companyRowSpan}
                align="center"
                style={{ verticalAlign: "middle" }}
              >
                {formatDuration(company.totalAbsCompany)}
              </TableCell>
            </>
          )}

          {/* Brigade */}
          <TableCell align="center">{brigade.brigadeName}</TableCell>

          {/* Durée d'absence */}
          <TableCell align="center">{brigade.absDuration}</TableCell>

          {/* Total absence Région */}
          {companyIdx === 0 && brigadeIdx === 0 && (
            <TableCell
              rowSpan={regionRowSpan}
              align="center"
              style={{ verticalAlign: "middle" }}
            >
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
