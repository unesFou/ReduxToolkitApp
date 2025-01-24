//import React from 'react';
import React, { useState } from 'react';

import ApexChart from 'react-apexcharts';


const TimeLineChart = ({ grandChild , start , end}) => {
  console.log('Data Notifs ', grandChild);

  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const time = `${hours} : ${minutes}`
  //const [rows, setRows] = useState([]);

  // Définir l'heure de début et de fin de la journée
  const startOfDay = new Date();
  startOfDay.setHours(8, 0, 0, 0);
  // const endOfDay = new Date(startOfDay);
  // endOfDay.setHours(24, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(24, 0, 0, 0);



  // Transformer les données du grandChild en données utilisables par ApexCharts
  const transformGrandChildToTimelineData = (unite_id) => {
    if (!Array.isArray(grandChild?.dataChart)) return { presenceData: [], absenceData: [] };
  
    const presenceData = [];
    const absenceData = [];
    const filteredData = grandChild.dataChart.filter((child) => child.unite_id === unite_id);
  
    // Trier les périodes d'absence pour éviter les chevauchements dans les calculs
    const absenceRanges = filteredData.map((child) => ({
      start: new Date(child.date_s),
      end: new Date(child.date_e),
    })).sort((a, b) => a.start - b.start);
    // setRows(absenceRanges)
    // console.log('absenceRanges',absenceRanges)
    // Début de la journée
    let currentStart = startOfDay;
  
    absenceRanges.forEach((range) => {
      const { start, end } = range;
  
      // Ajouter la période de présence avant l'absence si elle existe
      if (currentStart < start) {
        presenceData.push({
          x: 'Présence',
          y: [
            (currentStart - startOfDay) / (1000 * 60 * 60), // Début de la période de présence
            (start - startOfDay) / (1000 * 60 * 60),       // Début de l'absence
          ],
          start : new Date(range.start).toLocaleString(),
          end : new Date(range.end).toLocaleString()
        });
      }
  
      // Ajouter la période d'absence
      absenceData.push({
        x: 'Absence',
        y: [
          Math.max((start - startOfDay) / (1000 * 60 * 60), 0), // Début de l'absence
          Math.min((end - startOfDay) / (1000 * 60 * 60), 16),  // Fin de l'absence
        ],
        start : new Date(range.start).toLocaleString(),
        end : new Date(range.end).toLocaleString()
      });
  
      // Mettre à jour le début courant pour la prochaine période
      currentStart = end;
    });
  
    // Ajouter une période de présence après la dernière absence si elle existe
    if (currentStart < time) {
      presenceData.push({
        x: 'Présence',
        y: [
          (currentStart - startOfDay) / (1000 * 60 * 60), // Début après la dernière absence
          (endOfDay - startOfDay) / (1000 * 60 * 60),     // Fin de la journée
        ],
      });
    }
  
    return { presenceData, absenceData };
  };
  

  // Récupérer les données transformées en appelant la fonction avec l'unite_id
  const { presenceData, absenceData } = transformGrandChildToTimelineData(grandChild.id);
  
  // const startHourforChart = 8;
  // const nowOfChart = new Date;
  // const currentOfChart = nowOfChart.getHours() + nowOfChart.getMinutes() / 60;

  return (
    <ApexChart
      options={{
        chart: {
          type: 'rangeBar',
          height: 150,
        },
        tooltip : {
          custom : function({series , seriesIndex , dataPointIndex , w}){
            const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
            return `
            <div style="padding:8px; border: 1px solid #ccc ; background-color: white ; white : 30% ;height:5%; z-index : 1">
                <strong><em>Start : </em></strong> <strong style="color:red">${data.start}</strong>
                <strong><em>End : </em></strong><strong style="color:red">${data.end}</strong><br />
            </div>`
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          min: 0,
          max: 4,
          labels: {
            formatter: (value) => `${Math.floor(value + 8)}h`, // Ajouter 8 pour démarrer à 08h00
          },
        },
        yaxis: {
          categories: ['Absence', 'Présence'],
        },
        colors: ['#FF5733', '#28a745'], 
        title: {
          text: '',
        },
      }}
      series={[
        {
          name: 'Absence',
          data: absenceData,
        },
        {
          name: 'Présence',
          data: presenceData,
        },
      ]}
      type="rangeBar"
      height="100%"
    />
  );
};

export default TimeLineChart;
