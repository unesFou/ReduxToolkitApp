import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Card, Modal, Spinner } from 'react-bootstrap';
import { fetchTimelineData } from './../../../features/timelineSlice/timelineSlice';
import axios from 'axios';

export default function SingleLineImageList({ bt_id }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
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

      const notificationIds = timelineResults.data.notifs
        .flatMap((data) => data || [])
        .map((notif) => notif.id);

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

  // Gérer l'affichage de l'image en grand dans le modal
  const handleShowModal = (image) => {
    setCurrentImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="row">
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        images.map((item, index) => (
          <div className="col-6 col-md-4 col-lg-3 mb-4" key={index}>
            <Card>
              <Card.Img variant="top" src={item} onClick={() => handleShowModal(item)} />
              <Card.Body>
                {/* <Button variant="primary" onClick={() => handleShowModal(item)}>
                  View Image
                </Button> */}
              </Card.Body>
            </Card>
          </div>
        ))
      )}

      {/* Modal pour afficher l'image en grand */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={currentImage} alt="Large view" className="img-fluid" />
        </Modal.Body>
      </Modal>
    </div>
  );
}
