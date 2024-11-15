import { test, expect } from '@playwright/test';

test('Commandbar menu keyboard up and down arrow key functionality', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Simulate pressing the "/" key
  await page.locator('body').click();
  await page.keyboard.press('/');

  // Navigate through the command bar menu using the down arrow key
  for (let i = 0; i < 2; i++) {
    await page.getByPlaceholder('Search pages... (Press \'/\' to focus)').press('ArrowDown');
  }

  // Navigate back up the menu using the up arrow key
  await page.getByPlaceholder('Search pages... (Press \'/\' to focus)').press('ArrowUp');

  // Assert that the current option in the menu is not the first option
  const currentOption = await page.getByRole('option', { selected: true }).textContent();
  expect(currentOption).not.toBe('Scheduler');
});

test('Esc command focus activation Test', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Simulate pressing the "/" key
  await page.locator('body').click();
  await page.keyboard.press('/');

  // Check if the search input is focused
  const searchInput = page.getByPlaceholder('Search pages... (Press \'/\' to focus)');
  await expect(searchInput).toBeFocused();

  // Esc command functionality check
  await page.getByPlaceholder('Search pages... (Press \'/\' to').press('Escape');
});

test('Slash command focus activation Test', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Simulate pressing the "/" key
  await page.locator('body').click();
  await page.keyboard.press('/');

  // Check if the search input is focused
  const searchInput = page.getByPlaceholder('Search pages... (Press \'/\' to focus)');
  await expect(searchInput).toBeFocused();
});

test('Manual click focus activation Test', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Simulate pressing the "/" key
  await page.locator('body').click();
  
  // Esc command functionality check
  await page.getByPlaceholder('Search pages... (Press \'/\' to').press('Escape');
});


// Experimental tests

// <Add and test experimental tests here>