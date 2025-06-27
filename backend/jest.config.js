module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  maxWorkers: 1,
  forceExit: true,
  testTimeout: 15000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
