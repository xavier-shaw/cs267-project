import React from 'react';
import { usePrompt } from '../contexts/PromptContext';

const PromptEditor = () => {
  const { prompt, setPrompt, processPrompt, loading, error } = usePrompt();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      processPrompt(prompt);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">What image would you like to create?</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded-md mb-4 min-h-[100px]"
          placeholder="Describe the image you want to create..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className={`px-4 py-2 rounded-md ${
            loading || !prompt.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Processing...' : 'Generate'}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
