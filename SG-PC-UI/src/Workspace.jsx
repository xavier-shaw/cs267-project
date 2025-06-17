import React from 'react';
import { PromptProvider } from './contexts/PromptContext';
import PromptEditor from './components/PromptEditor';
import GraphViewer from './components/GraphViewer';
import { Container, Grid } from '@mui/material';

const Workspace = () => {
  return (
    <PromptProvider>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <PromptEditor />
          </Grid>
          <Grid item xs={12} md={7}>
            <GraphViewer />
          </Grid>
        </Grid>
      </Container>
    </PromptProvider>
  );
};

export default Workspace;
