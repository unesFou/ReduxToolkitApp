import React from 'react';
import './TimelineCell.css';

const TimelineCell = ({ relevantData }) => {
  if (!Array.isArray(relevantData?.childs)) {
    console.error('Relevant data is not an array', relevantData);
    return null; // Handle error
  }

  const totalDuration = relevantData.childs
    .flatMap(child => child.childs || [])
    .flatMap(e => e?.notifications || [])
    .reduce((sum, notif) => sum + (notif?.duration || 0), 0) || 0;

  return (
    <div className="timeline-container">
      {relevantData.childs.map((child, index) => {
        const childDuration = child.childs
          ?.flatMap(e => e?.notifications || [])
          .reduce((sum, notif) => sum + (notif?.duration || 0), 0) || 0;

        const lineColor = childDuration > 0 ? '#f7a7a7' : '#7af7a7'; // Differentiate colors based on childDuration

        return (
          <div key={index} className="timeline-segment" style={{ backgroundColor: lineColor, height: '5px' }}>
            <div style={{ width: `${(childDuration / totalDuration) * 100}%`, backgroundColor: lineColor }} />
          </div>
        );
      })}
      <div className="total-duration" style={{ marginTop: '10px', color: '#333' }}>
        Total Duration: {totalDuration} min
      </div>
    </div>
  );
};

export default TimelineCell;
