import { dataSourceRegistry } from '../scripts/dataSourceRegistry';

test('dataSourceRegistry methods exist', () => {
  expect(typeof dataSourceRegistry.registerSource).toBe('function');
  expect(typeof dataSourceRegistry.getSource).toBe('function');
});
