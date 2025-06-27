// Jest setup file para cleanup de recursos
beforeEach(() => {
  // Limpar timers ativos
  jest.clearAllTimers();
});

afterEach(() => {
  // Forçar garbage collection se disponível
  if (global.gc) {
    global.gc();
  }
});

afterAll(() => {
  // Cleanup geral
  jest.clearAllMocks();
  jest.clearAllTimers();
});