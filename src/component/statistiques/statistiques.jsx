import React, { useState } from 'react';
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
import SingleLineImageList from './SingleLineImageList/SingleLineImageList'; // Assume this handles image display
import './statistiques.css';

export default function MultiActionAreaCard() {
  const { data: rawData, loading, error } = useSelector((state) => state.dashboard);

  const data = Array.isArray(rawData?.data) ? rawData.data : rawData;

  const [open, setOpen] = useState(false);
  const [currentList, setCurrentList] = useState([]);
  const [viewMode, setViewMode] = useState('compagnies'); // 'compagnies' ou 'brigades'
  const [selectedCompagnie, setSelectedCompagnie] = useState(null);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [selectedBtId, setSelectedBtId] = useState(null); // Stocke l'ID de la brigade pour afficher ses images

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
    setImagePopupOpen(true); // Ouvre le popup
  };

  const handleImagePopupClose = () => {
    setSelectedBtId(null); // Réinitialise l'ID
    setImagePopupOpen(false); // Ferme le popup
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  if (!data || data.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <>
      {data.map((item) => (
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
              <ListItem key={index} className="list-item">
                <ListItemText primary={item.name} className="list-item-text" />
                {viewMode === 'compagnies' ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDetail(item)}
                    className="detail-button"
                  >
                    Détail
                  </Button>
                ) : (
                  <div className="icon-buttons">
                    <Button variant="contained" color="success">
                      {item.presence_rate}%
                    </Button>
                    <IconButton>
                      <ChartIcon />
                    </IconButton>
                    <IconButton>
                      <ImageIcon onClick={() => handleImagePopupOpen(item.id)} />
                    </IconButton>
                  </div>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
          {viewMode === 'brigades' && (
            <Button onClick={handleBack} variant="contained" color="primary">
              Retour
            </Button>
          )}
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Fermer
          </Button>
        </div>

      </Dialog>

      {/* Popup pour les images */}
      <Dialog
        open={imagePopupOpen}
        onClose={handleImagePopupClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Images associées</DialogTitle>
        <DialogContent>
          {selectedBtId && <SingleLineImageList bt_id={selectedBtId} />}
        </DialogContent>
        <Button onClick={handleImagePopupClose} style={{ margin: '10px' }}>
          Fermer
        </Button>
      </Dialog>
    </>
  );
}
