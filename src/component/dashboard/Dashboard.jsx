import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { Container, Row, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import TimelineCell from './TimelineCell/TimelineCell';

import HelpIcon from '@mui/icons-material/Help';
import ImageIcon from '@mui/icons-material/Image';
import './Dashboard.css';

const Dashboard = ({ startDate, endDate }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  const selectedName = useSelector((state) => state.search.selectedName);

  useEffect(() => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const [rows, setRows] = useState([]);
  const [flatData, setFlatData] = useState([]);

  useEffect(() => {
    if (data) {
      const transformedData = transformData(data);
      setRows(transformedData.rows);
      setFlatData(transformedData.flatData);
    }
  }, [data]);

  const transformData = (data) => {
    const flatData = [];
    const rows = [];

    const flattenData = (items) => {
      return items.reduce((acc, item) => {
        const row = {
          id: item.id,
          name: item.name,
          presence_rate: item.presence_rate,
          absence_duration: calculateAbsenceDuration(item.presence_rate),
          timeline: formatTimeline(item.events || []),
          parent: item.parent || null,
        };
        acc.push(row);
        flatData.push(row);
        if (item.childs) {
          acc = acc.concat(flattenData(item.childs));
        }
        return acc;
      }, []);
    };

    const mainRows = flattenData([data['12']]);
    rows.push(...mainRows);

    return { rows, flatData };
  };

  const calculateAbsenceDuration = (presenceRate) => {
    const absenceRate = 100 - presenceRate;
    return `${absenceRate} days`;
  };

  const formatTimeline = (events) => {
    return events.map(event => {
      const start = format(new Date(event.start), 'yyyy-MM-dd HH:mm');
      const end = format(new Date(event.end), 'yyyy-MM-dd HH:mm');
      const status = event.status;
      return `${start} - ${end} (${status})`;
    }).join(', ');
  };

  const getFilteredRows = (selectedName) => {
    if (!selectedName) return rows;

    const filtered = new Set();

    const filterByName = (name, data) => {
      data.forEach(row => {
        if (row.name.includes(name)) {
          filtered.add(row.id);
          if (row.childs) {
            filterByName(name, row.childs);
          }
        }
      });
    };

    filterByName(selectedName, flatData);

    return rows.filter(row => filtered.has(row.id));
  };

  const filteredRows = getFilteredRows(selectedName);

  const columns = [
    { field: 'name', headerName: 'Name', width: 300 },
    { field: 'timeline', headerName: 'Timeline', width: 900, renderCell: (params) => <TimelineCell timeline={params.value} /> },
    { field: 'absence_duration', headerName: 'Absence Duration', width: 200 },
    { headerName: 'Détails', width: 100, renderCell: (params) => <><HelpIcon style={{color:'#79afcf'}}/> <ImageIcon style={{color:'#79afcf'}} /></>  },

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
    <Container className="content" style={{ margin: 'inherit' }}>
      <Row style={{ display: 'flex', flexWrap: 'wrap', width: '125%' }}>
        <div style={{ height: 720, width: '100%', margin: '2%' }}>
          <DataGrid rows={filteredRows} columns={columns} pageSize={10} />
        </div>
      </Row>
    </Container>
  );
};

export default Dashboard;
