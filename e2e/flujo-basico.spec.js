import { test, expect } from '@playwright/test';

const stamp = Date.now();
const user = {
  name: 'E2E Operador',
  email: `e2e_${stamp}@mvp.local`,
  password: 'Clave1234'
};
const productName = `Mouse E2E ${stamp}`;

test.describe.serial('Flujo funcional MVP', () => {
  test('ruta protegida redirige a login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('registro crea sesión y llega al listado', async ({ page }) => {
    await page.goto('/registro');
    await page.locator('#name').fill(user.name);
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.getByRole('button', { name: 'Registrarme' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Publicaciones' })).toBeVisible();
    await expect(page.getByText(user.name, { exact: false })).toBeVisible();
  });

  test('crear solicitud y ver detalle', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');

    await page.getByRole('link', { name: 'Nueva solicitud' }).click();
    await expect(page).toHaveURL('/nueva');
    await page.locator('#name').fill(productName);
    await page.locator('#brand').fill('TechnStore');
    await page.locator('#upc').fill('123456789012');
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();

    await expect(page).toHaveURL(/\/solicitudes\/[a-f0-9-]+/);
    await expect(page.getByRole('heading', { name: productName })).toBeVisible();
    await expect(page.getByText('captura', { exact: false }).first()).toBeVisible();
  });

  test('listado muestra la solicitud creada', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: productName })).toBeVisible();
  });

  test('logout vuelve a login y bloquea home', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Salir' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill('ClaveWrong9');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.locator('p.text-danger, .text-danger')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
