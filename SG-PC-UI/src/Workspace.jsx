import React from 'react';
import { PromptProvider } from './contexts/PromptContext';
import PromptEditor from './components/PromptEditor';
import GraphViewer from './components/GraphViewer';
import { Box } from '@mui/material';

const Workspace = () => {
  return (
    <PromptProvider>
      <Box sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f5f5f7',
        display: 'flex'
      }}>
        <Box sx={{
          width: '55%',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          height: '100%',
          p: 2,
          boxSizing: 'border-box'
        }}>
          <PromptEditor />
        </Box>
        <Box sx={{
          width: '45%',
          height: '100%',
          p: 2,
          boxSizing: 'border-box'
        }}>
          <GraphViewer />
        </Box>
      </Box>
    </PromptProvider>
  );
};

export default Workspace;
