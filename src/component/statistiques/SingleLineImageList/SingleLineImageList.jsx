import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import IconButton from '@material-ui/core/IconButton';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { fetchTimelineData } from './../../../features/timelineSlice/timelineSlice';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  imageList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
  },
  title: {
    color: theme.palette.primary.light,
  },
  titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
}));

export default function SingleLineImageList({ bt_id }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);

  // Nouvelle fonction pour traiter l'image en Base64
  const handleImageInBase64 = (base64String) => {
    console.log("Chaîne Base64 reçue:", base64String); 
    const cleanedImageString = base64String.replace(/^'|'$/g, ''); 
    const cleanedImageString1 = JSON.parse(cleanedImageString).map(e=>e.img) 
    const decodedImage = atob(cleanedImageString1);
    return `data:image/png;base64,${decodedImage}`;
  };
  

  useEffect(() => {
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
        console.log('Notifs images', timelineResults);

        // Extraire les ID des notifications
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
                  return handleImageInBase64(res.data.result); // Utiliser la fonction de décodage base64
                }
                return res.data.result;
              })
              .catch((err) => {
                console.error(`Erreur pour l'ID ${id}:`, err);
                return null;
              })
          )
        );

        // Filtrer les réponses valides
        const validResults = imageResults.filter((res) => res !== null);
        setImages(validResults);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
  }, [bt_id, dispatch]);

  return (
    <div className={classes.root}>
      <ImageList className={classes.imageList} cols={2.5}>
        {images.map((item, index) => (
          <ImageListItem key={index}>
            <img src={item} alt={`Notification ${index}`} />
            <ImageListItemBar
              classes={{
                root: classes.titleBar,
                title: classes.title,
              }}
              actionIcon={
                <IconButton aria-label={`star notification ${index}`}>
                  <StarBorderIcon className={classes.title} />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
}
