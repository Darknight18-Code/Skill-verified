import { useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

type ToastVariant = AlertColor | 'destructive';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: ToastVariant;
}

export const useToast = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<ToastVariant>('info');

  const toast = useCallback((options: ToastOptions | string) => {
    if (typeof options === 'string') {
      setMessage(options);
      setSeverity('info');
    } else {
      setMessage(options.description);
      setSeverity(options.variant || 'info');
    }
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  // Map 'destructive' to 'error' for Material UI
  const mappedSeverity = severity === 'destructive' ? 'error' : severity;

  return {
    toast,
    ToastComponent: () => (
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={mappedSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    ),
  };
}; 