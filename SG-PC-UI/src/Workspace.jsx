import React from 'react';
import { PromptProvider } from './contexts/PromptContext';
import PromptEditor from './components/PromptEditor';
import GraphViewer from './components/GraphViewer';

const Workspace = () => {
  return (
    <PromptProvider>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <PromptEditor />
            </div>
            <div>
              <GraphViewer />
            </div>
          </div>
        </div>
      </div>
    </PromptProvider>
  );
};

export default Workspace;
