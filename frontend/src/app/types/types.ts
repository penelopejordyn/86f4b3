import { XYPosition } from '@xyflow/react';

export interface GraphNode {
    id: string;
    position: XYPosition;
    data: Record<string, unknown>;
}
  
  export interface FormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
  }
  
  export interface Edge {
    id: string;
    source: string;
    target: string;
  }
  
  export interface FormDefinition {
    id: string;
    name: string;
    field_schema: {
      properties: Record<string, any>;
      required?: string[];
    };
    ui_schema: {
      elements: Array<{
        type: string;
        scope: string;
        label: string;
      }>;
    };
  }
  
  export interface PrefillSource {
    type: 'form' | 'global';
    form: string;
    field: string;
    label: string;
  }
  
  export interface PrefillMapping {
    isPrefilled: boolean;
    value: string;
    source: PrefillSource | null;
  }
  
  export interface PrefillStateMap {
    [nodeId: string]: {
      [fieldId: string]: PrefillMapping;
    };
  }
  
  export interface GraphData {
    forms: FormDefinition[];
    nodes: GraphNode[];
    edges: Edge[];
  }

  export interface DataSource {
    id: string;
    name: string;
    type: 'form' | 'global' | 'custom';
    getFields: (context: any) => Promise<FormField[]> | FormField[];
  }

  export interface DFSResult {
    allDependencies: GraphNode[];
    directDependencies: GraphNode[];
    transitiveDependencies: GraphNode[];
  }
  
  export interface ReverseAdjList {
    [key: string]: string[];
  }
