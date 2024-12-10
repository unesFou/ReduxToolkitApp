import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Table, Spinner } from 'react-bootstrap';
import { fetchTimelineData } from './../../../features/timelineSlice/timelineSlice';
import axios from 'axios';
import { FaImage } from 'react-icons/fa';
import Alert from '@mui/material/Alert';

export default function SingleLineImageList({ bt_id }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [nameDialog, setNameDialog] = useState(''); 

  const dispatch = useDispatch();

  // Nouvelle fonction pour traiter l'image en Base64
  const handleImageInBase64 = (base64String) => {
    const cleanedImageString = base64String.replace(/^'|'$/g, '');
    const cleanedImageString1 = JSON.parse(cleanedImageString).map(e => e.img);
    const decodedImage = atob(cleanedImageString1);
    return `data:image/png;base64,${decodedImage}`;
  };

  // Fonction de récupération des images
  const fetchData = async () => {
    try {
      const start = new Date();
      start.setHours(8, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 0, 0);

      // Récupérer les données de timeline
      const timelineResults = await dispatch(
        fetchTimelineData({
          bt_id,
          date_start: start.toISOString().slice(0, 16),
          date_end: end.toISOString().slice(0, 16),
        })
      ).unwrap();

      // Enregistrer les notifications pour affichage
      const notifications = timelineResults.data.notifs || [];
      setNotifications(notifications);

      const notificationIds = notifications.map((notif) => notif.id);

      // Récupérer les images des notifications
      const imageResults = await Promise.all(
        notificationIds.map((id) =>
          axios
            .post(`http://localhost:8069/api/img_notif/${id}`, { params: {} }, { withCredentials: true })
            .then((res) => {
              if (typeof res.data.result === 'string') {
                return handleImageInBase64(res.data.result);
              }
              return res.data.result;
            })
            .catch((err) => {
              console.error(`Erreur pour l'ID ${id}:`, err);
              return null;
            })
        )
      );

      const validResults = imageResults.filter((res) => res !== null);
      setImages(validResults);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bt_id, dispatch]);

  // Gérer l'affichage de l'image en dessous du tableau
  const handleImageClick = (index) => {
    setCurrentImage(images[index]);
  };

  // Fonction pour formater une date ISO en hh:mm:ss
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0'); // Formate les heures avec 2 chiffres
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Formate les minutes avec 2 chiffres
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Formate les secondes avec 2 chiffres
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="popup-container" style={{ width: '100%', margin: 'auto'}}>
      {/* Tableau des notifications */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', height: '80vh', width: '100%' }}>
          {/* Première partie : Tableau avec scroll */}
          <div style={{ flex: 1, overflowY: 'auto', marginRight: '20px' }}>
            <table className="table table-hover">
              <thead>
                <tr style={{ textAlign: 'center' }}>
                  <th scope="col">Date de début</th>
                  <th scope="col">Date de fin</th>
                  <th scope="col">Durée</th>
                  <th scope="col">Type</th>
                  <th scope="col">Image</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif, index) => (
                  <tr key={notif.id} style={{ textAlign: 'center' ,fontFamily: 'initial'}}>
                    <td>{formatTime(notif.date_s)}</td>
                    <td>{formatTime(notif.date_e)}</td>
                    <td >
                      <div style={{ textAlign: 'center', fontFamily: 'initial' }}>
                        <Alert 
                          severity="error" 
                          style={{ 
                            backgroundColor: '#fdecea',
                            color: '#a9150b',
                            fontSize: '14px', 
                            fontFamily: 'initial',
                            textAlign : 'center'
                          }}
                        >
                          {notif.duration}
                        </Alert>
                        </div>
                      </td>

                    <td>{notif.type}</td>
                    <td>
                      {/* Icône cliquable pour afficher l'image */}
                      <button
                        onClick={() => handleImageClick(index)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <FaImage size={24} color="blue" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deuxième partie : Image */}
          {currentImage && (
            <div style={{ flex: 1 }}>
              <img
                src={currentImage}
                alt="Large view"
                className="img-fluid"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
