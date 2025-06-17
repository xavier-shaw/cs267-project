import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const PromptContext = createContext();

export const PromptProvider = ({ children }) => {
  const [prompt, setPrompt] = useState('');
  const [sceneGraph, setSceneGraph] = useState(null);
  const [pcData, setPcData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPrompt = async (text) => {
    setLoading(true);
    setError(null);
    try {
      // Call scene graph parser API
      const sgResponse = await axios.post(`${window.BACKEND_SG_URL}/parse-prompt`, { text });
      const sgData = sgResponse.data;
      console.log("scene graph: ", sgData);
      setSceneGraph(sgData);

      // Call PC API with scene graph
      const pcResponse = await axios.post(`${window.BACKEND_PC_URL}/parse-scene-graph`, sgData);
      const pcData = pcResponse.data;
      console.log("parse result: ", pcData);
      setPcData(pcData);
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
    pcData,
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
