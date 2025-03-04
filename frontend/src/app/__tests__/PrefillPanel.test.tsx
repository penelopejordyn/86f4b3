import { render, screen } from '@testing-library/react';
import PrefillPanel from '../components/PrefillPanel';
import '@testing-library/jest-dom';
import { GraphNode, GraphData } from '../types/types';

const mockSelectedNode: GraphNode = { id: '1', data: {}, position: { x: 0, y: 0 } };
const mockGraphData: GraphData = { nodes: [], edges: [], forms: [] };

test('renders PrefillPanel component', () => {
  render(
    <PrefillPanel
      selectedNode={mockSelectedNode}
      graphData={mockGraphData}
      directDependencies={[]}
      transitiveDependencies={[]}
    />
  );
  expect(screen.getByText(/prefill/i)).toBeInTheDocument();
});
