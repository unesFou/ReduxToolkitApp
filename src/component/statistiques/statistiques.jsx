import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import ErrorPage from './../error/Error';
import SingleLineImageList from './SingleLineImageList/SingleLineImageList';
import './statistiques.css';

export default function MultiActionAreaCard() {
  
  const { cache: rawData, loading, error } = useSelector((state) => state.dashboard);
  //const data = Array.isArray(rawData?.data) ? rawData.data : rawData;
  
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentList, setCurrentList] = useState([]);
  const [viewMode, setViewMode] = useState('compagnies'); // 'compagnies' ou 'brigades'
  const [selectedCompagnie, setSelectedCompagnie] = useState(null);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [selectedBtId, setSelectedBtId] = useState(null); // Stocke l'ID de la brigade pour afficher ses images
  // const [nameDialog, setNameDialog] = useState(''); 
  
  useEffect(() => {
   // if (!rawData?.data) {
     // const preparedData = Array.isArray(rawData) ? rawData.map(e=>e.data).flat() : rawData;
      const preparedData = Array.isArray(rawData?.data) ? rawData?.data.flat() : rawData.flat();
      setData(preparedData.map(e => e.data).flat() );
    //}else{
      //const preparedData = Array.isArray(rawData?.data) ? rawData?.data : rawData;
      //setData(preparedData);
   // }
  }, []);

  
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
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <ErrorPage errorMessage={error} />;
  }

  if (!data || data.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <>
      {data && data.map((item) => (
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
