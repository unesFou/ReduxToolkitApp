import React, { useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ChildCard = ({ child, isSelected }) => {

  useEffect(() => {
    console.log('child',child)
  })

  const convertSecondsToTimeFormat = (seconds) => {
    const hours = Math.floor(seconds / 3600); // Nombre d'heures
    const minutes = Math.floor((seconds % 3600) / 60); // Nombre de minutes restantes
    const remainingSeconds = seconds % 60; // Reste des secondes
    
    // Formatage en 'hh:mm:ss' avec des zéros devant si nécessaire
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <Card
      style={{
        margin: '10px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: isSelected ? '#a8ff96' : '#fff', // Changer la couleur de fond si sélectionné
        position: isSelected ? 'relative' : 'initial',  // Déplacer la carte en haut si sélectionnée
        top: isSelected ? '-10px' : '0', // Déplacer la carte vers le haut si sélectionnée
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent>
        
        <Typography variant="body2" style={{ fontWeight: 'bold' }}>
          Unité : {child.name}
        </Typography>
        <Typography variant="body2" style={{ fontWeight: 'bold' }}>
          Total d'absence : {convertSecondsToTimeFormat(child.absence_duration)}
        </Typography>
         <Typography variant="body2" style={{ fontWeight: 'bold' }}>
          Rate  : {child.presence_rate} %
        </Typography> 
      </CardContent>
    </Card>
  );
};

export default ChildCard;
