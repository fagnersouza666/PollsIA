import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/PollsIA/)
    
    // Check for main heading
    await expect(page.getByRole('heading', { name: /Gestão Inteligente de/ })).toBeVisible()
    
    // Check for CTA buttons
    await expect(page.getByRole('link', { name: /Começar Agora/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Saiba Mais/ })).toBeVisible()
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/')
    
    // Click on "Saiba Mais" button
    await page.getByRole('link', { name: /Saiba Mais/ }).click()
    
    // Check that we're on the about page
    await expect(page).toHaveURL('/about')
    await expect(page.getByRole('heading', { name: /Sobre a PollsIA/ })).toBeVisible()
  })

  test('should navigate to dashboard when clicking "Começar Agora"', async ({ page }) => {
    await page.goto('/')
    
    // Click on "Começar Agora" button
    await page.getByRole('link', { name: /Começar Agora/ }).click()
    
    // Check that we're on the dashboard page
    await expect(page).toHaveURL('/dashboard')
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: /Gestão Inteligente de/ })).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByRole('heading', { name: /Gestão Inteligente de/ })).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByRole('heading', { name: /Gestão Inteligente de/ })).toBeVisible()
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /Sistema automatizado de gestão/)
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toBeAttached()
  })

  test('should load images properly', async ({ page }) => {
    await page.goto('/')
    
    // Wait for images to load
    await page.waitForLoadState('networkidle')
    
    // Check that there are no broken images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check if navigation links are present
    const navigation = page.locator('nav')
    await expect(navigation).toBeVisible()
    
    // Test navigation to different sections
    if (await page.getByRole('link', { name: /Recursos/ }).isVisible()) {
      await page.getByRole('link', { name: /Recursos/ }).click()
      // Add assertions for features page when it exists
    }
  })
})