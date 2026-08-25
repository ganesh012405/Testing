const { test, expect } = require('@playwright/test');

const DASHBOARD_URL = 'file:///C:/workspace/Training/dashboard/index.html';

test.describe('FleetPulse dashboard - 20 test cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await expect(
      page.getByRole('list', { name: 'Vehicle list' }).getByRole('button', { name: /Select / }).first()
    ).toBeVisible();
  });

  test('TC01 - should load with FleetPulse title', async ({ page }) => {
    await expect(page).toHaveTitle(/FleetPulse/);
  });

  test('TC02 - should show Fleet brand in header', async ({ page }) => {
    await expect(page.getByText('FleetPulse', { exact: true })).toBeVisible();
  });

  test('TC03 - should show UTC clock format', async ({ page }) => {
    await expect(page.getByText(/\d{2}:\d{2}:\d{2} UTC/)).toBeVisible();
  });

  test('TC04 - should render alerts bell control', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Open alerts' })).toBeVisible();
  });

  test('TC05 - should render fleet filter tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Online' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Warning' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Offline' })).toBeVisible();
  });

  test('TC06 - should list all 5 vehicles under All filter', async ({ page }) => {
    const fleetList = page.getByRole('list', { name: 'Vehicle list' });
    await expect(fleetList.getByRole('button', { name: /Select / })).toHaveCount(5);
  });

  test('TC07 - should filter to online vehicles', async ({ page }) => {
    const fleetList = page.getByRole('list', { name: 'Vehicle list' });
    await page.getByRole('tab', { name: 'Online' }).click();
    await expect(fleetList.getByRole('button', { name: /Select / })).toHaveCount(2);
    await expect(fleetList.getByRole('button', { name: 'Select Truck Alpha' })).toBeVisible();
    await expect(fleetList.getByRole('button', { name: 'Select Truck Delta' })).toBeVisible();
  });

  test('TC08 - should filter to warning vehicles', async ({ page }) => {
    const fleetList = page.getByRole('list', { name: 'Vehicle list' });
    await page.getByRole('tab', { name: 'Warning' }).click();
    await expect(fleetList.getByRole('button', { name: /Select / })).toHaveCount(1);
    await expect(fleetList.getByRole('button', { name: 'Select Van Bravo' })).toBeVisible();
  });

  test('TC09 - should filter to offline vehicles', async ({ page }) => {
    const fleetList = page.getByRole('list', { name: 'Vehicle list' });
    await page.getByRole('tab', { name: 'Offline' }).click();
    await expect(fleetList.getByRole('button', { name: /Select / })).toHaveCount(1);
    await expect(fleetList.getByRole('button', { name: 'Select Van Echo' })).toBeVisible();
  });

  test('TC10 - should search by vehicle name', async ({ page }) => {
    const fleetList = page.getByRole('list', { name: 'Vehicle list' });
    await page.getByRole('searchbox', { name: 'Search vehicles' }).fill('delta');
    await expect(fleetList.getByRole('button', { name: /Select / })).toHaveCount(1);
    await expect(fleetList.getByRole('button', { name: 'Select Truck Delta' })).toBeVisible();
  });

  test('TC11 - should search by driver name', async ({ page }) => {
    const fleetList = page.getByRole('list', { name: 'Vehicle list' });
    await page.getByRole('searchbox', { name: 'Search vehicles' }).fill('Patel');
    await expect(fleetList.getByRole('button', { name: /Select / })).toHaveCount(1);
    await expect(fleetList.getByRole('button', { name: 'Select Van Bravo' })).toBeVisible();
  });

  test('TC12 - should show empty state for unmatched search', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search vehicles' }).fill('non-existent-vehicle');
    await expect(page.getByText('No vehicles match.')).toBeVisible();
  });

  test('TC13 - should update telemetry panel when Truck Delta is selected', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Truck Delta' }).click();
    await expect(page.getByRole('heading', { name: 'Truck Delta', level: 3 })).toBeVisible();
  });

  test('TC14 - should show Offline badge for Van Echo selection', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Van Echo' }).click();
    await expect(
      page.getByLabel('Vehicle telemetry detail').getByText('Offline', { exact: true })
    ).toBeVisible();
  });

  test('TC15 - should render vehicle details table with core rows', async ({ page }) => {
    await expect(page.getByRole('table', { name: 'Vehicle details' })).toBeVisible();
    await expect(page.getByRole('row', { name: /Odometer/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /RPM/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Heading/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Coordinates/ })).toBeVisible();
  });

  test('TC16 - should render map section and fit button', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Vehicle map' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fit all vehicles in view' })).toBeVisible();
  });

  test('TC17 - should render all KPI labels', async ({ page }) => {
    await expect(page.getByText('Active Vehicles', { exact: true })).toBeVisible();
    await expect(page.getByText('Avg Fleet Speed', { exact: true })).toBeVisible();
    await expect(page.getByText('Active Alerts', { exact: true })).toBeVisible();
    await expect(page.getByText('Distance Today', { exact: true })).toBeVisible();
  });

  test('TC18 - should render alert feed entries and dismiss buttons', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Alert feed' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dismiss alert' }).first()).toBeVisible();
  });

  test('TC19 - should reduce unread alert count when an alert is dismissed', async ({ page }) => {
    const countBefore = await page.evaluate(() => Number(document.getElementById('alertBadge')?.dataset.count || '0'));
    await page.getByRole('button', { name: 'Dismiss alert' }).first().click();
    await expect.poll(async () => {
      return page.evaluate(() => Number(document.getElementById('alertBadge')?.dataset.count || '0'));
    }).toBeLessThan(countBefore);
  });

  test('TC20 - should validate dashboard page title', async ({ page }) => {
    await expect(page).toHaveTitle('FleetPulse — Vehicle Telemetry Dashboard');
  });
});
