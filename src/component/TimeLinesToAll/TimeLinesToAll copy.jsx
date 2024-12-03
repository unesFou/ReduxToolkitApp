import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import ApexChart from 'react-apexcharts';
import './TimeLinesToAll.css';

const TimeLinesToAll = () => {
  const dispatch = useDispatch();
  const { data: rawData, loading, error } = useSelector((state) => state.dashboard);

  const [data, setData] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [chartData, setChartData] = useState({
    series: [{ name: '', data: [] }],
    options: {
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      xaxis: { categories: [] },
      title: { text: 'Child Notifications', align: 'center' },
    },
  });

  const tableColumns = [
    { field: 'name', headerName: 'Région', width: 150 },
    { field: 'notifications', headerName: 'Nombre Notifications', width: 250 },
  ];

  useEffect(() => {
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    dispatch(fetchDashboardData({ startDate: start.toISOString(), endDate: end.toISOString() }));
  }, [dispatch]);

  useEffect(() => {
    // Gestion de la structure des données
    if (rawData) {
      const normalizedData = Array.isArray(rawData) ? rawData : rawData.data || [];
      setData(normalizedData);
    }
  }, [rawData]);

  const handleRowClick = (params) => {
    const parent = data.find((p) => p.id === params.row.id);
    if (!parent || !parent.childs) return;

    const children = parent.childs.flatMap((child) => [child, ...(child.childs || [])]);

    const chartSeries = children.map((child) => {
      const totalNotifications = child.camera_ids?.reduce((total, camera) => {
        return total + (camera.notifications?.length || 0);
      }, 0);

      return {
        name: child.name,
        data: [totalNotifications || 0],
      };
    });

    setSelectedParent(parent);
    setChartData({
      series: chartSeries,
      options: {
        ...chartData.options,
        xaxis: {
          categories: [parent.name, ...children.map((child) => child.name)],
          labels: {
            style: {
              fontWeight: (val) => (val === parent.name ? 'bold' : 'normal'),
            },
          },
        },
        title: { text: `Notifications pour les unités de la ${parent.name}`, align: 'center' },
      },
    });
  };

  if (loading) return <Commet color="#32cd32" size="medium" text="" textColor="" />;
  if (error) return <div>Error loading data</div>;
  if (!data || data.length === 0) return <div>No data available</div>;

  return (
    <div className="timeLinesToAll">
      <div className="table-container">
        <DataGrid
          className="data-grid"
          rows={data.map((parent) => ({
            id: parent.id,
            name: parent.name,
            notifications: parent.totalNotifications || 0,
          }))}
          columns={tableColumns}
          pageSize={5}
          onRowClick={handleRowClick}
        />
      </div>
      <div className="chart-container">
        {chartData.series.length > 0 ? (
          <ApexChart options={chartData.options} series={chartData.series} type="bar" width="100%" height="100%" />
        ) : (
          <div>Cliquez Sur une Région ... </div>
        )}
      </div>
    </div>
  );
};

export default TimeLinesToAll;
