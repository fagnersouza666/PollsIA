import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('Running global teardown...')
  
  // Clean up test data, reset database, etc.
  // This runs after all tests are completed
  
  console.log('Global teardown completed')
}

export default globalTeardown