import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { fetchTimelineData } from './../../features/timelineSlice/timelineSlice';
import ErrorPage from './../error/Error';
import TimeLineChart from './TimeLineChart/TimeLineChart';
import './TimeLinesToAll.css';
import icone from '../../images/iconeImage.png';

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
    dispatch(fetchDashboardData({ date_start: start.toISOString().slice(0, 16), date_end: end.toISOString().slice(0, 16) }));
  }, [dispatch]);

  useEffect(() => {
    if (rawData) {
      const normalizedData = Array.isArray(rawData) ? rawData : rawData.data || [];
      setData(normalizedData);
    }
  }, [rawData]);

  useEffect(() => {
    if (data.length > 0) {
      // Sélectionnez automatiquement le premier parent
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
            const grandChildIds = firstChild.childs.map((grandChild) => grandChild.id);
  
            const start = new Date();
            start.setHours(7, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 0, 0);
  
            // Fetch notifications pour les petits-enfants
            Promise.all(
              grandChildIds.map((id) =>
                dispatch(fetchTimelineData({
                  bt_id: id,
                  date_start: start.toISOString().slice(0, 16),
                  date_end: end.toISOString().slice(0, 16),
                }))
              )
            )
              .then((results) => {
                const grandChildren = firstChild.childs.map((grandChild, index) => ({
                  id: grandChild.id,
                  name: grandChild.name,
                  notifications: results[index]?.payload?.notifications || 0,
                }));
  
                setGrandChildRows(grandChildren);
  
                const thirdGridData = grandChildren.map((grandChild) => ({
                  id: grandChild.id,
                  name: grandChild.name,
                  dataChart: results
                    .map((e) => e.payload)
                    .map((e) => e.data)
                    .flatMap((e) => e.notifs),
                  chart: (
                    <TimeLineChart
                      grandChild={results
                        .map((e) => e.payload)
                        .map((e) => e.data)
                        .flatMap((e) => e.notifs)}
                    />
                  ),
                }));
  
                setThirdGridRows(thirdGridData);
              })
              .catch((error) => {
                console.error('Error fetching data for grand children:', error);
              });
          }
        }
      }
    }
  }, [data, dispatch]);
  
  

  const parentTableColumns = [
    { field: 'name', headerName: 'Région', width: 150, filterable: true },
    { field: 'notifications', headerName: 'Notifications', width: 100, filterable: true },
  ];

  const childTableColumns = [
    { field: 'name', headerName: 'Compagnie', width: 150, filterable: true },
    { field: 'notifications', headerName: 'Notifications', filterable: true ,
      renderCell: (params) => (
        <div style={{ width: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {params.value}
        </div>
      ),
    },
  ];

  // const grandChildColumns = [
  //   { field: 'name', headerName: 'Nom du Child', width: 150, filterable: true },
  //   { field: 'notifications', headerName: 'Nombre Notifications', width: 150, filterable: true },
  // ];

  const thirdGridColumns = [
    { field: 'name', headerName: 'Brigade', width: 150, filterable: true },
    {
      field: 'chart',
      headerName: 'Notifications en Temps Réel',
      minWidth: 750,
      renderCell: (params) => (
        <div>
          <TimeLineChart grandChild={params.row} />
        </div>
      ),
    },
    {filed : '', headerName : 'images Absence',  width: 150, filterable: true ,renderCell : (paras) => (
      <div style={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50%'
      }}>
          {/* <button class="btn border border-2 border-dark"> */}
         <img src={icone}  alt="icone absence"className="w-12 h-8 mx-auto"style={{ maxWidth: '40%' }} />
          {/* </button> */}
      </div>
    )}
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
    start.setHours(7, 0, 0, 0);
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
   //   console.log('===============results=============',results)
  
      // Map grandChildren data with notifications from the API
      const grandChildren = child.childs.map((grandChild, index) => ({
        id: grandChild.id,
        name: grandChild.name,
        notifications: results[index]?.payload?.notifs || [], // Ensure all notifications are included
      }));
  
      setGrandChildRows(grandChildren);
  
      // Prepare third grid data, including all notifications from the results
      const thirdGridData = grandChildren.map((grandChild) => ({
        id: grandChild.id,
        name: grandChild.name,
        // Flatten all notifications from grandChild.notifications and ensure none are missed
        //dataChart: grandChild.notifications.flatMap((notification) => notification || []),
        dataChart : results.map(e => e.payload).map(e=>e.data).flatMap(e=>e.notifs) ,
        chart: (
          <TimeLineChart
            grandChild={grandChild.notifications.flatMap((notification) => notification || [])}
          />
        ),
      }));
  
      setThirdGridRows(thirdGridData);
  
    } catch (error) {
      console.error('Error fetching notification data:', error);
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log('error', error);
    return <ErrorPage errorMessage={error} />;
  }

  if (!data || data.length === 0) return <div>No data available</div>;

  return (
    <div className="timeLinesToAll">
      <div >
      <button type="button" class="btn btn-secondary"><h3>Tableau des Régions </h3> </button>
        <table class="table table-bordered table-striped" style={{marginTop: '4%'}}>
          <thead>
            <tr>
              <th>Région</th>
              <th>Notifications</th>
            </tr>
          </thead>
          <tbody>
            {data.map((parent) => (
              <tr style={{cursor: 'pointer'}} key={parent.id} onClick={() => handleRowClick({ row: parent })}>
                <td>{parent.name}</td>
                <td style={{textAlign:'center'}}>{parent.totalNotifications || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {childRows.length > 0 && (
        <div >
          <button type="button" class="btn btn-secondary"><h3>Détails par Compagnies</h3></button>
          <table class="table table-bordered table-hover" style={{marginTop: '4%'}}>
            <thead>
              <tr>
                <th>Compagnie</th>
                <th>Notifications</th>
              </tr>
            </thead>
            <tbody>
              {childRows.map((child) => (
                <tr style={{cursor: 'pointer'}} key={child.id} onClick={() => handleChildRowClick({ row: child })}>
                  <td>{child.name}</td>
                  <td style={{textAlign:'center'}}>{child.notifications}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {thirdGridRows.length > 0 && (
        <div className="main-table-container">
          <h3>Temps réel des absences</h3>
          <DataGrid
            className="data-grid"
            rows={thirdGridRows}
            columns={thirdGridColumns}
            rowHeight={200}
            autoHeight
            disableColumnSelector
            pageSize={5}
            disableSelectionOnClick
          />
        </div>
      )}
    </div>
  );
  
};

export default TimeLinesToAll;
