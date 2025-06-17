import React, { useState } from 'react';
import { usePrompt } from '../contexts/PromptContext';
import { 
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider
} from '@mui/material';

const PromptEditor = () => {
  const { prompt, setPrompt, processPrompt, loading, error, pcData } = usePrompt();
  const [selectedChips, setSelectedChips] = useState({
    attributes: new Set(),
    relations: new Set(),
    coOccurrences: new Set()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      processPrompt(prompt);
    }
  };

  const handleChipClick = (section, key) => {
    setSelectedChips(prev => {
      const newSelected = { ...prev };
      const set = new Set(prev[section]);
      
      if (set.has(key)) {
        set.delete(key);
      } else {
        set.add(key);
      }
      
      newSelected[section] = set;
      return newSelected;
    });
  };

  const renderModelSuggestions = () => {
    if (!pcData) return null;

    return (
      <Box sx={{ flex: 1, overflow: 'auto', pr: 2 }}>
        <Typography variant="h5" gutterBottom fontWeight="500">
          Model Suggestions
        </Typography>
        <Card sx={{ 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Attributes Section */}
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Attributes
            </Typography>
            {Object.entries(pcData.attr_probs).map(([object, probs]) => (
              <Box key={object} mb={3}>
                <Typography variant="subtitle1" fontWeight="500" color="text.secondary" mb={1}>
                  {object}:
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {probs.map(([attr, prob], idx) => {
                    const chipKey = `${object}_${attr}`;
                    return (
                      <Chip
                        key={idx}
                        label={`${attr} (${(prob * 100).toFixed(1)}%)`}
                        size="medium"
                        sx={{ 
                          mb: 1.5,
                          fontSize: '0.95rem',
                          height: 34,
                          '&:hover': {
                            backgroundColor: selectedChips.attributes.has(chipKey) ? 'primary.main' : 'action.hover'
                          }
                        }}
                        onClick={() => handleChipClick('attributes', chipKey)}
                        color={selectedChips.attributes.has(chipKey) ? 'primary' : 'default'}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            {/* Relations Section */}
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Relations
            </Typography>
            {Object.entries(pcData.relation_probs).map(([objects, probs]) => (
              <Box key={objects} mb={3}>
                <Typography variant="subtitle1" fontWeight="500" color="text.secondary" mb={1}>
                  {objects.replace('_', ' → ')}:
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {probs.map(([rel, prob], idx) => {
                    const chipKey = `${objects}_${rel}`;
                    return (
                      <Chip
                        key={idx}
                        label={`${rel} (${(prob * 100).toFixed(1)}%)`}
                        size="medium"
                        sx={{ 
                          mb: 1.5,
                          fontSize: '0.95rem',
                          height: 34,
                          '&:hover': {
                            backgroundColor: selectedChips.relations.has(chipKey) ? 'primary.main' : 'action.hover'
                          }
                        }}
                        onClick={() => handleChipClick('relations', chipKey)}
                        color={selectedChips.relations.has(chipKey) ? 'primary' : 'default'}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            {/* Co-occurrences Section */}
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Co-occurrences
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {pcData.co_occur_probs.map(([obj, prob], idx) => {
                const chipKey = `${obj}`;
                return (
                  <Chip
                    key={idx}
                    label={`${obj} (${(prob * 100).toFixed(1)}%)`}
                    size="medium"
                    sx={{ 
                      mb: 1.5,
                      fontSize: '0.95rem',
                      height: 34,
                      '&:hover': {
                        backgroundColor: selectedChips.coOccurrences.has(chipKey) ? 'primary.main' : 'action.hover'
                      }
                    }}
                    onClick={() => handleChipClick('coOccurrences', chipKey)}
                    color={selectedChips.coOccurrences.has(chipKey) ? 'primary' : 'default'}
                  />
                );
              })}
            </Stack>
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
        p: 2
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          Prompt
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            disabled={loading}
            sx={{ 
              mb: 2,
              '& .MuiInputBase-root': {
                fontSize: '1.1rem',
                lineHeight: 1.6,
                p: 2
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !prompt.trim()}
            size="large"
            sx={{ 
              minWidth: 140,
              height: 48,
              fontSize: '1rem'
            }}
          >
            {loading ? 'Processing...' : 'Generate'}
          </Button>
        </Box>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              fontSize: '1rem'
            }}
          >
            {error}
          </Alert>
        )}
      </Box>
      {renderModelSuggestions()}
    </Box>
  );
};

export default PromptEditor;
