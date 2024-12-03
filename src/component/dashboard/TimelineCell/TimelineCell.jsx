import React from "react";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

const TimelineCell = ({ relevantData }) => {

  // Conversion des secondes en format 'hh:mm:ss'
  // const convertSecondsToTimeFormat = (seconds) => {
  //   const hours = Math.floor(seconds / 3600); // Nombre d'heures
  //   const minutes = Math.floor((seconds % 3600) / 60); // Nombre de minutes restantes
  //   const remainingSeconds = seconds % 60; // Reste des secondes
    
  //   // Formatage en 'hh:mm:ss' avec des zéros devant si nécessaire
  //   return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  // };

  // Calcul du pourcentage de progression
 // const progressPercent = (relevantData / (360000 / 2)) * 100; // 360000 secondes correspond à 100 heures
  const progressPercent = (relevantData / 180000 ) * 100; // 360000 secondes correspond à 50 heures
  return (
    <div className="timeline-container" style={{ margin: "20px" }}>
      {/* Barre de progression pour la durée totale */}
      <Progress status="error" percent={Math.min(progressPercent, 100)} />
    </div>
  );
};

export default TimelineCell;
