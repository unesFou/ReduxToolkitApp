import React from 'react';
import './TimelineCell.css';

const TimelineCell = ({ relevantData }) => {
  // Vérification de la validité des données
  if (!Array.isArray(relevantData?.childs)) {
    console.error('Relevant data is not an array', relevantData);
    return null;
  }

  // Calcul de la durée totale de toutes les notifications
  const totalDuration = relevantData.childs
    .flatMap(child => child.childs || [])
    .flatMap(e => e?.notifications || [])
    .reduce((sum, notif) => sum + (notif?.duration || 0), 0) || 0;

  return (
    <div className="timeline-container">
      {relevantData.childs.map((child, index) => {
        // Calcul de la durée pour chaque enfant (child)
        const childDuration = child.childs
          ?.flatMap(e => e?.camera_ids || [])  // Vérifiez si camera_ids est la bonne source de données
          .filter(e => e !== undefined)
          .reduce((sum, notif) => sum + (notif?.duration || 0), 0) || 0;

        // Définir la couleur de la ligne en fonction de la durée de l'enfant
        const lineColor = childDuration > 0 ? '#f7a7a7' : '#7af7a7';  // Si la durée est > 0, rouge, sinon vert

        return (
          <div key={index} className="timeline-segment" style={{ backgroundColor: lineColor, height: '5px' }}>
            {/* La largeur de la ligne est proportionnelle à la durée de l'enfant par rapport à la durée totale */}
            <div style={{ width: `${(childDuration / totalDuration) * 100}%`, backgroundColor: lineColor }} />
          </div>
        );
      })}

      {/* Affichage de la durée totale */}
      <div className="total-duration" style={{ marginTop: '10px', fontSize: '14px', color: '#333' }}>
        Total Duration: {totalDuration} min
      </div>
    </div>
  );
};

export default TimelineCell;
