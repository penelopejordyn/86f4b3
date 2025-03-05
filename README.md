

Getting Started

Installation:

1. Clone this repository

2. cd 86F4B3

Install dependencies:
npm install

Start the mock server:
1. set url in .env.local (NEXT_PUBLIC_MOCK_SERVER_URL= <enter mock server url>
2. npm run


Start the development server:
npm run dev

Open your browser and navigate to http://localhost:3000

The application loads form data from the API
Users select a form node in the graph
The app uses DFS to find direct and transitive dependencies
The prefill panel displays fields from the selected form
Users can configure which upstream form fields prefill which fields
Mappings are stored per form

Extensibility
Adding New Data Sources
The application uses a data source registry pattern that makes it easy to add new types of data sources:

Define a new data source in dataSourceRegistry.ts:

typescriptCopydataSourceRegistry.registerSource({
  id: 'your-data-source',
  name: 'Your Data Source',
  type: 'custom',
  getFields: (context) => {
    // Return array of fields from your data source
    return [
      { id: 'field1', label: 'Field 1', type: 'text', required: false },
      // ...
    ];
  }
});

The new data source will automatically appear in the prefill UI with its fields.

Customizing Field Rendering
To add support for new field types:

Update the FormField interface in types.ts
