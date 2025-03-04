import { FormField } from '../types/types';
//
export interface DataSource {
    id: string;
    name: string;
    type: 'form' | 'global' | 'custom';
    getFields: (context: any) => Promise<FormField[]> | FormField[];
  }
  
  class DataSourceRegistry {
    private sources: Map<string, DataSource> = new Map();
  
    registerSource(source: DataSource): void {
      this.sources.set(source.id, source);
    }
  
    getSource(id: string): DataSource | undefined {
      return this.sources.get(id);
    }
  
    getAllSources(): DataSource[] {
      return Array.from(this.sources.values());
    }
  
    getSourcesByType(type: string): DataSource[] {
      return Array.from(this.sources.values()).filter(source => source.type === type);
    }
  }
  
  export const dataSourceRegistry = new DataSourceRegistry();
  

  dataSourceRegistry.registerSource({
    id: 'form-dependencies',
    name: 'Form Dependencies',
    type: 'form',
    getFields: (context) => {

      return [];
    }
  });
  
  dataSourceRegistry.registerSource({
    id: 'global-values',
    name: 'Global Values',
    type: 'global',
    getFields: () => {
      return [
        { id: 'client.name', label: 'Client Name', type: 'text', required: false },
        { id: 'client.organization', label: 'Client Organization', type: 'text', required: false }
      ];
    }
  });