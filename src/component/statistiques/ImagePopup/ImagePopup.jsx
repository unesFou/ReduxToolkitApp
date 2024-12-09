import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

export default function ImagePopup({ open, onClose, images }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Images</DialogTitle>
      <DialogContent>
        {images.length > 0 ? (
          images.map((image, index) => (
            <img
              key={index}
              src={`data:image/png;base64,${image.img}`} // Assurez-vous que l'API renvoie une base64 valide
              alt={`Notification ${image.id}`}
              style={{ width: '100%', marginBottom: '10px' }}
            />
          ))
        ) : (
          <p>Aucune image disponible.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
