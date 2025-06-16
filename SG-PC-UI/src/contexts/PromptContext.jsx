import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const PromptContext = createContext();

export const PromptProvider = ({ children }) => {
  const [prompt, setPrompt] = useState('');
  const [sceneGraph, setSceneGraph] = useState(null);
  const [pcEvidence, setPcEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPrompt = async (text) => {
    setLoading(true);
    setError(null);
    try {
      // Call scene graph parser API
      const sgResponse = await axios.post(`${window.BACKEND_SG_URL}/parse`, { text });
      const sgData = sgResponse.data;
      console.log(sgData);
      setSceneGraph(sgData);

      // Call PC API with scene graph
      const pcResponse = await axios.post(`${window.BACKEND_PC_URL}/scene-graph`, sgData);
      console.log(pcResponse);
      const pcData = pcResponse.data;
      setPcEvidence(pcData.evidences);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    prompt,
    setPrompt,
    sceneGraph,
    pcEvidence,
    loading,
    error,
    processPrompt,
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};
