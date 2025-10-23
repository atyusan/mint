import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Terminals: React.FC = () => {
  return (
    <Box>
      <Typography
        variant='h4'
        component='h1'
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        Terminals
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant='body1'>
          Terminal management interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Terminals;
