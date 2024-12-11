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
      const start = new Date();
      start.setHours(8, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 0, 0);

      const timelineResults = await dispatch(
        fetchTimelineData({
          bt_id,
          date_start: start.toISOString().slice(0, 16),
          date_end: end.toISOString().slice(0, 16),
        })
      ).unwrap();

      const notifications = timelineResults.data.notifs || [];
      setNotifications(notifications);

      const notificationIds = notifications.map((notif) => notif.id);

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

  const handleImageClick = (index) => {
    setCurrentImage(images[index]);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

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
            
            <Alert severity="success" style={{ fontSize: '16px', 
                                                                fontFamily: 'initial', 
                                                                textAlign: 'center',
                                                                display: 'flex', 
                                                                justifyContent: 'center', 
                                                                alignItems: 'center' }}>
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
                      {/* <th scope="col">Type</th> */}
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
                              alignItems: 'center'
                            }}
                          >
                            {notif.duration}
                          </Alert>
                        </td>
                        {/* <td>{notif.type}</td> */}
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
      )}
    </div>
  );
}
