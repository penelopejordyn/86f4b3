"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PrefillPanel from './components/PrefillPanel';
import { upstreamDFS } from './scripts/dfs';
import { PrefillStateMap } from './types/types';

interface ApiError {
  message: string;
  status?: number;
}

const Page: React.FC = () => {

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [directDependencies, setDirectDependencies] = useState<Node[]>([]);
  const [transitiveDependencies, setTransitiveDependencies] = useState<Node[]>([]);
  const [graphData, setGraphData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    fetch(process.env.NEXT_PUBLIC_MOCK_SERVER_URL || 'http://localhost:3005/api/v1/123/actions/blueprints/bp_456/graph')
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {

        const processedNodes = data.nodes.map((node: any) => ({
          id: node.id,
          type: 'default',
          position: { x: node.position.x, y: node.position.y },
          data: {
            label: node.data.name,
            formId: node.data.component_id
          },
          style: {
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '5px',
            padding: '10px',
            width: 150
          }
        }));

        const processedEdges = data.edges.map((edge: any) => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#aaa' }
        }));
        
        setNodes(processedNodes);
        setEdges(processedEdges);
        setGraphData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch graph data:", err);
        setError({
          message: "Failed to load graph data. Please try again later.",
          status: err.status
        });
        setIsLoading(false);
      });
  }, []);
  

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    

    const { directDependencies, transitiveDependencies } = upstreamDFS(
      node.id,
      edges,
      nodes
    );
    
//node styling
    const resetNodes = nodes.map(n => ({
      ...n,
      style: {
        ...n.style,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd'
      }
    }));
    
    

    const updatedNodes = resetNodes.map(n => {
      if (n.id === node.id) {
        return {
          ...n,
          style: {
            ...n.style,
            backgroundColor: '#e1f5fe',
            borderWidth: 2,
            borderColor: '#1976d2'
          }
        };
      }
      

      if (directDependencies.some(dep => dep.id === n.id)) {
        return {
          ...n,
          style: {
            ...n.style,
            backgroundColor: '#e8f5e9',
          }
        };
      }

      if (transitiveDependencies.some(dep => dep.id === n.id)) {
        return {
          ...n,
          style: {
            ...n.style,
            backgroundColor: '#f9fbe7',
          }
        };
      }
      
      return n;
    });
    

      
    
    setNodes(updatedNodes);
    setDirectDependencies(directDependencies);
    setTransitiveDependencies(transitiveDependencies);
  }, [nodes, edges]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Loading graph data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
            <div className="bg-red-100 text-red-700 p-4 rounded-md shadow-md max-w-md">
              <h3 className="font-bold mb-2">Error</h3>
              <p>{error.message}</p>
              <button 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      {selectedNode && graphData && (
        <PrefillPanel
          selectedNode={selectedNode}
          graphData={graphData}
          directDependencies={directDependencies}
          transitiveDependencies={transitiveDependencies}
        />
      )}
    </div>
  );
};

export default Page;