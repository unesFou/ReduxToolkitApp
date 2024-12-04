import React from 'react';
import { Badge } from 'react-bootstrap'; // Ou utilisez un autre badge (par exemple, MUI Badge)

const TotalNotification = ({ data }) => {
  // Fonction pour calculer le total des notifications
  const calculateTotalNotifications = () => {
    let totalNotifications = 0;

    // Parcourir les données pour compter les notifications
    data.forEach(region => {
      region.childs.forEach(company => {
        company.childs.forEach(brigade => {
          if (brigade.notifications) {
            totalNotifications += brigade.notifications.length;
          }
        });
      });
    });

    return totalNotifications;
  };

  const totalNotifications = calculateTotalNotifications();

  return (
    <div>
      <Badge pill variant="info">
        {totalNotifications}
      </Badge>
    </div>
  );
};

export default TotalNotification;
