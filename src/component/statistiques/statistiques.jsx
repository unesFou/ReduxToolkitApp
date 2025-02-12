import React, { useState, useEffect } from 'react';
import { useSelector , useDispatch } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ChartIcon from '@mui/icons-material/BarChart';
import ImageIcon from '@mui/icons-material/Image';
import Typography from '@mui/material/Typography';
import { Spinner } from 'react-bootstrap';
import ErrorPage from './../error/Error';
import { fetchDashboardData } from "../../features/dashboardSlice/dashboardSlice";
import SingleLineImageList from './SingleLineImageList/SingleLineImageList';
import './statistiques.css';

export default function MultiActionAreaCard() {
  
  const { data: rawData, loading, error } = useSelector((state) => state.dashboard);
  const selectedId = useSelector((state) => state.search.selectedId); // Récupérer l'id sélectionné
  //const data = Array.isArray(rawData?.data) ? rawData.data : rawData;
  
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentList, setCurrentList] = useState([]);
  const [viewMode, setViewMode] = useState('compagnies'); // 'compagnies' ou 'brigades'
  const [selectedCompagnie, setSelectedCompagnie] = useState(null);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [selectedBtId, setSelectedBtId] = useState(null); // Stocke l'ID de la brigade pour afficher ses images
  // const [nameDialog, setNameDialog] = useState(''); 
  const dispatch = useDispatch();
  
  useEffect(() => {

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

    // setStartDate(dateStartRate);
    // setEndDate(dateEndRate);
   // if (!rawData?.data) {
     // const preparedData = Array.isArray(rawData) ? rawData.map(e=>e.data).flat() : rawData;
     dispatch(fetchDashboardData({
                 date_start: dateStartRate.toISOString().slice(0, 16),
                 date_end: dateEndRate.toISOString().slice(0, 16),
               }));
      const preparedData = Array.isArray(rawData) ? rawData : rawData?.data;
      setData(preparedData);
    //}else{
      //const preparedData = Array.isArray(rawData?.data) ? rawData?.data : rawData;
      //setData(preparedData);
   // }
  }, []);

  useEffect(() => {
    const preparedData = Array.isArray(rawData) ? rawData : rawData?.data;
    setData(preparedData);
  }, [rawData]);

  const filteredData = selectedId
    ? data.filter((item) => item.id === selectedId)
    : data;

  
  const handleOpen = (compagnies) => {
    setCurrentList(compagnies);
    setViewMode('compagnies');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentList([]);
    setViewMode('compagnies');
  };

  const handleDetail = (compagnie) => {
    setSelectedCompagnie(compagnie);
    setCurrentList(compagnie.childs || []);
    setViewMode('brigades');
  };

  const handleBack = () => {
    if (viewMode === 'brigades') {
      setCurrentList(data);
      setViewMode('compagnies');
      setSelectedCompagnie(null);
    }
  };
  

  const handleImagePopupOpen = (bt_id) => {
    setSelectedBtId(bt_id); // Stocke l'ID pour le composant d'affichage d'images
    setImagePopupOpen(true); 
  };

  const handleImagePopupClose = () => {
    setSelectedBtId(null); // Réinitialise l'ID
    setImagePopupOpen(false); 
  };

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
        }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <ErrorPage errorMessage={error} />;
  }

  if (!data || data.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <>
      {data && filteredData.map((item) => (
        <Button
        key={item.id}
        onClick={() => handleOpen(item.childs || [])}
        style={{
          margin: '10px',
          width: '30%',
          height: '10%',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '5px 10px',
        }}
      >
        <div style={{ flex: 1, textAlign: 'left' }}>
          <span>{item.name}</span>
        </div>
        <div
        className={item.presence_rate < 80 ? 'blink' : ''}
          style={{
            padding: '5px 10px',
            backgroundColor: item.presence_rate < 80 ? 'red' : '#43c143',
            color: '#fff',
            borderRadius: '4px',
            textAlign: 'right',
          }}
        >
          <span >{item.presence_rate}%</span>
        </div>
      </Button>      
      
      ))}

<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
  <DialogTitle>
    {viewMode === 'compagnies' ? 'Liste des Compagnies' : 'Liste des Brigades'}
  </DialogTitle>
  <DialogContent>
    <List>
      {currentList.map((item, index) => (
        <ListItem key={index} className="list-item" style={{ marginBottom: '10px' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => viewMode === 'compagnies' ? handleDetail(item) : handleImagePopupOpen(item.id)}
          style={{
            margin: '5px',
            width: '100%',
            textAlign: 'left',
            padding: '10px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{item.name}</span>
          
          {/* Taux de présence avec fond coloré si inférieur à 80 */}
          <span
            style={{
              padding: '5px 10px',
              backgroundColor: item.presence_rate < 80 ? 'red' : 'green',
              color: '#fff',
              borderRadius: '4px',
              textAlign: 'right',
            }}
          >
            {item.presence_rate}%
          </span>
      
          {viewMode === 'brigades' && (
            <ImageIcon color="disabled" style={{display:'none'}}/>
            
          )}
        </Button>
      </ListItem>
      
      ))}
    </List>
  </DialogContent>
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
    {/* {viewMode === 'brigades' && (
      <Button onClick={handleBack} variant="contained" color="primary">
        Retour
      </Button>
    )} */}
    <Button onClick={handleClose} variant="outlined" color="secondary">
      Fermer
    </Button>
  </div>
</Dialog>


      {/* Popup pour les images */}
      <Dialog
      open={imagePopupOpen}
      onClose={handleImagePopupClose}
      maxWidth={false} // Désactive les largeurs prédéfinies
      PaperProps={{
        style: {
          width: '90%', // Largeur de 90%
          maxWidth: '90%', // Empêche les restrictions
          margin: 'auto', // Centre horizontalement
          height: '80vh', // Hauteur ajustée (si nécessaire)
          overflow: 'hidden', // Évite les débordements
        },
      }}
    >
      <DialogContent style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {selectedBtId && <SingleLineImageList bt_id={selectedBtId} />}
      </DialogContent>
      <Button onClick={handleImagePopupClose} style={{ margin: '10px' }}>
        Fermer
      </Button>
    </Dialog>
    </>
  );
}
