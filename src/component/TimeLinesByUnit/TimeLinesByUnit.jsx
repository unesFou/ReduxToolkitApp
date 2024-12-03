import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ApexChart from 'react-apexcharts';
import { CircularProgress } from '@mui/material';
import ChildCard from './ChildCard';

const TimeLinesByUnit = ({ allData, date_start, date_end }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.timeline);

  const [chartData, setChartData] = useState([]);
  const [dataToCard, setDataToCard] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null); // Etat pour l'enfant sélectionné

  useEffect(() => {
    if (allData) {
      const childData = allData?.childs?.flatMap(child =>
        child?.childs?.map(childChild => ({
          name: childChild?.name,
          absence_duration: childChild?.abs_duration,
          presence_rate: childChild?.presence_rate,
        }))
      ).filter(child => child.name && child.absence_duration);
  
      // Trier les données par durée d'absence (par ordre décroissant ici)
      const sortedChildData = childData.sort((a, b) => b.absence_duration - a.absence_duration);
  
      const formattedChartData = sortedChildData.map(child => ({
        name: child.name,
        absence_duration: child.absence_duration,
        presence_rate: child.presence_rate,
      }));
  
      setChartData(formattedChartData);
      setDataToCard(sortedChildData);
    }
  }, [allData]);
  
  // Fonction pour gérer le clic sur le graphique
  const handleChartClick = (event, chartContext, config) => {
    const selectedName = chartData[config.dataPointIndex].name;  // Nom du child sélectionné
    const selectedAbsenceDuration = chartData[config.dataPointIndex].absence_duration;
    const selectedPresenteRate = chartData[config.dataPointIndex].presence_rate;
    
    

    // Trouver le child dans les données des cartes
    const selectedChild = dataToCard.find(child => child.name === selectedName && child.absence_duration === selectedAbsenceDuration 
                                                  );

    setSelectedChild(selectedChild);  // Mettre à jour l'état avec le child sélectionné
  };

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      events: {
        dataPointSelection: handleChartClick,  // Lier l'événement de clic du graphique
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    xaxis: {
      categories: chartData.map(data => data.name),
    },
    yaxis: {
      title: {
        // text: 'Absence Duration (minutes)',
      },
    },
    title: {
      text: 'Absence Duration Brigade',
      align: 'center',
    },
  };

  const series = [{
    name: 'Absence Duration',
    data: chartData.map(data => data.absence_duration),
  }];

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
      {/* Graphique à gauche */}
      <div style={{ flex: 3, minWidth: '60%' }}>
        {chartData.length > 0 ? (
          <ApexChart options={options} series={series} type="bar" height={350} />
        ) : (
          <div>Aucune absence trouvée</div>
        )}
      </div>

      {/* Cartes à droite */}
      <div style={{ flex: 1, minWidth: '30%' }}>
        {dataToCard.map((child, index) => (
          <ChildCard
            key={index}
            child={child}
            isSelected={selectedChild && selectedChild.name === child.name} // Passer une prop indiquant si la carte est sélectionnée
          />
        ))}
      </div>
    </div>
  );
};

export default TimeLinesByUnit;
