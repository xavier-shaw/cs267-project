import React from 'react';
import { usePrompt } from '../contexts/PromptContext';

const GraphViewer = () => {
  const { sceneGraph, pcEvidence } = usePrompt();

  const renderSceneGraph = () => {
    if (!sceneGraph) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Scene Graph</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Entities:</h4>
          <ul className="list-disc pl-5 mb-4">
            {Object.values(sceneGraph.entities).map((entity) => (
              <li key={entity.id}>
                {entity.name} ({entity.category})
                {entity.attributes.length > 0 && ` - ${entity.attributes.join(', ')}`}
              </li>
            ))}
          </ul>
          <h4 className="font-medium mb-2">Relationships:</h4>
          <ul className="list-disc pl-5">
            {sceneGraph.relationships.map((rel, idx) => (
              <li key={idx}>
                {rel.subject} {rel.name} {rel.object}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderEvidence = () => {
    if (!pcEvidence) return null;

    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">PC Evidence</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <ul className="list-disc pl-5">
            {pcEvidence.map((evidence, idx) => (
              <li key={idx}>{evidence}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {renderSceneGraph()}
      {renderEvidence()}
      {!sceneGraph && !pcEvidence && (
        <div className="text-gray-500 text-center py-8">
          Enter a prompt to generate scene graph and evidence
        </div>
      )}
    </div>
  );
};

export default GraphViewer;
