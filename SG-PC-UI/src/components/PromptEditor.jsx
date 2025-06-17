import React from 'react';
import { usePrompt } from '../contexts/PromptContext';
import { 
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box
} from '@mui/material';

const PromptEditor = () => {
  const { prompt, setPrompt, processPrompt, loading, error } = usePrompt();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      processPrompt(prompt);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        What image would you like to create?
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
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !prompt.trim()}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Processing...' : 'Generate'}
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default PromptEditor;
