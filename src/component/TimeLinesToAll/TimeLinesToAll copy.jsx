import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import ApexChart from 'react-apexcharts';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { fetchTimelineData } from './../../features/timelineSlice/timelineSlice';
import TimeLineChart from './TimeLineChart/TimeLineChart';
import './TimeLinesToAll.css';

const TimeLinesToAll = () => {
  const dispatch = useDispatch();
  const { data: rawData, loading, error } = useSelector((state) => state.dashboard);
  const { data: notifData } = useSelector((state) => state.timeline);

  const [data, setData] = useState([]);
  const [childRows, setChildRows] = useState([]);
  const [grandChildRows, setGrandChildRows] = useState([]);
  const [thirdGridRows, setThirdGridRows] = useState([]);

  useEffect(() => {
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    dispatch(fetchDashboardData({ startDate: start.toISOString(), endDate: end.toISOString() }));
  }, [dispatch]);

  useEffect(() => {
    if (rawData) {
      const normalizedData = Array.isArray(rawData) ? rawData : rawData.data || [];
      setData(normalizedData);
    }
  }, [rawData]);
  useEffect(() => {
    if (data.length > 0) {
      // Sélectionnez automatiquement la première ligne
      const firstParent = data[0];
      if (firstParent.childs) {
        const children = firstParent.childs.map((child) => ({
          id: child.id,
          name: child.name,
          notifications: child.camera_ids?.reduce((total, camera) => {
            return total + (camera.notifications?.length || 0);
          }, 0) || 0,
          childs: child.childs,
        }));
  
        setChildRows(children);
  
        // Charge les petits-enfants et les données du troisième tableau
        if (children.length > 0) {
          const firstChild = children[0];
          if (firstChild.childs) {
            const grandChildren = firstChild.childs.map((grandChild) => ({
              id: grandChild.id,
              name: grandChild.name,
              notifications: grandChild.notifications || 0,
            }));
  
            setGrandChildRows(grandChildren);
  
            const thirdGridData = grandChildren.map((grandChild) => ({
              id: grandChild.id,
              name: grandChild.name,
              chart: <TimeLineChart grandChild={grandChild.notifications} />,
            }));
  
            setThirdGridRows(thirdGridData);
          }
        }
      }
    }
  }, [data]);
  

  const parentTableColumns = [
    { field: 'name', headerName: 'Région', width: 150 },
    { field: 'notifications', headerName: 'Nombre Notifications', width: 250 },
  ];

  const childTableColumns = [
    { field: 'name', headerName: 'Compagnie', width: 150 },
    { field: 'notifications', headerName: 'Notifications', width: 150 },
  ];

  const grandChildColumns = [
    { field: 'name', headerName: 'Nom du Child', width: 150 },
    { field: 'notifications', headerName: 'Nombre Notifications', width: 150 },
  ];

  const thirdGridColumns = [
    { field: 'name', headerName: 'Brigade', width: 150 },
    {
      field: 'chart',
      headerName: 'Notifications en Temps Réel',
      minWidth: 750,
      renderCell: (params) => (
        <div>
          {/* Le graphique TimeLineChart ici */}
          <TimeLineChart grandChild={params.row} />
        </div>
      ),
    },
  ];

  const handleRowClick = (params) => {
    const parent = data.find((p) => p.id === params.row.id);
    if (!parent || !parent.childs) return;

    const children = parent.childs.map((child) => ({
      id: child.id,
      name: child.name,
      notifications: child.camera_ids?.reduce((total, camera) => {
        return total + (camera.notifications?.length || 0);
      }, 0) || 0,
      childs: child.childs,
    }));

    setChildRows(children);
    setGrandChildRows([]);
    setThirdGridRows([]);
  };

  const handleChildRowClick = async (params) => {
    const child = childRows.find((c) => c.id === params.row.id);
    if (!child || !child.childs) return;

    const grandChildIds = child.childs.map((grandChild) => grandChild.id);

    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);

    try {
      const results = await Promise.all(
        grandChildIds.map((id) =>
          dispatch(fetchTimelineData({
            bt_id: id,
            date_start: start.toISOString().slice(0, 16),
            date_end: end.toISOString().slice(0, 16),
          }))
        )
      );

      const grandChildren = child.childs.map((grandChild, index) => ({
        id: grandChild.id,
        name: grandChild.name,
        notifications: results,
       // notifications: results[index]?.payload?.notifications || 0,
      }));

      setGrandChildRows(grandChildren);

      const thirdGridData = grandChildren.map((grandChild) => ({
        id: grandChild.id,
        name: grandChild.name,
        dataChart : grandChild.notifications[0]?.payload?.notifs,
        chart: <TimeLineChart grandChild={grandChild.notifications[0]?.payload?.notifs} />,
      }));

      setThirdGridRows(thirdGridData);
    } catch (error) {
      console.error('Error fetching notification data:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log('error', error);
    return <div>Error loading data</div>;
  }

  if (!data || data.length === 0) return <div>No data available</div>;

  return (
    <div className="timeLinesToAll">
      <div className="table-container">
        <h2>Tableau des Régions</h2>
        <DataGrid
          className="data-grid"
          rows={data.map((parent) => ({
            id: parent.id,
            name: parent.name,
            notifications: parent.totalNotifications || 0,
          }))}
          columns={parentTableColumns}
          pageSize={5}
          onRowClick={handleRowClick}
        />
      </div>

      {childRows.length > 0 && (
        <div className="table-container">
          <h3>Détails par Compangines</h3>
          <DataGrid
            className="data-grid"
            rows={childRows}
            columns={childTableColumns}
            pageSize={5}
            onRowClick={handleChildRowClick}
          />
        </div>
      )}

      {thirdGridRows.length > 0 && (
        <div>
          <h3>Temps réel des absences</h3>
          <DataGrid
            className="data-grid"
            rows={thirdGridRows}
            columns={thirdGridColumns}
            rowHeight={200}
            pageSize={5}
            disableSelectionOnClick
          />
        </div>
      )}
    </div>
  );
};

export default TimeLinesToAll;
