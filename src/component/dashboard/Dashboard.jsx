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
import Button from '@mui/material/Button';
import { Card } from '@mui/material';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const getStartDate = () => {
    const today = new Date();
    today.setHours(8, 0, 0, 0);
    return today.toISOString().slice(0, 16);
  };

  const getEndDate = () => {
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    return today.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (data) {
      //console.log('Fetched data:', data);
      calculateAllAbsenceDurations(data);
    }
  }, [data]);
  

  useEffect(() => {
    const start = getStartDate();
    const end = getEndDate();
    dispatch(fetchDashboardData({ startDate: start, endDate: end }));
  }, [dispatch]);

  const parseDurationToMinutes = (durationString) => {
    if (!durationString) return 0;
    const [hours, minutes, seconds] = durationString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };
  
  const calculateAbsenceDuration = (relevantData) => {
    const totalAbsenceDuration = relevantData?.childs
      ?.filter(e => e.childs !== undefined)
      ?.flatMap(e => e.childs)
      ?.filter(e => e?.camera_ids)
      ?.flatMap(e => e?.camera_ids)
      ?.flatMap(e => e?.notifications)
      .reduce((acc, notification) => {
        const durationInMinutes = parseDurationToMinutes(notification.duration || '0:00:00');
        return acc + durationInMinutes;
      }, 0);
  
    return totalAbsenceDuration;
  };

  // const calculateAbsenceDuration = (relevantData) => {
  //   // Traverse the nested structure to access the duration in notifications
  //   const totalAbsenceDuration = relevantData?.childs
  //     ?.filter(e => e.childs !== undefined)
  //     ?.flatMap(e => e.childs)
  //     ?.filter(e => e?.camera_ids)
  //     ?.flatMap(e => e?.camera_ids)
  //     ?.flatMap(e => e?.notifications)
  //     .reduce((acc, notification) => acc + (notification.duration || 0), 0); // Summing up durations

  //   return totalAbsenceDuration; // Returning total absence duration in days format
  // };

  const calculateAllAbsenceDurations = async (data) => {
    const calculatedRows = await Promise.all(
      data.map(async (item) => {
        const absenceDuration = await calculateAbsenceDuration(item);
        return {
          id: item.id,
          name: item.name,
          presence_rate: item.presence_rate,
          absence_duration: `${absenceDuration} heure(s)`,
          relevantData: item,
        };
      })
    );
    setRows(calculatedRows);
  };

  // useEffect(() => {
  //   if (data) {
  //     calculateAllAbsenceDurations(data);
  //   }
  // }, [data]);

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
    {
      field: 'timeline',
      headerName: 'Timeline',
      width: 900,
      renderCell: (params) => {
        const isLoading = loadingRows[params.row.id];
        return isLoading ? (
          <ThreeDot color="#32cd32" size="small" />
        ) : (
          <TimelineCell relevantData={params.row.relevantData} />
        );
      },
    },
    { field: 'absence_duration', headerName: 'Absence Duration', width: 200 },
  ];

  return (
    <Container>
      <Row>
        <DataGrid rows={rows} columns={columns} pageSize={10} onRowClick={handleRowClick} />
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

      {loading && <CircularProgress />}
      {error && <div>Error fetching data: {error}</div>}
    </Container>
  );
};

export default Dashboard;
