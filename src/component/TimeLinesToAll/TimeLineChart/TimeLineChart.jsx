import React from 'react';
import Plot from 'react-plotly.js';

const TimeLineChart = ({ grandChild }) => {
  console.log('grandChild', grandChild);

  const startOfDay = new Date();
  startOfDay.setHours(9, 0, 0, 0); // Début de journée à 09:00 locale

  const now = new Date(); // Heure actuelle locale

  const transformDataToTimeline = (grandChild) => {
    if (!Array.isArray(grandChild?.dataChart)) {
      return [];
    }

    const filteredData = grandChild.dataChart.map((child) => ({
      start: new Date(child.date_s),
      end: new Date(child.date_e),
    }));

    const segments = [];
    let currentTime = startOfDay;

    // Trier les données par date de début
    filteredData.sort((a, b) => a.start - b.start);

    filteredData.forEach(({ start, end }) => {
      // Ajouter une ligne verte (présence) si nécessaire
      if (currentTime < start) {
        segments.push({
          start: currentTime,
          end: start,
          type: 'presence', // Présence
        });
      }

      // Ajouter une ligne rouge (absence)
      segments.push({
        start,
        end,
        type: 'absence', // Absence
      });

      currentTime = end; // Mettre à jour le temps actuel
    });

    // Ajouter une ligne verte après la dernière absence si nécessaire
    if (currentTime < now) {
      segments.push({
        start: currentTime,
        end: now,
        type: 'presence', // Présence
      });
    }

    return segments;
  };

  const timelineSegments = transformDataToTimeline(grandChild);

  return (
    <Plot
      data={[
        ...timelineSegments.map((segment) => ({
          x: [segment.start.toISOString(), segment.end.toISOString()],
          y: [segment.type === 'presence' ? 0 : 1, segment.type === 'presence' ? 0 : 1],
          type: 'scatter',
          mode: 'lines',
          line: {
            color: segment.type === 'presence' ? '#28a745' : '#FF5733', // Vert pour présence, rouge pour absence
            width: 2,
          },
          name: segment.type === 'presence' ? 'Présence' : 'Absence',
        })),
      ]}
      layout={{
        title: '',
        xaxis: {
          type: 'date',
          tickformat: '%H:%M',
          range: [startOfDay.toISOString(), now.toISOString()],
          showgrid: true,
        },
        yaxis: {
          tickvals: [0, 1],
          ticktext: ['Présence', 'Absence'],
          showgrid: true,
        },
        showlegend: false,
        margin: { l: 60, r: 60, t: 60, b: 60 },
        responsive: true,
      }}
      style={{ width: '100%', height: '150px' }}
    />
  );
};

export default TimeLineChart;
