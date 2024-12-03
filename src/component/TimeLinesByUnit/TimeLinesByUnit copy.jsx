import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimelineData } from '../../features/timelineSlice/timelineSlice';
import ApexChart from 'react-apexcharts';
import { CircularProgress } from '@mui/material';
import ChildCard from './ChildCard';

const TimeLinesByUnit = ({ allData, date_start, date_end }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.timeline);

  const hasFetchedIds = useRef(new Set());
  const [formattedData, setFormattedData] = useState([]);
  const [dataToCard , setDataToCard] = useState({});

  const parseDurationToMinutes = (durationString) => {
    const [hours, minutes, seconds] = durationString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  const convertMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  useEffect(() => {
    // Récupérer les IDs des enfants
    const childIds = allData?.childs
      ?.flatMap(child => child?.childs?.map(childChild => childChild?.id))
      .filter(Boolean)
      .filter(id => !hasFetchedIds.current.has(id));

    // Envoyer une action pour chaque ID non encore récupéré
    childIds.forEach(id => {
      hasFetchedIds.current.add(id);
      dispatch(fetchTimelineData({ bt_id: id, date_start, date_end }));
    });
  }, [allData, date_start, date_end, dispatch]);

  useEffect(() => {
    if (!loading && data?.notifs?.length > 0) {
      console.log('Data from Redux:', data);

      // Accumulation des données récupérées
      const aggregatedData = data.notifs.reduce((acc, notif) => {
        const id = notif.unite_id;
        const duration = parseDurationToMinutes(notif.duration || '0:00:00');
        if (acc[id]) {
          acc[id].totalDuration += duration;
        } else {
          acc[id] = { totalDuration: duration, unite_id: id };
        }
        return acc;
      }, {});

      console.log('Aggregated Data:', aggregatedData);

      // Formatage des données agrégées
      const newFormattedData = Object.values(aggregatedData)
        .map(({ unite_id, totalDuration }) => {
          const formattedDuration = convertMinutesToTime(totalDuration);
          const correspondingChild = allData?.childs
            ?.flatMap(child => child?.childs)
            ?.find(childChild => childChild?.id === unite_id);

          return {
            id: unite_id,
            name: correspondingChild?.name || 'Unknown',
            durationSum: formattedDuration,
          };
        })
        .filter(item => item.durationSum !== '00:00:00');

      console.log('Formatted Data:', newFormattedData);

      // Mise à jour de l'état avec les nouvelles données (sans écrasement)
      setFormattedData((prevData) => [...prevData, ...newFormattedData]);
    }
  }, [loading, data, allData]);

  // Préparer les données pour ApexCharts
  const seriesData = formattedData.map(item => parseDurationToMinutes(item.durationSum)); // Durée sous forme de minutes
  const categoriesData = formattedData.map(item => item.name); // Noms des unités

  if (error) {
    return <div>Error: {error.message || 'Something went wrong!'}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 0.75 }}>
        {loading && <CircularProgress />}
        {formattedData.length > 0 && (
          <ApexChart
            type="bar"
            series={[{ name: 'Duration', data: seriesData }]} // Envoie toutes les données
            options={{
              chart: {
                type: 'bar',
                events: {
                  click: (event, chartContext, { dataPointIndex }) => {
                    const clickedChild = formattedData[dataPointIndex];
                    if (clickedChild) {
                      console.log(clickedChild);
                      setDataToCard(clickedChild)
                    }
                  },
                },
              },
              plotOptions: { bar: { horizontal: true } },
              xaxis: {
                categories: categoriesData, // Envoie toutes les catégories
                title: { text: 'Duration (HH:MM:SS)' },
              },
              tooltip: {
                y: { formatter: (val) => `${val.toFixed(2)} minutes` },
              },
            }}
          />
        )}
      </div>
      <div style={{ flex: 0.25 }}>
        <ChildCard dataToCard={dataToCard} child={allData} />
      </div>
    </div>
  );
};

export default TimeLinesByUnit;
