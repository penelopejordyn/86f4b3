import * as utils from '../scripts/utils';


test('utils module exports functions', () => {
  expect(Object.keys(utils).length).toBeGreaterThan(0);
});
