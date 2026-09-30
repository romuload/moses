import { test, expect } from '@playwright/test';
test('video follows chapter selection forward and backward', async ({ page }) => {
 const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
 await page.setViewportSize({ width:1440, height:900 });
 await page.goto('/');
 await expect.poll(()=>page.locator('video').evaluate((v: HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(2);
 await page.getByRole('button',{name:'Entre na história'}).click();
 const last = page.getByRole('button',{name:'Capítulo 5: A travessia começa',exact:true});
 await expect(last).toBeVisible(); await last.click();
 await expect.poll(()=>page.locator('video').evaluate((v: HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(8);
 await expect(page.locator('.narrative.active')).toContainText('A travessia começa');
 await page.getByRole('button',{name:'Capítulo 2: Um gesto de fé',exact:true}).click();
 await expect.poll(()=>page.locator('video').evaluate((v: HTMLVideoElement)=>v.currentTime)).toBeLessThan(2.3);
 await expect(page.locator('.narrative.active')).toContainText('Um gesto de fé');
 await page.getByRole('link',{name:'Ir ao desfecho'}).click();
 await expect(page.getByRole('button',{name:'Reviver a história'})).toBeInViewport();
 await page.getByRole('button',{name:'Reviver a história'}).click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(5);
 expect(errors).toEqual([]);
});
test('mobile has no horizontal overflow and menu works',async({page})=>{
 await page.setViewportSize({width:390,height:844}); await page.goto('/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Capítulos',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('navigation',{name:'Capítulos',exact:true})).toHaveCount(0);
});
test('reduced motion gives five static chapters without pinned video',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/');
 await expect(page.locator('video')).toHaveCount(0);
 await expect(page.locator('.static-chapters article')).toHaveCount(5);
 await expect(page.locator('.pin-spacer')).toHaveCount(0);
 await page.getByRole('button',{name:'Entre na história'}).click();
 await expect(page.locator('#static-0')).toBeInViewport();
});
test('unavailable video falls back to illustrated chapters',async({page})=>{
 await page.route('**/videos/*.mp4', route=>route.abort()); await page.goto('/');
 await expect(page.locator('.static-chapters article')).toHaveCount(5);
 await expect(page.locator('.pin-spacer')).toHaveCount(0);
});
