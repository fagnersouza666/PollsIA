beforeEach(() => {
  jest.resetModules();
});

test('config loads defaults', () => {
  delete process.env.PORT;
  const { config } = require('../src/config/env');
  expect(config.PORT).toBe(3001);
});

test('config uses environment variables', () => {
  process.env.PORT = '5000';
  const { config } = require('../src/config/env');
  expect(config.PORT).toBe(5000);
});
