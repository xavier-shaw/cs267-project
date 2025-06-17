import React from 'react';
import { usePrompt } from '../contexts/PromptContext';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';

const GraphViewer = () => {
  const { sceneGraph, pcData } = usePrompt();

  const renderSceneGraph = () => {
    if (!sceneGraph) return null;

    return (
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Scene Graph
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Entities:
            </Typography>
            <List dense>
              {Object.values(sceneGraph.entities).map((entity) => (
                <ListItem key={entity.id}>
                  <ListItemText
                    primary={`${entity.name} (${entity.category})`}
                    secondary={entity.attributes.length > 0 ? entity.attributes.join(', ') : null}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Relationships:
            </Typography>
            <List dense>
              {sceneGraph.relationships.map((rel, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`${rel.subject} ${rel.name} ${rel.object}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderProbabilisticResults = () => {
    if (!pcData) return null;

    return (
      <Grid container spacing={3}>
        {/* Attributes Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Predicted Attributes
              </Typography>
              {Object.entries(pcData.attr_probs).map(([object, probs]) => (
                <Box key={object} mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    {object}:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {probs.map(([attr, prob], idx) => (
                      <Chip
                        key={idx}
                        label={`${attr} (${(prob * 100).toFixed(1)}%)`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Relationships Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Predicted Relationships
              </Typography>
              {Object.entries(pcData.relation_probs).map(([objects, probs]) => (
                <Box key={objects} mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    {objects.replace('_', ' → ')}:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {probs.map(([rel, prob], idx) => (
                      <Chip
                        key={idx}
                        label={`${rel} (${(prob * 100).toFixed(1)}%)`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Co-occurrence Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Predicted Co-occurrences
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {pcData.co_occur_probs.map(([obj, prob], idx) => (
                  <Chip
                    key={idx}
                    label={`${obj} (${(prob * 100).toFixed(1)}%)`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {renderSceneGraph()}
      {renderProbabilisticResults()}
      {!sceneGraph && !pcData && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            Enter a prompt to generate scene graph and predictions
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GraphViewer;
