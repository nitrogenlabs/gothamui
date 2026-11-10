import {expect, test} from '@nlabs/lex/test-playwright';

test('keeps real underline tab panels and keyboard navigation at mobile width', async ({page}) => {
  page.on('pageerror', (error) => {
    throw error;
  });
  await page.setViewportSize({height: 700, width: 320});
  await page.goto('/tabs.html');
  const image = page.getByRole('tab', {name: 'Image'});
  const video = page.getByRole('tab', {name: 'Video'});

  await expect(image).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await expect(image).toHaveCSS('border-bottom-width', '2px');
  await expect(image).toHaveCSS('cursor', 'pointer');

  await image.focus();
  await page.keyboard.press('ArrowRight');

  await expect(video).toBeFocused();
  await expect(video).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', {name: 'Video'})).toHaveText('Video settings');

  await page.keyboard.press('Home');

  await expect(image).toBeFocused();
  await expect(page.getByRole('tabpanel', {name: 'Image'})).toHaveText('Image settings');
});
