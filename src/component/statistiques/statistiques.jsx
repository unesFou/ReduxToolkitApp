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
import './statistiques.css';
//import './popup.css';

export default function MultiActionAreaCard() {
  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [open, setOpen] = useState(false);
  const [childs, setChilds] = useState([]);
  const [subChilds, setSubChilds] = useState([]);

  const handleOpen = (childs) => {
    setChilds(childs);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false); // Seulement fermer le popup sans réinitialiser subChilds
  };

  const handleDetail = (child) => {
    setSubChilds(child.childs || []); // Afficher les sous-enfants
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
          variant="contained"
          onClick={() => handleOpen(item.childs || [])}
          style={{ margin: '10px' }}
        >
          {item.name}
        </Button>
      ))}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Liste des Compagnies</DialogTitle>
        <DialogContent>
          {/* Liste principale */}
          <List>
            {childs.map((child, index) => (
              <ListItem key={index} className="list-item">
                <ListItemText primary={child.name} className="list-item-text" />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleDetail(child)}
                  className="detail-button"
                >
                  Détail
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <Button onClick={handleClose} style={{ margin: '10px' }}>
          Fermer
        </Button>
      </Dialog>

      {/* Liste des brigades affichée en dehors du Dialog */}
      {subChilds.length > 0 && (
        <div className="sub-list"  style={{border:'1px solid #ddd'}}>
          <div style={{alignItems:'center'}}>
          <Typography variant="h6" >Liste des Brigades</Typography>
          </div>
          <List>
              {subChilds.map((subChild, index) => (
                <ListItem key={index} className="sub-list-item">
                  <div className="card-item">
                    <ListItemText primary={subChild.name} className="list-item-text" />
                    <div className="icon-buttons">
                      <IconButton>
                        <ChartIcon />
                      </IconButton>
                      <IconButton>
                        <ImageIcon />
                      </IconButton>
                    </div>
                  </div>
                </ListItem>
              ))}
            </List>

        </div>
      )}
    </>
  );
}
