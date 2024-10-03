import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimelineData } from '../../features/timelineSlice/timelineSlice';
import ApexChart from 'react-apexcharts';
import { CircularProgress } from '@mui/material';

const TimeLines = ({ allData, date_start, date_end }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.timeline);
 

  const [formattedData, setFormattedData] = useState([]);

  const parseDurationToMinutes = (durationString) => {
    const [hours, minutes, seconds] = durationString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  useEffect(() => {
    if (allData && date_start && date_end) {
      let childIds = allData?.childs
        ?.flatMap(child => child?.childs?.map(childChild => childChild?.id))
        .filter(e => e !== undefined);

      // Dispatch fetchTimelineData for each child ID
      childIds.forEach(id => {
        if (id !== undefined) {
          dispatch(fetchTimelineData({ bt_id: id, date_start, date_end }));
        }
      });
    }
  }, [allData, date_start, date_end, dispatch]);

  useEffect(() => {
    console.log('data from get_notifs', data)
    if (data && data.notifs.length > 0 && allData) {
      // Ensure data is parsed correctly if it's a string
      const parsedData = Array.isArray(data) ? data : [data];

      // Map child data from allData to associate name with each fetched data
      const dataWithDurations = parsedData?.map(item => {
        try {
          // Parse the item result if it's a string
          const result = typeof item?.result === 'string' ? item?.result : item?.result;
          const notifs = result?.notifs || [];
          const totalDuration = '0:00:00';
          
          if(notifs.length > 0){
            totalDuration = notifs?.map(notification => parseDurationToMinutes(notification?.duration || '0:00:00'))
              .reduce((sum, duration) => sum + duration, 0);
          }else{
            return totalDuration;
          }

          // Find corresponding name from allData based on the id
          const correspondingChild = allData?.childs
            ?.flatMap(child => child?.childs)
            ?.find(childChild => childChild?.id === item?.id);

          return {
            id: item?.id,
            name: correspondingChild?.name,  // Use the name from allData
            durationSum: totalDuration || 0,
          };
        } catch (error) {
          console.error('Error parsing result:', error);
          return null;
        }
      }).filter(e => e !== null);

      setFormattedData(dataWithDurations || []);
    }
  }, [data, allData]);

  const handleChildClick = (childChilds) => {
    // Handle clicking on a child (if needed)
  };

  const seriesData = formattedData?.map(item => item.durationSum);
  const categoriesData = formattedData?.map(item => item.name);

  return (
    <div>
      {loading && <CircularProgress />}
      {error && <div>Error: {error}</div>}
      {formattedData && formattedData.length > 0 && (
        <ApexChart
          type="bar"
          series={[{
            name: 'Duration',
            data: seriesData,
          }]}
          options={{
            chart: {
              type: 'bar',
              events: {
                click: (event, chartContext, { dataPointIndex }) => {
                  const clickedChild = formattedData[dataPointIndex];
                  if (clickedChild) {
                    handleChildClick(clickedChild?.childs || []);
                  }
                },
              },
            },
            plotOptions: {
              bar: {
                horizontal: true,
              },
            },
            xaxis: {
              categories: categoriesData,
              title: {
                text: 'Duration (minutes)',
              },
              position: 'bottom',
            },
            yaxis: {
              title: {
                text: 'Units',
              },
              opposite: false,
            },
            tooltip: {
              y: {
                formatter: function (val) {
                  return val + ' minutes';
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default TimeLines;
