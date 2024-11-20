import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ChildCard = ({ dataToCard , child }) => {

  return (
    <Card style={{ margin: '10px', cursor: 'pointer', border: '1px solid #ccc' }}>
      <CardContent>
        {/* <Typography variant="h6">{formattedDuration}</Typography> */}
        <Typography variant="body2" style={{fontWeight: 'bold'}}>unité : {dataToCard.name} </Typography>
        
        <Typography variant="body2" style={{fontWeight: 'bold'}}>Total d'absence: {dataToCard.durationSum} minutes</Typography>
        {/* {notifications && notifications.length > 0 ? (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>
                {notification.date_s} - {notification.date_e || 'N/A'} (Duration: {notification.duration || 0} minutes)
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body2">No notifications</Typography>
        )} */}
      </CardContent>
    </Card>
  );
};
export default ChildCard;