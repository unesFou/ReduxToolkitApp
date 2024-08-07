import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { Spinner } from 'react-bootstrap';
import { BarChart } from '@mui/x-charts/BarChart';

const Timelines = ({ startDate, endDate }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const transformData = (data) => {
    return data.map(item => ({
      month: item.name,
      presenceRate: item.presence_rate,
    }));
  };

  const dataset = data ? transformData(data) : [];

  const valueFormatter = (value) => `${value}%`;

  const chartSetting = {
    width: 1500,
    height: 750,
    // xAxis: [
    //   {
    //     label: 'Presence Rate',
    //   },
    // ],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner animation="grow" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <BarChart
        dataset={dataset}
        yAxis={[{ scaleType: 'band', dataKey: 'month' }]}
        series={[{ dataKey: 'presenceRate', valueFormatter , color:'#84c5ff' }]}
        layout="horizontal"
        {...chartSetting}
      />
    </div>
  );
};

export default Timelines;
