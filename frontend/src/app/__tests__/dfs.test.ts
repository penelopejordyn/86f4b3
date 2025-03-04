import * as dfs from '../scripts/dfs';

test('dfs module exports functions', () => {
  expect(Object.keys(dfs).length).toBeGreaterThan(0);
});
