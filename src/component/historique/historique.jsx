import React, { useState, useEffect, useMemo ,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "./../../features/dashboardSlice/dashboardSlice";
import { setDates } from './../../features/dateSlice/dateSlice';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper ,TextField, Tab, Tabs } from "@mui/material";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CachedIcon from '@mui/icons-material/Cached';
import Button from '@mui/material/Button';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from 'date-fns';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import Chart from "react-apexcharts";
import Alert from '@mui/material/Alert';
import { Spinner } from 'react-bootstrap';

const Historique = () => {
  const { startDate, endDate } = useSelector((state) => state.dates);
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortedData, setSortedData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [chartSortOrder, setChartSortOrder] = useState("asc");
  const [activeTab, setActiveTab] = useState(0); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableRef = useRef(null);

  
      // const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : 'Non défini';
      // const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : 'Non défini';
      const formattedStartDate = startDate ? format(new Date(startDate), 'dd/MM/yyyy') : 'Non défini';
      const formattedEndDate = endDate ? format(new Date(endDate), 'dd/MM/yyyy') : 'Non défini';
      
      const defaultStartDate = new Date();
      defaultStartDate.setHours(8, 0, 0, 0); // 08:00
      const defaultEndDate = new Date();
      //defaultEndDate.setHours(23, 59, 0, 0); // 23:59

      const handleTabChange = (event, newValue) => {
        setActiveTab(newValue); // Change l'onglet actif
      };

           
      useEffect(() => {
        let isMounted = true; 
      
        const calculateDates = () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
      
          const currentTime = new Date();
      
          const startDateObj = startDate instanceof Date ? startDate : null;
          const endDateObj = endDate instanceof Date ? endDate : null;
      
          let calculatedStartDate = null;
          let calculatedEndDate = null;
      
          if (startDateObj && !endDateObj) {
            if (startDateObj.toDateString() === today.toDateString()) {
              calculatedStartDate = new Date(startDateObj.setHours(8, 0, 0, 0));
              calculatedEndDate = currentTime;
            } else {
              calculatedStartDate = new Date(startDateObj.setHours(8, 0, 0, 0));
              const nextDay = new Date(startDateObj);
              calculatedEndDate = new Date(nextDay.setDate(nextDay.getDate() + 1));
              calculatedEndDate.setHours(8, 0, 0, 0);
            }
          } else if (startDateObj && endDateObj) {
            calculatedStartDate = new Date(startDateObj.setHours(8, 0, 0, 0));
            const nextDay = new Date(endDateObj);
            calculatedEndDate = new Date(nextDay.setDate(nextDay.getDate() + 1));
            calculatedEndDate.setHours(8, 0, 0, 0);
          } else {
            calculatedStartDate = new Date(today.setHours(8, 0, 0, 0));
            calculatedEndDate = currentTime;
          }
      
          return {
            startDate: calculatedStartDate?.toISOString().slice(0, 16) || null,
            endDate: calculatedEndDate?.toISOString().slice(0, 16) || null,
          };
        };
      
        const { startDate: finalStartDate, endDate: finalEndDate } = calculateDates();
      
        if (isMounted && finalStartDate && finalEndDate) {
          dispatch(setDates({
            startDate: startDate,
            endDate: endDate,
          }));
      
          dispatch(fetchDashboardData({
            date_start: finalStartDate,
            date_end: finalEndDate,
          }));
        }
      
        return () => {
          isMounted = false;
        };
      }, [dispatch, startDate, endDate]);
      
      
      
      
      
      const formatDuration = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
      
        // Si les jours sont supérieurs à 0, on les affiche
        if (days > 0) {
          return `${days} jours , ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }
      
        // Sinon, afficher seulement les heures, minutes et secondes
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      };
      
     // Fonction pour basculer en plein écran
  const toggleFullscreen = () => {
    if (!tableRef.current) {
      console.error("Table is not available for fullscreen");
      return;
    }

    if (isFullscreen) {
      if (tableRef.current.requestFullscreen) {
        tableRef.current.requestFullscreen();
      } else if (tableRef.current.webkitRequestFullscreen) { // Safari
        tableRef.current.webkitRequestFullscreen();
      } else if (tableRef.current.msRequestFullscreen) { // IE/Edge
        tableRef.current.msRequestFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
  };

  const getFilteredParents = () => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((region) => {
      const totalAbsRegion = region?.childs
        .flatMap((company) => company.childs)
        .reduce((sum, brigade) => sum + (brigade.abs_duration || 0), 0);
  
      return {
        regionName: region.name,
        totalAbsRegion,
        absence_Rate :  region.presence_rate,
        childs: region.childs.map((company) => {
          const totalAbsCompany = company.childs.reduce(
            (sum, brigade) => sum + (brigade.abs_duration || 0),
            0
          );
          return {
            companyName: company.name,
            totalAbsCompany,
            companyPresenceRate: company.presence_rate,
            absDurationCieInSeconds : company.absDuration,
            bt_ratio : company.bt_ratio,
            brigades: company.childs
              .filter((brigade) => brigade.abs_duration !== undefined)
              .map((brigade) => ({
                brigadeName: brigade.name,
                absDuration: formatDuration(brigade.abs_duration),
                absDurationInSeconds: brigade.abs_duration,
                presence_rate : brigade.presence_rate,
                
              }))
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

  const handleSort_cie = () => {
    const sorted = [...sortedData];
    sorted.forEach((region) => {
      region.childs.forEach((company) => {
        company.sort((a, b) => {
          if (sortOrder === "asc") {
            return a.absDurationCieInSeconds - b.absDurationCieInSeconds;
          } else {
            return b.absDurationCieInSeconds - a.absDurationCieInSeconds;
          }
        });
      });
    });
    setSortedData(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredData = getFilteredParents().filter((region) =>
    region.regionName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.absence_Rate - a.absence_Rate);

  const flattenDataForExcel = () => {
    const flattenedData = [];
    filteredData.forEach((region) => {
      region.childs.forEach((company, companyIdx) => {
        company.brigades.forEach((brigade, brigadeIdx) => {
          flattenedData.push({
            Region: companyIdx === 0 && brigadeIdx === 0 ? region.regionName : "", // Fusionner les cellules Région
            "Total Absence Région": companyIdx === 0 && brigadeIdx === 0 ? companyIdx === 0 && brigadeIdx === 0 ? `${formatDuration(region.totalAbsRegion)} Taux : ${region.absence_Rate}%` : "" : "", 
            "Taux de Présence Région" : region.absence_Rate ,
            Compagnie: brigadeIdx === 0 ? company.companyName : "", // Fusionner les cellules Compagnie
            "Total Absence Compagnie": brigadeIdx === 0 ? formatDuration(company.totalAbsCompany) : "", // Fusionner Total Compagnie
            "Taux de Présence Compagnie" : company.companyPresenceRate,
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
    doc.text(`Statistiques d'Absence entre ${formattedStartDate} et ${formattedEndDate}`, 20, 10);

    const pdfData = [];
    filteredData.forEach((region) => {
      region.childs.forEach((company, companyIdx) => {
        company.brigades.forEach((brigade, brigadeIdx) => {
          pdfData.push([
            companyIdx === 0 && brigadeIdx === 0 ? region.regionName : "", // Fusion Région
            companyIdx === 0 && brigadeIdx === 0 ? `${formatDuration(region.totalAbsRegion)} Taux : ${region.absence_Rate}%` : "", // Total Région
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
        0: { cellWidth: 20 }, // Région
        1: { cellWidth: 30 }, // Total Région
        2: { cellWidth: 40 }, // Compagnie
        3: { cellWidth: 30 }, // Total Compagnie
        4: { cellWidth: 40 }, // Brigade
        5: { cellWidth: 30 }, // Durée
      },
    });

    doc.save("FilteredData.pdf");
  };

 

  
  const chartData = useMemo(() => {
    return data?.map((region) => ({
      name: region.name,
      absTotal: region.childs
        .flatMap((company) => company.childs)
        .reduce((sum, brigade) => sum + (brigade.abs_duration || 0), 0),
    }));
  }, [data]);

  const sortedChartData = useMemo(() => {
    if (!chartData) return [];
    
    const sortedData = [...chartData];
    sortedData.sort((b, a) => {
      if (chartSortOrder === "asc") {
        return a.absTotal - b.absTotal;
      } else {
        return b.absTotal - a.absTotal;
      }
    });
  
    return sortedData;
  }, [chartData, chartSortOrder]);


  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: true,
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedRegion = sortedChartData[config.dataPointIndex].name;
          setSearchTerm(selectedRegion);
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: "top",
        },
      },
    },
    xaxis: {
      categories: sortedChartData.map((region) => region.name), // Nom des régions
      title: {
        text: "",
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatDuration(value), // Utiliser formatDuration pour les labels
      },
      title: {
        text: "Durée totale d'absence",
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatDuration(value), // Formater les tooltips avec formatDuration
      },
    },
    dataLabels: {
      enabled: false,
    },
  };
  
  const chartSeries = [
    {
      name: "Total Absence",
      data: sortedChartData.map((region) => region.absTotal), // Total en secondes
    },
  ];
  

  const handleRegionClick = (regionName) => {
    setSelectedRegion(regionName);
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

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
        }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Alert variant="danger">Erreur lors du chargement des données</Alert>
      </div>
    );
  }

  

  return (
    <div>
         
      {/* Graphique pour les absences par région */}
       <div className="d-flex justify-content-end mb-3">
               {/* <h5>Statistiques d'Absence entre {startDate} et {endDate}</h5> */}
               <Button class="btn btn-success" onClick={exportToExcel} style={{ marginRight: '10px' , height: '0%'}}>
                 Exporter en Excel
               </Button>
               <Button class="btn btn-warning" onClick={exportToPDF} style={{ marginRight: '10px' , height: '0%'}} >
                 Exporter en PDF
               </Button>
               <div className="d-flex justify-content-end mb-3" style={{ marginTop: '0.5%'}}>
               <FullscreenIcon
                        onClick={toggleFullscreen}
                        style={{
                          fontSize: '24px',  // Ajuste la taille de l'icône
                          cursor: 'pointer', // Optionnel pour indiquer que l'icône est cliquable
                          marginBottom: '15px',
                          marginRight: '15px',
                          verticalAlign: 'middle',
                          // Aligner verticalement l'icône par rapport aux boutons
                        }} 
                        />
             </div>
             </div>
              
             <h5 className="text-center mb-3">
               Statistiques d'Absence entre {formattedStartDate} et {formattedEndDate} <CachedIcon onClick={() => setSearchTerm("")} style={{cursor: "pointer"}}/>
             </h5>
      <div style={{ width: '100%', height: 350 }}>
      <Chart options={chartOptions} series={chartSeries} type="bar" height={250} />
      </div>
       
       <Tabs value={activeTab} onChange={handleTabChange} aria-label="Tabs pour afficher les tables" centered sx={{
                                                                                                                    backgroundColor: '#f5f5f5',
                                                                                                                    borderRadius: '8px',
                                                                                                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Ombre portée
                                                                                                                  }}>
        <Tab label="Situation par Région" sx={{
                                                color: activeTab === 0 ? '#1976d2' : '#000',
                                                fontWeight: activeTab === 0 ? 'bold' : 'normal',
                                                '&:hover': {
                                                  backgroundColor: '#e3f2fd',
                                                },
                                              }}/>
        <Tab label="Situation par Compagnie"  sx={{
                                                    color: activeTab === 1 ? '#1976d2' : '#000',
                                                    fontWeight: activeTab === 1 ? 'bold' : 'normal',
                                                    '&:hover': {
                                                      backgroundColor: '#e3f2fd',
                                                    },
                                                  }}/>
      </Tabs>
      {/* {activeView === "table1" && ( */}
      {activeTab === 0 && (
      <TableContainer component={Paper} style={{ maxHeight: '1000px', overflowY: 'auto' }} ref={tableRef}>
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
                            <TableCell rowSpan={regionRowSpan} align="center" style={{ verticalAlign: "middle" ,fontWeight: 'bold'}}>
                              {region.regionName}
                            </TableCell>
                          )}
      
                          {brigadeIdx === 0 && (
                            <>
                              <TableCell rowSpan={companyRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                                {company.companyName}
                              </TableCell>
                              <TableCell rowSpan={companyRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                                <Button variant="outlined" color="error">{formatDuration(company.totalAbsCompany)}</Button>
                                <Button variant="outlined" color="info">{company.companyPresenceRate}%</Button>
                                <Button variant="text" color="secondary">{company.bt_ratio}</Button>
                              </TableCell>
                            </>
                          )}
      
                          <TableCell align="center">{brigade.brigadeName}</TableCell>
                          <TableCell align="center">
                          <Button variant="outlined" color="error"> {brigade.absDuration}</Button>
                          <Button variant="outlined" color="info">{brigade.presence_rate} %</Button>
                          </TableCell>
                          {companyIdx === 0 && brigadeIdx === 0 && (
                            <TableCell rowSpan={regionRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                              <div style={{ display: 'grid'}}>

                              <Button variant="outlined" color="error">{formatDuration(region.totalAbsRegion)}</Button>
                              <Button variant="outlined" color="info">{region.absence_Rate} %</Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ));
                    });
                  })}
                </TableBody>
              </Table>
            </TableContainer>)}
      {/* {activeView === "table2" && ( */}
      {activeTab === 1 && (
      <TableContainer component={Paper} style={{ maxHeight: '1000px', overflowY: 'auto' }}  ref={tableRef}>
              <Table>
                <TableHead style={{ backgroundColor: '#fff893', position: 'sticky', top: 0, zIndex: 1 }}>
                  <TableRow>
                    {/* <TableCell align="center">Région</TableCell> */}
                    <TableCell align="center" >Compagnie </TableCell>
                    <TableCell align="center"onClick={handleSort_cie} style={{ cursor: "pointer" }} >Total Absence Compagnie {sortOrder === "asc" ? "↑" : "↓"}</TableCell>
                    <TableCell align="center">Brigade </TableCell>
                    <TableCell align="center" onClick={handleSort} style={{ cursor: "pointer" }}>
                      Durée d'absence {sortOrder === "asc" ? "↑" : "↓"}
                    </TableCell>
                    {/* <TableCell align="center">Total Absence Région</TableCell> */}
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
                         
                          {brigadeIdx === 0 && (
                            <>
                              <TableCell rowSpan={companyRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                                {company.companyName}
                              </TableCell>
                              <TableCell rowSpan={companyRowSpan} align="center" style={{ verticalAlign: "middle" }}>
                                <Button variant="outlined" color="error">{formatDuration(company.totalAbsCompany)}</Button>
                                <Button variant="outlined" color="info">{company.companyPresenceRate}%</Button>
                                <Button variant="text" color="secondary">{company.bt_ratio}</Button>
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">{brigade.brigadeName}</TableCell>
                          <TableCell align="center">
                            <Button variant="outlined" color="error">{brigade.absDuration}</Button>
                            <Button variant="outlined" color="info">{brigade.presence_rate} %</Button>
                            </TableCell>
                          </TableRow>
                      ));
                    });
                  })}
                </TableBody>
              </Table>
            </TableContainer>)}
     
    </div>
  );
};

export default Historique;
