import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { fetchTimelineData } from './../../../features/timelineSlice/timelineSlice';
import axios from 'axios';
import { FaImage } from 'react-icons/fa';
import Alert from '@mui/material/Alert';

export default function SingleLineImageList({ bt_id }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false); // État pour le chargement de l'image
  const [notifications, setNotifications] = useState([]);

  const dispatch = useDispatch();

  const handleImageInBase64 = (base64String) => {
    const cleanedImageString = base64String.replace(/^'|'$/g, '');
    const cleanedImageString1 = JSON.parse(cleanedImageString).map((e) => e.img);
    const decodedImage = atob(cleanedImageString1);
    return `data:image/png;base64,${decodedImage}`;
  };

  const fetchData = async () => {
    try {
      const date_s = new Date();
      if (date_s.getHours() < 8) {
        date_s.setDate(date_s.getDate() - 2);
      } else {
        date_s.setDate(date_s.getDate() - 1);
      }
      date_s.setHours(8, 0, 0, 0);
      const date_e = new Date(date_s.getTime() +  (24 * 60 * 60 * 1000));
  
      // const dateStartRate = date_s.toISOString().slice(0, 16);
      // const dateEndRate = date_e.toISOString().slice(0, 16);
  
      const dateStartRate = date_s;
      const dateEndRate = date_e;

      const timelineResults = await dispatch(
        fetchTimelineData({
          bt_id,
          date_start: dateStartRate.toISOString().slice(0, 16),
          date_end: dateEndRate.toISOString().slice(0, 16),
        })
      ).unwrap();

      const notifications = timelineResults.data.notifs || [];
      setNotifications(notifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImageById = async (id) => {
    setImageLoading(true); // Indiquer que l'image est en train de se charger
    try {
      const response = await axios.post(
        `http://localhost:8069/api/img_notif/${id}`,
        { params: {} },
        { withCredentials: true }
      );

      if (response.data.result) {
        const image = handleImageInBase64(response.data.result);
        return image;
      }

      return null;
    } catch (error) {
      console.error(`Erreur pour l'ID ${id} :`, error);
      return null;
    } finally {
      setImageLoading(false); // Fin du chargement de l'image
    }
  };

  const handleImageClick = async (index) => {
    const notification = notifications[index];
    if (notification && notification.id) {
      const image = await fetchImageById(notification.id);
      if (image) {
        setCurrentImage(image);
      }
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    fetchData();
  }, [bt_id, dispatch]);

  return (
    <div className="popup-container" style={{ width: '100%', margin: 'auto' }}>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Alerte de succès si aucune notification */}
          {notifications.length === 0 && (
            <Alert
              severity="success"
              style={{
                fontSize: '16px',
                fontFamily: 'initial',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              Aucune notification d'absence
            </Alert>
          )}

          {/* Tableau des notifications */}
          {notifications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', height: '80vh', width: '100%' }}>
              <div style={{ flex: 1, overflowY: 'auto', marginRight: '20px' }}>
                <table className="table table-hover">
                  <thead>
                    <tr style={{ textAlign: 'center' }}>
                      <th scope="col">Date de début</th>
                      <th scope="col">Date de fin</th>
                      <th scope="col">Durée</th>
                      <th scope="col">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notif, index) => (
                      <tr key={notif.id} style={{ textAlign: 'center', fontFamily: 'initial' }}>
                        <td>{formatTime(notif.date_s)}</td>
                        <td>{formatTime(notif.date_e)}</td>
                        <td>
                          <Alert
                            severity="error"
                            style={{
                              fontFamily: 'initial',
                              textAlign: 'center',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {notif.duration}
                          </Alert>
                        </td>
                        <td>
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
              
              {currentImage && (
                <div style={{ flex: 1 }}>
                  {/* Affichage du chargement de l'image si l'image est en cours de chargement */}
                  {imageLoading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="danger" />
                    </div>
                  ) : (
                    <img
                      src={currentImage}
                      alt="Large view"
                      className="img-fluid"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
