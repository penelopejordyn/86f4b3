import { GraphData, FormField, GraphNode } from '../types/types';

export const extractFieldFromScope = (scope: string): string | null => {
    const parts = scope.split('/');
    return parts[parts.length - 1] || null;
  };
  
  export const getFormFields = (formId: string, graphData: GraphData): Array<FormField> => {
    const form = graphData.forms.find(f => f.id === formId);
    if (!form) return [];
    
    const properties = form.field_schema?.properties || {};
    const elements = form.ui_schema?.elements || [];
    
    return elements
      .map(element => {
        const fieldId = extractFieldFromScope(element.scope);
        if (!fieldId) return null;
        
        const fieldSchema = properties[fieldId];
        if (!fieldSchema) return null;
        
        return {
          id: fieldId,
          label: element.label || fieldSchema.title || fieldId,
          type: fieldSchema.avantos_type || 'unknown',
          required: (form.field_schema?.required || []).includes(fieldId)
        };
      })
      .filter(Boolean) as FormField[];
  };
  
  export const getFormName = (nodeId: string, nodes: GraphNode[]): string => {
    const node = nodes.find(n => n.id === nodeId);
    return typeof node?.data?.label === 'string' ? node.data.label : 
           typeof node?.data?.name === 'string' ? node.data.name : 
           "Unknown Form";
  };
