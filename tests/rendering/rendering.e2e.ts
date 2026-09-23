import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  page.on('pageerror', (error) => { throw error; });
});

test('pastes a clipboard image with the explicit button', async ({context, page}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!), 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
  });
  await page.getByRole('button', {name: 'Paste image'}).click();
  await expect(page.getByRole('img', {name: 'clipboard-image-1.png'})).toBeVisible();
  await page.getByRole('button', {name: 'Remove clipboard-image-1.png'}).click();
  await expect(page.getByRole('img', {name: 'clipboard-image-1.png'})).toHaveCount(0);
});

test('edits and submits independent form fields without losing focus or values', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('team@gothamui.dev');
  await expect(page.getByLabel('Email')).toBeFocused();
  await page.getByLabel('Password', {exact: true}).fill('secret');
  await page.getByRole('button', {name: 'Show password'}).click();
  await expect(page.getByLabel('Password', {exact: true})).toHaveAttribute('type', 'text');
  await page.getByRole('checkbox', {name: 'Accept terms'}).check();
  await page.getByRole('button', {name: 'Reader'}).click();
  await page.getByRole('option', {name: 'Writer'}).click();
  await page.getByRole('button', {name: 'Save'}).click();
  await expect(page.getByLabel('Submission')).toContainText('"email":"team@gothamui.dev"');
  await expect(page.getByLabel('Submission')).toContainText('"accepted":true');
  await expect(page.getByLabel('Submission')).toContainText('"role":"writer"');
  await expect(page.getByRole('heading', {name: 'Preview'})).toBeVisible();
});

test('uses the native select at mobile widths', async ({page}) => {
  await page.setViewportSize({height: 800, width: 375});
  await page.goto('/');
  await page.locator('select[name="role"]').selectOption('writer');
  await page.getByRole('button', {name: 'Save'}).click();
  await expect(page.getByLabel('Submission')).toContainText('"role":"writer"');
});
