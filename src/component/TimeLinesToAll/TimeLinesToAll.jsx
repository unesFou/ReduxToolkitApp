import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import ApexChart from 'react-apexcharts';
import './TimeLinesToAll.css';

const TimeLinesToAll = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [selectedData, setSelectedData] = useState(null);
  const [chartData, setChartData] = useState({
    series: [{ name: '', data: [] }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        events: {
          dataPointSelection: (event, chartContext, { dataPointIndex }) => {
            const selectedRow = data[dataPointIndex];
            handleChartClick(selectedRow);
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
        },
      },
      xaxis: { categories: [] },
      title: { text: 'Total Notifications by Parent', align: 'center' },
    },
  });
  const [tableData, setTableData] = useState([]);

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
    const start = getStartDate();
    const end = getEndDate();
    dispatch(fetchDashboardData({ startDate: start, endDate: end }));
  }, [dispatch]);

  useEffect(() => {
    if (data && data.length > 0) {
      const chartSeriesData = data.map((parent) => ({
        name: parent.name,
        data: [parent.totalDuration || 0],
      }));

      setChartData((prev) => ({
        ...prev,
        series: chartSeriesData,
        options: {
          ...prev.options,
          xaxis: {
            categories: data.map((parent) => parent.name),
          },
        },
      }));

      const initialTableData = data.map((parent) => ({
        id: parent.id,
        name: parent.name,
        notifications: parent.totalNotifications || 0,
      }));
      setTableData(initialTableData);
    }
  }, [data]);

  const handleChartClick = (selectedRow) => {
    if (!selectedRow?.relevantData?.childs) return;

    const children = selectedRow.relevantData.childs;

    const tableRows = children.map((child) => {
      const totalNotifications = child?.camera_ids?.reduce(
        (acc, camera) => acc + (camera?.notifications?.length || 0),
        0
      );
      return {
        id: child.id,
        name: child.name,
        notifications: totalNotifications,
      };
    });

    setSelectedData(selectedRow);
    setTableData(tableRows);

    const chartSeries = children.map((child) => ({
      name: child.name,
      data: [child?.camera_ids?.reduce((acc, camera) => acc + (camera?.notifications?.length || 0), 0)],
    }));

    setChartData({
      series: chartSeries,
      options: {
        ...chartData.options,
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          title: { text: 'Notifications Count' },
        },
        yaxis: {
          categories: children.map((child) => child.name),
          title: { text: 'Child Names' },
        },
        title: {
          text: 'Notifications per Child',
          align: 'center',
        },
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
 if (data){
  return (
    <div className="timeLinesToAll">
      <div className="chart-container">
        {chartData.series.length > 0 && chartData.options.xaxis.categories.length > 0 ? (
          <ApexChart options={chartData.options} series={chartData.series} type="bar" width="100%" height="100%" />
        ) : (
          <div>No chart data available</div>
        )}
      </div>
      <div className="table-container">
        <DataGrid
          className="data-grid"
          rows={tableData}
          columns={[
            { field: 'name', headerName: 'Région', width: 350 },
            { field: 'notifications', headerName: 'Nombre Notifications', width: 200 },
          ]}
          pageSize={5}
        />
      </div>

    </div>
  )};
};

export default TimeLinesToAll;
