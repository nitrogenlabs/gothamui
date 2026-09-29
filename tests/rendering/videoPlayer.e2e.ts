import {expect, test} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const fixture = new URL('./fixtures/player.mp4', import.meta.url);
test.beforeEach(async ({page}) => {
  const body = await readFile(fixture);
  await page.route('**/player.mp4', (route) => {
    const range = route.request().headers().range?.match(/bytes=(\d+)-(\d*)/);
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
    return route.fulfill({body: body.subarray(start, end + 1), contentType: 'video/mp4', headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1),
      ...(range ? {'Content-Range': `bytes ${start}-${end}/${body.length}`} : {})
    }, status: range ? 206 : 200});
  });
  await page.route('**/broken.mp4', (route) => route.fulfill({status: 404}));
});

test('native player plays, seeks, mutes and recovers from source errors without decoding the timeline', async ({page}) => {
  const decoderRequests: string[] = [];
  let passiveRequests = 0;
  page.on('request', (request) => {
    if(/mediabunny|\/media\/canvasPreview\./.test(request.url())) decoderRequests.push(request.url());
    if(request.url().endsWith('/passive.mp4')) passiveRequests++;
  });
  await page.goto('/?player');
  const media = page.getByLabel('Demo', {exact: true});
  await page.getByRole('button', {name: 'Play Demo', exact: true}).click();
  await expect.poll(() => media.evaluate((node) => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(0.1);
  await page.getByRole('slider', {name: 'Seek Demo'}).fill('1');
  await expect(page.getByRole('button', {name: 'Play Demo', exact: true})).toBeVisible();
  await expect.poll(() => media.evaluate((node) => (node as HTMLVideoElement).currentTime)).toBeCloseTo(1, 1);
  await page.getByRole('button', {name: 'Unmute Demo', exact: true}).click();
  await expect.poll(() => media.evaluate((node) => (node as HTMLVideoElement).muted)).toBe(false);
  await page.getByRole('button', {name: 'Broken source'}).click();
  await expect(page.getByRole('status')).toHaveText('This video could not load.');
  await page.getByRole('button', {name: 'Restore source'}).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('button', {name: 'Play Demo', exact: true}).click();
  await expect.poll(() => media.evaluate((node) => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(0.1);
  expect(decoderRequests).toEqual([]);
  expect(passiveRequests).toBe(0);
});

test('timeline composes trimmed clips with a transition and audio, supports scene navigation and looping', async ({page}) => {
  await page.goto('/?player&timeline');
  const canvas = page.getByRole('img', {name: 'Timeline preview'});
  await expect(canvas).toHaveAttribute('data-preview-ready', 'true');
  await page.getByRole('button', {name: 'Play Timeline', exact: true}).click();
  const slider = page.getByRole('slider', {name: 'Seek Timeline'});
  await expect.poll(() => slider.inputValue().then(Number)).toBeGreaterThan(0.1);
  await slider.fill('2.2');
  await expect(canvas).toHaveAttribute('data-preview-buffering', 'false');
  await expect(slider).toHaveValue('2.2');
  expect(await canvas.evaluate((node) => {
    const element = node as HTMLCanvasElement;
    return element.getContext('2d')!.getImageData(element.width / 2, element.height / 2, 1, 1).data.some((value, index) => index < 3 && value > 0);
  })).toBe(true);
  await page.getByRole('button', {name: 'Previous scene'}).click();
  await expect(slider).toHaveValue('0');
  await page.getByRole('button', {name: 'Next scene'}).click();
  await expect(slider).toHaveValue('2');
  await page.getByRole('combobox', {name: 'Preview frame ratio'}).selectOption('1');
  expect(await canvas.evaluate((node) => (node as HTMLCanvasElement).width === (node as HTMLCanvasElement).height)).toBe(true);
  await page.getByRole('button', {name: 'Loop', exact: true}).click();
  await slider.fill('3.8');
  await page.getByRole('button', {name: 'Play Timeline', exact: true}).click();
  await expect.poll(() => slider.inputValue().then(Number)).toBeLessThan(1.5);
  await page.getByRole('button', {name: 'Pause Timeline', exact: true}).click();
  await expect(canvas).toHaveAttribute('data-preview-paused', 'true');
});
