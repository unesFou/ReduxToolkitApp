import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { Container, Row, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = ({ startDate, endDate }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (data) {
      const transformedData = transformData(data);
      setRows(transformedData);
    }
  }, [data]);

  const transformData = (data) => {
    const flattenData = (items, parentName = '') => {
      return items.reduce((acc, item) => {
        const currentName = parentName ? `${parentName} > ${item.name}` : item.name;
        acc.push({
          id: item.id,
          name: currentName,
          presence_rate: item.presence_rate,
          absence_duration: calculateAbsenceDuration(item.presence_rate),
        });
        if (item.childs) {
          acc = acc.concat(flattenData(item.childs, currentName));
        }
        return acc;
      }, []);
    };

    return flattenData([data['12']]);
  };

  const calculateAbsenceDuration = (presenceRate) => {
    const absenceRate = 100 - presenceRate;
    return `${absenceRate} days`;
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 300 },
    { field: 'absence_duration', headerName: 'Absence Duration', width: 200 },
  ];

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner animation="grow" />
      </div>
    );
  if (error)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Error: {error}</div>
      </div>
    );

  return (
    <Container className="content">
      <Row style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ height: 800, width: '100%' }}>
          <DataGrid rows={rows} columns={columns} pageSize={10} />
        </div>
      </Row>
    </Container>
  );
};

export default Dashboard;
