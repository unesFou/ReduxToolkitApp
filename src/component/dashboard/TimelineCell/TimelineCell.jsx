import React from 'react';
import './TimelineCell.css';

const TimelineCell = ({ timeline }) => {
  const events = timeline.split(', ');

  return (
    <div className="timeline-container">
      {events.map((event, index) => {
        const splitEvent = event.split(' (');
        const timeRange = splitEvent[0];
        const status = splitEvent[1] ? splitEvent[1].replace(')', '') : null;
        const color = status && status.includes('presence') ? 'green' : 'red';
        return (
          <div key={index} className="timeline-segment" style={{ backgroundColor: color , marginTop: '2.5%'}}>
            {timeRange} {status ? `(${status})` : ''}
          </div>
        );
      })}
    </div>
  );
};

export default TimelineCell;
