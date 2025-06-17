import React from 'react';
import { usePrompt } from '../contexts/PromptContext';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Chip
} from '@mui/material';

const GraphViewer = () => {
  const { sceneGraph, imageUrl, imageLoading } = usePrompt();

  const renderSceneGraph = () => {
    if (!sceneGraph) return null;

    return (
      <Box mb={3}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          Scene Graph
        </Typography>
        <Card sx={{ 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Entities
            </Typography>
            <List>
              {Object.values(sceneGraph.entities).map((entity) => (
                <ListItem 
                  key={entity.id}
                  sx={{ 
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="500">
                        {entity.name} 
                        <Chip 
                          label={entity.category}
                          size="small"
                          sx={{ ml: 1, fontSize: '0.85rem' }}
                        />
                      </Typography>
                    }
                    secondary={
                      entity.attributes.length > 0 && (
                        <Box mt={1}>
                          {entity.attributes.map((attr, idx) => (
                            <Chip
                              key={idx}
                              label={attr}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1, mb: 1, fontSize: '0.85rem' }}
                            />
                          ))}
                        </Box>
                      )
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Relations
            </Typography>
            <List>
              {sceneGraph.relationships.map((rel, idx) => (
                <ListItem 
                  key={idx}
                  sx={{ 
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontSize: '1.1rem' }}>
                        <Box component="span" fontWeight="500">{rel.subject}</Box>
                        <Box component="span" color="text.secondary" sx={{ mx: 1 }}>
                          {rel.name}
                        </Box>
                        <Box component="span" fontWeight="500">{rel.object}</Box>
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderImage = () => {
    if (imageLoading) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          sx={{
            backgroundColor: 'action.hover',
            borderRadius: 2,
            height: 400
          }}
        >
          <CircularProgress size={48} />
        </Box>
      );
    }

    if (!imageUrl) return null;

    return (
      <Box>
        <Typography variant="h5" gutterBottom fontWeight="500">
          Generated Image
        </Typography>
        <Card sx={{ 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box
              component="img"
              src={imageUrl}
              alt="Generated image"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 'calc(100vh - 400px)', // Adjust based on scene graph height
                objectFit: 'contain',
                borderRadius: 1,
                display: 'block'
              }}
            />
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        p: 2,
        overflow: 'auto'
      }}
    >
      <Box sx={{ flex: 1, overflow: 'auto', pr: 2 }}>
        {renderSceneGraph()}
        {renderImage()}
        {!sceneGraph && !imageUrl && (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            sx={{
              backgroundColor: 'action.hover',
              borderRadius: 2,
              p: 4,
              height: '100%'
            }}
          >
            <Typography 
              color="text.secondary"
              variant="h6"
              textAlign="center"
            >
              Enter a prompt to generate<br />scene graph and image
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GraphViewer;
