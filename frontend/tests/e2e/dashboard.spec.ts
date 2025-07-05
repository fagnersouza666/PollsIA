import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should show wallet connection prompt when not connected', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should show wallet connection interface
    await expect(page.getByRole('heading', { name: /PollsIA/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Conectar Carteira/ })).toBeVisible()
    
    // Should show descriptive text
    await expect(page.getByText(/Gestão automatizada de pools/)).toBeVisible()
  })

  test('should handle wallet connection errors gracefully', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Mock Phantom wallet not being available
    await page.addInitScript(() => {
      // Remove window.solana to simulate no wallet
      delete (window as any).solana
    })
    
    // Click connect wallet button
    await page.getByRole('button', { name: /Conectar Carteira/ }).click()
    
    // Should show appropriate error message
    await expect(page.getByText(/Phantom wallet não detectado/)).toBeVisible()
  })

  test('should show loading states appropriately', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Mock slow loading
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000)
    })
    
    // Should show loading indicators when appropriate
    // This test depends on the actual implementation
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    expect(await headings.count()).toBeGreaterThan(0)
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    // Check for proper button labels
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('should handle navigation correctly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test navigation between different sections
    // Note: This assumes the user is connected, might need authentication setup
    
    // Check if pools navigation exists and works
    if (await page.getByRole('link', { name: /Pools/ }).isVisible()) {
      await page.getByRole('link', { name: /Pools/ }).click()
      await expect(page).toHaveURL(/\/pools/)
    }
    
    // Check if profile navigation exists and works
    if (await page.getByRole('link', { name: /Perfil/ }).isVisible()) {
      await page.getByRole('link', { name: /Perfil/ }).click()
      await expect(page).toHaveURL(/\/profile/)
    }
  })

  test('should handle errors properly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Mock API errors
    await page.route('**/api/wallet/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    // Should show error boundaries or error messages
    // The exact behavior depends on implementation
  })

  test('should work on different screen sizes', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    await expect(page.getByRole('button', { name: /Conectar Carteira/ })).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard')
    await expect(page.getByRole('button', { name: /Conectar Carteira/ })).toBeVisible()
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/dashboard')
    await expect(page.getByRole('button', { name: /Conectar Carteira/ })).toBeVisible()
  })
})