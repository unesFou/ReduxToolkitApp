import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ChildCard = ({ child }) => {

  // Calculate the total duration
  // const totalDuration = child?.childs
  //   ?.flatMap(e => e?.camera_ids || [])
  //   ?.flatMap(camera => camera?.notifications || [])
  //   ?.reduce((sum, notification) => sum + (notification?.duration || 0), 0);

  const totalDuration =  child?.childs?.flatMap(e => e.childs)
                         ?.filter(camera => camera?.camera_ids)
                         .flatMap(c => c?.camera_ids)
                         .map(n => n?.notifications)
                         .reduce((sum, notification) => sum + (notification?.duration || 0), 0) 

  // Collect all notifications
  const notifications = child?.childs
    ?.flatMap(e => e?.camera_ids || [])
    ?.flatMap(camera => camera?.notifications || []);

  return (
    <Card style={{ margin: '10px', cursor: 'pointer', border: '1px solid #ccc' }}>
      <CardContent>
        <Typography variant="h6">{child.name}</Typography>
        <Typography variant="body2">Duration: {totalDuration} minutes</Typography>
        
        <Typography variant="body2">Notifications:</Typography>
        {notifications && notifications.length > 0 ? (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>
                {notification.date_s} - {notification.date_e || 'N/A'} (Duration: {notification.duration || 0} minutes)
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body2">No notifications</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildCard;



