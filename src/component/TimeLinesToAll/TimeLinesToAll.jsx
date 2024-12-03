import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import ApexChart from 'react-apexcharts';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { fetchTimelineData } from './../../features/timelineSlice/timelineSlice';

import './TimeLinesToAll.css';

const TimeLinesToAll = () => {
  const dispatch = useDispatch();
  const { data: rawData, loading, error } = useSelector((state) => state.dashboard);
  const { data: notifData } = useSelector((state) => state.timeline); // Supposons que vous avez un state pour les notifications

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
    { field: 'notifications', headerName: 'Notifications', width: 150 },
  ];
  
  const thirdGridColumns = [
    { field: 'name', headerName: 'Brigade', width: 150 },
    {
      field: 'chart',
      headerName: 'Notifications en Temps Réel',
      minWidth: 750,
      renderCell: (params) => params.value,
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

    // Récupérer la date de début et de fin pour les notifications
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);

    // Dispatcher les notifications pour chaque enfant avec les paramètres nécessaires
    parent.childs.forEach((child) => {
      dispatch(fetchTimelineData({
       // ids: [child.id],
        unite_id: child.id,
        date_start: start, //.toISOString(),
        date_end: end //.toISOString(),
      }));
    });
  };

  // const handleChildRowClick = (params) => {
  //   const child = childRows.find((c) => c.id === params.row.id);
  //   if (!child || !child.childs) return;

  //   const grandChildren = child.childs.map((grandChild) => ({
  //     id: grandChild.id,
  //     name: grandChild.name,
  //     notifications: grandChild.camera_ids?.reduce((total, camera) => {
  //       return total + (camera.notifications?.length || 0);
  //     }, 0) || 0,
  //     camera_ids: grandChild.camera_ids,
  //   }));

  //   setGrandChildRows(grandChildren);
  //   setThirdGridRows([]);

  //   // Dispatcher les notifications pour chaque petit-enfant avec les paramètres nécessaires
  //   child.childs.forEach((grandChild) => {
  //     dispatch(fetchTimelineData({
  //       ids: [grandChild.id],
  //       unite_id: child.unite_id,
  //       date_start: new Date().toISOString(), // Vous pouvez ajuster les dates si nécessaire
  //       date_end: new Date().toISOString(),   // Vous pouvez ajuster les dates si nécessaire
  //     }));
  //   });
  // };
  const handleChildRowClick = (params) => {
    const child = childRows.find((c) => c.id === params.row.id);
    if (!child || !child.childs) return;
  
    // Récupérer les IDs de tous les childs.childs
    const grandChildIds = child.childs.flatMap((grandChild) => grandChild.id);
  
    // Dates pour les notifications
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
  
    // Loop sur les grandChildIds pour dispatcher les requêtes et collecter les résultats
    grandChildIds.forEach((id) => {
      dispatch(
        fetchTimelineData({
          unite_id: id.id,
          date_start: start.toISOString(),
          date_end: end.toISOString(),
        })
      );
    });
  
    // Mettre à jour les lignes du tableau des Brigades
    const grandChildren = child.childs.map((grandChild) => ({
      id: grandChild.id,
      name: grandChild.name,
      notifications: grandChild.camera_ids?.reduce((total, camera) => {
        return total + (camera.notifications?.length || 0);
      }, 0) || 0,
    }));
  
    setGrandChildRows(grandChildren);
  
    // Traçage des graphiques (dépend de la réponse API)
    // const thirdGridData = grandChildren.map((grandChild) => ({
    //   id: grandChild.id,
    //   name: grandChild.name,
    //   chart: (
    //     <ApexChart
    //       options={{
    //         chart: { type: 'bar', height: 150 },
    //        // xaxis: { categories: [`Child ID: ${grandChild.id}`] },
    //         title: { text: '' },
    //         plotOptions: { bar: { horizontal: true } },
    //       }}
    //       series={[
    //         {
    //           name: 'Notifications',
    //           data: [grandChild.notifications],
    //         },
    //       ]}
    //       type="bar"
    //       height="100%"
    //     />
    //   ),
    // }));
    const thirdGridData = grandChildren.map((grandChild) => ({
      id: grandChild.id,
      name: grandChild.name,
      chart: (
        <ApexChart
          options={{
            chart: { type: 'bar', height: 150 },
            yaxis: { categories: [`Child ID: ${grandChild.id}`] }, // Utiliser yaxis pour les catégories
            title: { text: '' },
            plotOptions: { bar: { horizontal: true } }, // horizontal true pour changer l'orientation
          }}
          series={[
            {
              name: 'Notifications',
              data: [grandChild.notifications],
            },
          ]}
          type="bar"
          height="100%"
        />
      ),
    }));
    
    
  
    setThirdGridRows(thirdGridData);
  };
  
  const handleGrandChildRowClick = (params) => {
    const selectedGrandChild = grandChildRows.find((g) => g.id === params.row.id);
    if (!selectedGrandChild) return;

    const chartData = selectedGrandChild.camera_ids?.map((camera) => ({
      name: camera.name,
      notifications: camera.notifications?.length || 0,
    })) || [];

    const dataForThirdGrid = chartData.map((item) => ({
      id: item.name,
      name: item.name,
      chart: (
        <ApexChart
          options={{
            chart: { type: 'bar', height: 150 },
            xaxis: { categories: [item.name] },
            title: { text: `${item.name} Notifications` },
            plotOptions: {
              bar: { horizontal: true },
            },
          }}
          series={[{ name: 'Notifications', data: [item.notifications] }]}
          type="bar"
          height="100%"
        />
      ),
    }));

    setThirdGridRows(dataForThirdGrid);

    // Vous pouvez aussi ajouter le dispatch ici si vous avez des notifications à récupérer
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

      {/* {grandChildRows.length > 0 && (
        <div className="table-container">
          <h3>Détails par Brigade</h3>
          <DataGrid
            className="data-grid"
            rows={grandChildRows}
            columns={thirdGridColumns}
            pageSize={5}
            onRowClick={handleGrandChildRowClick}
          />
        </div>
      )} */}

      {thirdGridRows.length > 0 && (
        <div >
          <h3>Temps réel des absences</h3>
          <DataGrid
            className="data-grid"
            rows={thirdGridRows}
            columns={thirdGridColumns}
           // columns={[{ field: 'username', width: 200 }, { field: 'age' }]}
            pageSize={5}
            disableSelectionOnClick
          />
        </div>
      )}
    </div>
  );
};

export default TimeLinesToAll;
