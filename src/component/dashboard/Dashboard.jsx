import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { Container, Row } from 'react-bootstrap';
import { format } from 'date-fns';
import TimelineCell from './TimelineCell/TimelineCell';
import TimeLines from './../TimeLines/TimeLines';
import ChildCard from './../TimeLines/ChildCard';
import CircularProgress from '@mui/material/CircularProgress';
import { ThreeDot } from 'react-loading-indicators';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Card, CardContent, Typography } from '@mui/material';

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
    return new Date().toISOString().slice(0, 16);
  };

  useEffect(() => {
    const start = getStartDate();
    const end = getEndDate();
    dispatch(fetchDashboardData({ startDate: start, endDate: end }));
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      const transformedData = transformData(data);
      setRows(transformedData.rows);
    }
  }, [data]);

  const transformData = (data) => {
    const rows = data.map(item => ({
      id: item.id,
      name: item.name,
      presence_rate: item.presence_rate,
      absence_duration: calculateAbsenceDuration(item.presence_rate || []),
      relevantData: item,
    }));
    return { rows };
  };

  const calculateAbsenceDuration = (presenceRate) => {
    const absenceRate = 100 - presenceRate;
    return `${absenceRate} days`;
  };

  const handleRowClick = (params) => {
    setLoadingRows((prev) => ({ ...prev, [params.row.id]: true }));
    setSelectedRowData(params.row);
    setOpen(true);
    setLoadingRows((prev) => ({ ...prev, [params.row.id]: false })); // Simulate loading
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

      
      <Dialog open={open} onClose={handleClose} 
              maxWidth="lg" // Options: 'xs', 'sm', 'md', 'lg', 'xl'
              fullWidth={true}
              fullScreen={true}
              PaperProps={{
                sx: {
                  margin: '20px', // No margin
                  zIndex: 1300, // Custom z-index value; adjust as necessary
                  '& .MuiDialog-paper': {
                    backgroundColor: '#f4f6f8', // Custom background color
                    padding: '20px', // Padding for the dialog
                    borderRadius: '0px', // No rounded corners
                    height: '50vh', // Make it full height
                    width: '80vw', // Make it full width
                  }}
              
              }} >
        <DialogTitle>Details for {selectedRowData?.name}</DialogTitle>
        <DialogContent
        sx={{
          // padding: '20px', // Custom padding
          // color: '#666', // Text color inside the content
          // backgroundColor: '#fff', // Content background color
          // borderRadius: '5px', // Rounding corners for content area
        }} >
         {selectedRowData && (
  <>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
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
              <div style={{ flex: 1.5 , marginRight: '10px' }}>

                  <TimeLines allData={selectedRowData.relevantData} date_start={getStartDate()} date_end={getEndDate()} />
              </div>
              <div style={{ flex: 0.5 , marginRight: '10px' }}>
              <ChildCard child={selectedRowData.relevantData} />
              </div>
            </div>
          </>
        )}
        </DialogContent>
        <DialogActions>
          <Button 
                  onClick={handleClose}
                  color="primary"
                  variant="contained" // Adds some elevation
                  sx={{
                    fontWeight: 'bold', // Bold font
                    padding: '10px 20px', // Button padding
                  }}>Close</Button>
        </DialogActions>
      </Dialog>
    

      {/* {loading && <CircularProgress />} */}
      {/* {error && <div>Error fetching data: {error}</div>} */}
    </Container>
  );
};

export default Dashboard;
