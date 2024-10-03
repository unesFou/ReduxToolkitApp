import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

const chartSetting = {
  xAxis: [
    {
      label: 'Presence Rate (%)',
    },
  ],
  yAxis: [
    {
      scaleType: 'band',
      dataKey: 'name',
    },
  ],
  width: 500,
  height: 400,
};

const valueFormatter = (value) => `${value}%`;

export default function HorizontalBars({ xData, seriesData }) {
  // Prepare dataset from xData and seriesData
  const dataset = xData.map((label, index) => ({
    name: label,
    value: seriesData[index][0], // Assuming seriesData is in the format [[value], [value], ...]
  }));

  return (
    <BarChart
      dataset={dataset}
      yAxis={[{ scaleType: 'band', dataKey: 'name' }]}
      series={[{ dataKey: 'value', label: 'Presence Rate', valueFormatter }]}
      layout="horizontal"
      {...chartSetting}
    />
  );
}
