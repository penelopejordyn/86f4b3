
import React, { useEffect, useState } from 'react';
import { getFormFields,getFormName,} from '../scripts/utils';
import {GraphNode, FormField, PrefillStateMap, GraphData,} from '../types/types';
import {dataSourceRegistry} from '../scripts/dataSourceRegistry';

interface PrefillPanelProps {
  selectedNode: GraphNode;
  graphData: GraphData;
  directDependencies: GraphNode[];
  transitiveDependencies: GraphNode[];
}

const PrefillPanel: React.FC<PrefillPanelProps> = ({
  selectedNode,
  graphData,
  directDependencies,
  transitiveDependencies,
}) => {

  const [allPrefillStates, setAllPrefillStates] = useState<PrefillStateMap>({});
  const [inputValues, setInputValues] = useState<{ [fieldId: string]: string }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const [error, setError] = useState<string | null>(null);
  

  const componentId = ((selectedNode.data as { formId?: string; component_id?: string })?.formId ?? '') 
                 || ((selectedNode.data as { formId?: string; component_id?: string })?.component_id ?? '');
  const formDefinition = graphData.forms ? graphData.forms.find(form => form.id === componentId) : undefined;
  

  useEffect(() => {
    setInputValues({});
    setOpenDropdowns({});
    setError(null);
  }, [selectedNode.id]);
  
  
  if (!formDefinition || !formDefinition.ui_schema) {
    return (
      <div className="p-4 text-red-600">
        Error: No form definition found for this node.
      </div>
    );
  }
  

  const currentNodePrefills = allPrefillStates[selectedNode.id] || {};
  

  const categorizedOptions: { [formName: string]: { formId: string; fields: FormField[] } } = {};

  directDependencies.forEach(dep => {
    const formName = getFormName(dep.id, graphData.nodes);
const depFormId = ((graphData.nodes.find(n => n.id === dep.id)?.data as { formId?: string; component_id?: string })?.formId ?? '') ||
                 ((graphData.nodes.find(n => n.id === dep.id)?.data as { formId?: string; component_id?: string })?.component_id ?? '');
    
    if (depFormId) {
      const fields: FormField[] = getFormFields(depFormId, graphData);
      categorizedOptions[formName] = {
        formId: depFormId,
        fields
      };
    }
  });
  

  transitiveDependencies.forEach(dep => {
    const formName = getFormName(dep.id, graphData.nodes);
const depFormId = ((graphData.nodes.find(n => n.id === dep.id)?.data as { formId?: string; component_id?: string })?.formId ?? '') ||
                 ((graphData.nodes.find(n => n.id === dep.id)?.data as { formId?: string; component_id?: string })?.component_id ?? '');
    
    if (depFormId) {
      const fields: FormField[] = getFormFields(depFormId, graphData) as FormField[];
      categorizedOptions[formName] = {
        formId: depFormId,
        fields
      };
    }
  });
  

const globalFields: FormField[] = dataSourceRegistry.getSourcesByType('global')
  .flatMap(source => {
    const fields = source.getFields({});
    return fields instanceof Promise ? [] : fields;
  }) as FormField[];
  
  if (globalFields.length > 0) {
    categorizedOptions["Global Values"] = {
      formId: "global",
      fields: globalFields
    };
  }
  

  const toggleDropdown = (fieldId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };
  

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
 
  const handleInputChange = (fieldId: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  

  const setPrefillField = (fieldId: string, sourceForm: string, sourceField: string, sourceLabel: string) => {
    setAllPrefillStates(prev => ({
      ...prev,
      [selectedNode.id]: {
        ...(prev[selectedNode.id] || {}),
        [fieldId]: {
          isPrefilled: true,
          value: `${sourceForm} > ${sourceLabel}`,
          source: { 
            type: sourceForm === "Global Values" ? 'global' : 'form',
            form: sourceForm,
            field: sourceField,
            label: sourceLabel
          }
        }
      }
    }));
    
    setInputValues(prev => ({ ...prev, [fieldId]: '' }));
    setOpenDropdowns(prev => ({ ...prev, [fieldId]: false }));
  };
  

  const clearPrefill = (fieldId: string) => {
    setAllPrefillStates(prev => {
      const newState = {...prev};
      if (newState[selectedNode.id]) {
        const nodeState = {...newState[selectedNode.id]};
        delete nodeState[fieldId];
        newState[selectedNode.id] = nodeState;
      }
      return newState;
    });
    
  };
  
  return (
    <div className="prefill-panel p-4 border-l border-gray-200 w-80 overflow-y-auto h-full">
      <div className="sticky top-0 bg-white pb-2 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{(selectedNode.data as { label?: string; name?: string })?.label 
    || (selectedNode.data as { label?: string; name?: string })?.name} Prefill</h2>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
            <button className="ml-2 font-bold" onClick={() => setError(null)}>×</button>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {formDefinition.ui_schema.elements.map((element, index) => {

          const parts = element.scope.split('/');
          const fieldId = parts[parts.length - 1];
          
          if (!fieldId) return null;
          
   
          const fieldSchema = formDefinition.field_schema.properties[fieldId];
          if (!fieldSchema) return null;
          

          const fieldState = currentNodePrefills[fieldId];
          const isPrefilled = !!fieldState?.isPrefilled;
          
    
          const fieldValue = isPrefilled 
            ? fieldState.value 
            : (inputValues[fieldId] || '');
          
          const isRequired = formDefinition.field_schema.required?.includes(fieldId) || false;
          
          return (
            <div key={index} className="field-container border rounded-md p-3">
              <div className="flex justify-between mb-1">
                <label className="font-medium block">
                  {element.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <span className="text-xs text-gray-500">{fieldSchema.avantos_type}</span>
              </div>
              
              <div className="relative">
                <div className={`w-full min-h-[42px] p-2 border rounded flex items-center ${isPrefilled ? 'bg-blue-50' : ''}`}>
                  {isPrefilled ? (
                    <div className="flex items-center">
                      <div className="bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center">
                        {fieldState.value}
                        <button 
                          className="ml-2 text-blue-600 hover:text-red-500 font-bold"
                          onClick={() => clearPrefill(fieldId)}
                          aria-label="Clear prefill"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      className="w-full bg-transparent outline-none"
                      placeholder={`Set prefill for ${element.label}`}
                      value={fieldValue}
                      onChange={(e) => handleInputChange(fieldId, e.target.value)}
                      onClick={() => toggleDropdown(fieldId)}
                    />
                  )}
                </div>
                
                {!isPrefilled && openDropdowns[fieldId] && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {Object.entries(categorizedOptions).length > 0 ? (
                      Object.entries(categorizedOptions).map(([formName, { formId, fields }]) => (
                        <div key={formName} className="border-b last:border-b-0">
                          <div 
                            className="flex items-center justify-between px-4 py-2 font-medium bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleCategory(formName)}
                          >
                            <span>{formName}</span>
                            <svg 
                              className={`w-4 h-4 transition-transform ${expandedCategories[formName] ? 'transform rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          
                          {expandedCategories[formName] && (
                            <div className="bg-gray-50">
                              {fields.length > 0 ? (
                                fields.map((field) => (
                                  <div 
                                    key={field.id}
                                    className="px-6 py-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => setPrefillField(fieldId, formName, field.id, field.label)}
                                  >
                                    {field.label}
                                  </div>
                                ))
                              ) : (
                                <div className="px-6 py-2 text-gray-500">No fields available</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-gray-500">No dependency forms available for prefill</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrefillPanel
