import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { Container, Row } from 'react-bootstrap';
import TimelineCell from './TimelineCell/TimelineCell';
import TimeLinesByUnit from './../TimeLinesByUnit/TimeLinesByUnit';
import ChildCard from './../TimeLinesByUnit/ChildCard';
import CircularProgress from '@mui/material/CircularProgress';
import { ThreeDot } from 'react-loading-indicators';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
//import Button from '@mui/material/Button';
import Button from 'react-bootstrap/Button';
import { Card } from '@mui/material';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  
  // Définir une variable pour gérer les données réelles
  const dashboardData = data?.data || data;
  
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getStartDate = () => {
    const today = new Date();
    //today.setMonth(today.getMonth() - 5);
    today.setHours(8, 0, 0, 0);
    return today.toISOString().slice(0, 16);
    // return format(today, "yyyy-MM-dd'T'HH:mm");
    };

  const getEndDate = () => {
    const today = new Date();
    //today.setMonth(today.getMonth() - 5);
    today.setHours(23, 59, 0, 0);
    return today.toISOString().slice(0, 16);
    //return format(today, "yyyy-MM-dd'T'HH:mm");
  };

  useEffect(() => {
    const start = getStartDate();
    const end = getEndDate();
    dispatch(fetchDashboardData({date_start : start, date_end: end }));
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Mettre à jour l'heure toutes les secondes

    return () => clearInterval(interval); // Nettoyer l'intervalle lorsque le composant est démonté
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // const parseDurationToMinutes = (durationString) => {
  //   if (!durationString) return 0;
  //   const [hours, minutes, seconds] = durationString.split(':').map(Number);
  //   return hours * 60 + minutes + seconds / 60;
  // };
  
  // const calculateAbsenceDuration = (data) => {
  //   console.log("data to calculate totalAbsenceDuration", data)
  //   const totalAbsenceDuration = data?.childs
  //     ?.filter(e => e.childs !== undefined)
  //     ?.flatMap(e => e.childs)
  //     ?.filter(e => e?.camera_ids)
  //     ?.flatMap(e => e?.camera_ids)
  //     ?.flatMap(e => e?.notifications)
  //     .reduce((acc, notification) => {
  //       const durationInMinutes = parseDurationToMinutes(notification.duration || '0:00:00');
  //       return acc + durationInMinutes;
  //     }, 0);
  
  //   return totalAbsenceDuration;
  // };

  const convertSecondsToTimeFormat = (seconds) => {
    const hours = Math.floor(seconds / 3600); // Nombre d'heures
    const minutes = Math.floor((seconds % 3600) / 60); // Nombre de minutes restantes
    const remainingSeconds = seconds % 60; // Reste des secondes
    
    // Formatage en 'hh:mm:ss' avec des zéros devant si nécessaire
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  const calculateAllAbsenceDurations = async (data) => {
    console.log('data dashboard',data);
    const calculatedRows = await Promise.all(
      data && data.map(async (item) => {
        // Convertir la durée d'absence en secondes au format hh:mm:ss
        const absenceDuration = convertSecondsToTimeFormat(item.abs_duration);
  
        return {
          id: item.id,
          name: item.name,
          presence_rate: item.presence_rate,
          absence_duration: absenceDuration, // Affiche la durée sous format hh:mm:ss
          relevantData: item,
        };
      })
    );
    //calculatedRows.sort((a, b) => a.absence_duration_in_seconds - b.absence_duration_in_seconds);
    setRows(calculatedRows);
  };
  

  useEffect(() => {
    if (dashboardData) {
      calculateAllAbsenceDurations(dashboardData);
    }
  }, [dashboardData]);

  const handleRowClick = (params) => {
    setLoadingRows((prev) => ({ ...prev, [params.row.id]: true }));
    setSelectedRowData(params.row);
    setOpen(true);
    setLoadingRows((prev) => ({ ...prev, [params.row.id]: false }));
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRowData(null);
  };

  const columns = [
     { field: 'name', headerName: 'Name', width: 300 },
    // {
    //   field: 'name',
    //   headerName: 'Région',
    //   width: 200,
    //   renderCell: (params) => (
    //     <Button variant="light" style={{textAlign:'center'}}>
    //       {params.row.name}
    //     </Button>
    //   ),
    // },
    {
      field: 'timeline',
      headerName: 'Timeline',
      width: 900,
      renderCell: (params) => {
        const isLoading = loadingRows[params.row.id];
        return isLoading ? (
          <ThreeDot color="#32cd32" size="small" />
        ) : (
          <TimelineCell relevantData={params.row.relevantData.abs_duration} />
        );
      },
    },
    {
      field: 'absence_duration',
      headerName: 'Absence Duration',
      width: 200,
      renderCell: (params) => (
        <Button variant="outline-warning" color="warning" style={{textAlign:'center'}}>
          {params.row.absence_duration}
        </Button>
      ),
    },
  ];

  return (
    <Container>
      <Row className="text-center" style={{ marginBottom: '20px' }}>
        <h1>Total d'absence du 08h jusqu'à <span style={{ fontWeight: 'bold' }}>{formatTime(currentTime)}</span></h1>
      </Row>
      <Row>
          <div style={{padding:'1%'}}>
        <DataGrid rows={rows} columns={columns} pageSize={10} onRowClick={handleRowClick}  
        initialState={{
                        sorting: {
                          sortModel: [{ field: 'absence_duration', sort: 'desc' }],
                        },
  }}/>
          </div>
      </Row>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth={true}
        fullScreen={true}
        PaperProps={{
          sx: {
            margin: '20px',
            zIndex: 1300,
            '& .MuiDialog-paper': {
              backgroundColor: '#f4f6f8',
              padding: '20px',
              borderRadius: '0px',
              height: '50vh',
              width: '80vw',
            },
          },
        }}
      >
        <DialogTitle>Details for {selectedRowData?.name}</DialogTitle>
        <DialogContent>
          {selectedRowData && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                <div style={{ flex: 1.5, marginRight: '10px' }}>
                  <Card sx={{ padding: '16px', borderRadius: '8px', boxShadow: 3 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#00796b' }}>
                      {selectedRowData.name}
                    </p>
                  </Card>
                </div>
                <div style={{ flex: 1.5, marginRight: '10px' }}>
                  <Card sx={{ padding: '16px', borderRadius: '8px', boxShadow: 3 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#00796b' }}>
                      Presence Rate: {selectedRowData.presence_rate}%
                    </p>
                  </Card>
                </div>
                <div style={{ flex: 1 }}>
                  <Card sx={{ padding: '16px', borderRadius: '8px', boxShadow: 3 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#ef6c00' }}>
                      Absence Duration: {selectedRowData.absence_duration}
                    </p>
                  </Card>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                <div style={{ flex: 1.5, marginRight: '10px' }}>
                  <TimeLinesByUnit
                    allData={selectedRowData.relevantData}
                    date_start={getStartDate()}
                    date_end={getEndDate()}
                  />
                </div>
                {/* <div style={{ flex: 0.5, marginRight: '10px' }}>
                  <ChildCard child={selectedRowData.relevantData} />
                </div> */}
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            variant="contained"
            sx={{
              fontWeight: 'bold',
              padding: '10px 20px',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* {loading && <CircularProgress />}
      {error && <div>Error fetching data: {error}</div>} */}
    </Container>
  );
};

export default Dashboard;
