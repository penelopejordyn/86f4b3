import { Edge, GraphNode } from "../types/types";

export interface DFSResult {
    allDependencies: GraphNode[];
    directDependencies: GraphNode[];
    transitiveDependencies: GraphNode[];
  }
  
  interface ReverseAdjList {
    [key: string]: string[];
  }
  
  export const upstreamDFS = (nodeId: string, edges: Edge[], nodes: GraphNode[]): DFSResult => {
    try {
      // Create reverse adjacency list
      const reverseAdjList: ReverseAdjList = {};
      

      nodes.forEach(node => {
        reverseAdjList[node.id] = [];
      });
      
 
      edges.forEach(edge => {
        if (reverseAdjList[edge.target]) {
          reverseAdjList[edge.target].push(edge.source);
        }
      });
      
      const visited = new Set<string>();
      const directDependencies = [...(reverseAdjList[nodeId] || [])];
      const allDependencies: string[] = [];
      
      function dfs(currentNodeId: string, depth = 0) {
        // Mark node as visited
        visited.add(currentNodeId);
    
        if (currentNodeId !== nodeId) {
          allDependencies.push(currentNodeId);
        }
        

        const neighbors = reverseAdjList[currentNodeId] || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            dfs(neighbor, depth + 1);
          }
        }
      }
      
      // Start DFS from the selected node
      dfs(nodeId);
      

      return {
        directDependencies: directDependencies
          .map(id => nodes.find(node => node.id === id))
          .filter(Boolean) as GraphNode[],
        allDependencies: allDependencies
          .map(id => nodes.find(node => node.id === id))
          .filter(Boolean) as GraphNode[],
        transitiveDependencies: allDependencies
          .filter(id => !directDependencies.includes(id))
          .map(id => nodes.find(node => node.id === id))
          .filter(Boolean) as GraphNode[]
      };
    } catch (error) {
      console.error("Error in DFS algorithm:", error);
      return {
        directDependencies: [],
        allDependencies: [],
        transitiveDependencies: []
      };
    }
  };
  
  