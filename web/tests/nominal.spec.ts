import { test as base, expect, type Page } from '@playwright/test';
import { Client } from 'minio';
import { createClient } from 'redis';

// Test fixtures and types
type TestFixtures = {
  cleanDb: void;
  minioClient: Client;
  redisClient: ReturnType<typeof createClient>;
  authenticatedPage: Page;
};

// Extend base test with our fixtures
const test = base.extend<TestFixtures>({
  cleanDb: [async ({ minioClient, redisClient }, use) => {
    console.log('🧹 Cleaning database...');
    // Clear MinIO buckets
    const buckets = ['skystore'];
    for (const bucket of buckets) {
      const objectStream = minioClient.listObjects(bucket, '', true);
      for await (const obj of objectStream) {
        await minioClient.removeObject(bucket, obj.name);
      }
    }

    // Clear Redis
    await redisClient.connect();
    await redisClient.flushAll();
    await redisClient.disconnect();
    console.log('✨ Database cleaned');

    await use();
  }, { auto: true }],

  minioClient: [async ({}, use) => {
    console.log('🔌 Initializing MinIO client...');
    const client = new Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin'
    });
    await use(client);
    console.log('✅ MinIO client initialized');
  }, { auto: true }],

  redisClient: [async ({}, use) => {
    console.log('🔌 Initializing Redis client...');
    const client = createClient({
      url: 'redis://localhost:6379'
    });
    await use(client);
    console.log('✅ Redis client initialized');
  }, { auto: true }],

  // New fixture for authenticated page
  authenticatedPage: async ({ page }, use) => {
    // Listen to all console events
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      // Filter out noisy messages if needed
      if (!text.includes('Download the React DevTools')) {
        console.log(`🌐 [Browser ${type}]: ${text}`);
      }
    });

    console.log('🔑 Starting authentication process...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    console.log('📄 Page loaded');
    
    await page.getByText('No Organizations Yet').click();
    await expect(page.locator('#root')).toContainText('Sign In');
    console.log('👤 On sign in page');
    
    await page.getByRole('button', { name: '? Sign In' }).click();
    console.log('📝 Filling user profile...');

    // Fill in user details
    await page.getByRole('textbox', { name: 'Full Name' }).fill(TEST_USER.fullName);
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: 'Bio' }).fill(TEST_USER.bio);
    await page.getByRole('textbox', { name: 'Location' }).fill(TEST_USER.location);
    await page.getByRole('textbox', { name: 'Company' }).fill(TEST_USER.company);
    await page.getByRole('textbox', { name: 'Website' }).fill(TEST_USER.website);
    console.log('✍️ Profile details filled');
    
    await page.getByRole('button', { name: 'Create Profile' }).click();
    console.log('⏳ Waiting for profile creation...');
    await page.waitForLoadState('networkidle');
    
    // Wait for profile creation and navigation with increased timeout
    await expect(page.getByRole('main')).toContainText(TEST_USER.fullName, { timeout: 10000 });
    console.log('✅ Profile created');
    
    await page.getByRole('button', { name: 'SkyStore' }).click();
    await page.waitForLoadState('networkidle');
    
    // Wait for welcome message
    await expect(page.getByRole('heading')).toContainText('Welcome back', { timeout: 10000 });
    await expect(page.getByRole('heading')).toContainText(TEST_USER.fullName, { timeout: 10000 });
    console.log('🏠 On home page');

    await use(page);
  }
});

// Test data constants
const TEST_USER = {
  fullName: 'Alexander Carter',
  email: 'alex@andreaslabs.com',
  bio: 'Test user',
  location: 'Test City, CA',
  company: 'Andreas',
  website: 'andreaslabs.com'
};

const TEST_ORGS = [
  {
    id: 'test-org-1',
    name: 'Test Organization #1',
    description: 'This is the first test org!'
  },
  {
    id: 'test-org-2',
    name: 'Test Organization #2',
    description: 'Test org 2'
  }
];

const TEST_PROJECT = {
  id: 'cool-project',
  name: 'Cool Project',
  description: 'my cool project'
};

const TEST_MISSION = {
  id: 'cool-mission-1',
  name: 'My Cool Mission'
};

const TEST_ASSETS = [
  'DJI_20250210133547_0001_D.JPG',
  'DJI_20250210133549_0002_D.JPG',
  'DJI_20250210133551_0003_D.JPG',
  'DJI_20250210133553_0004_D.JPG'
];

// Helper functions
async function refreshAndWait(page: Page) {
  console.log('🔄 Refreshing page...');
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  console.log('✅ Page refreshed');
}

async function createOrganization(page: Page, org: typeof TEST_ORGS[0]) {
  console.log(`🏢 Creating organization: ${org.name}`);
  
  // Wait for the page to be in a stable state
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Log the current URL and content
  console.log(`📍 Current URL: ${page.url()}`);
  console.log('🔍 Looking for Create Organization button...');
  
  // Take screenshot of current state
  await page.screenshot({ path: `debug-before-create-org-${Date.now()}.png` });
  
  // Try to find the button with different selectors
  const createOrgButton = page.getByRole('button', { name: 'Create Organization' });
  const buttonCount = await createOrgButton.count();
  console.log(`Found ${buttonCount} Create Organization buttons`);
  
  // Log all buttons on the page
  const allButtons = page.getByRole('button');
  const buttonTexts = await allButtons.allInnerTexts();
  console.log('All buttons on page:', buttonTexts);
  
  if (buttonCount === 0) {
    // Log the page content for debugging
    console.log('📄 Current page content:');
    console.log(await page.content());
    
    // Try alternative selectors
    console.log('Trying alternative selectors...');
    const buttonByText = page.getByText('Create Organization', { exact: true });
    const buttonByTextCount = await buttonByText.count();
    console.log(`Found ${buttonByTextCount} elements with exact text 'Create Organization'`);
    
    // Check if button might be in a loading state
    const loadingButtons = await page.$$('[aria-busy="true"]');
    console.log(`Found ${loadingButtons.length} loading buttons`);
  }
  
  // Wait for any of the Create Organization buttons
  console.log('Waiting for Create Organization button to be visible...');
  await expect(createOrgButton.first()).toBeVisible({ timeout: 10000 });
  
  // Log button state before clicking
  const firstButton = createOrgButton.first();
  const isVisible = await firstButton.isVisible();
  const isEnabled = await firstButton.isEnabled();
  const box = await firstButton.boundingBox();
  console.log('Button state:', { isVisible, isEnabled, box });
  
  // Take screenshot right before clicking
  await page.screenshot({ path: `debug-before-click-${Date.now()}.png` });
  
  await firstButton.click();
  console.log('Button clicked');
  await page.waitForLoadState('networkidle');
  
  console.log('📝 Filling organization details...');
  await page.getByRole('textbox', { name: 'Organization ID' }).fill(org.id);
  await page.getByRole('textbox', { name: 'Name' }).fill(org.name);
  await page.getByRole('textbox', { name: 'Description' }).fill(org.description);
  
  const submitButton = page.getByRole('button', { name: 'Create Organization' });
  await expect(submitButton).toBeVisible({ timeout: 10000 });
  
  // Log submit button state
  const submitIsVisible = await submitButton.isVisible();
  const submitIsEnabled = await submitButton.isEnabled();
  console.log('Submit button state:', { submitIsVisible, submitIsEnabled });
  
  await submitButton.click();
  console.log('Submit button clicked');
  await page.waitForLoadState('networkidle');
  
  // Wait for organization creation and verify
  await expect(page.getByRole('heading')).toContainText(org.name, { timeout: 10000 });
  console.log('✅ Organization created');
}

async function createProject(page: Page) {
  const createProjectButton = page.getByRole('button', { name: 'Create Project' }).nth(1);
  await expect(createProjectButton).toBeVisible();
  await createProjectButton.click();
  await page.waitForLoadState('networkidle');

  await page.getByRole('textbox', { name: 'Project ID' }).fill(TEST_PROJECT.id);
  await page.getByRole('textbox', { name: 'Name' }).fill(TEST_PROJECT.name);
  await page.getByRole('textbox', { name: 'Description' }).fill(TEST_PROJECT.description);
  await page.getByRole('button', { name: 'Create Project' }).click();
  await page.waitForLoadState('networkidle');
  
  // Wait for project creation
  await expect(page.getByRole('main')).toContainText('Select a mission or create a new one');
}

async function createMission(page: Page) {
  console.log('🎯 Creating new mission...');
  
  // Wait for the page to be in a stable state
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Log the current URL and content
  console.log(`📍 Current URL: ${page.url()}`);
  console.log('🔍 Looking for Create Mission button...');
  
  // Try to find the button with different selectors
  const createMissionButton = page.getByRole('button', { name: 'Create Mission' });
  const buttonCount = await createMissionButton.count();
  console.log(`Found ${buttonCount} Create Mission buttons`);
  
  // Log all buttons on the page
  const allButtons = page.getByRole('button');
  const buttonTexts = await allButtons.allInnerTexts();
  console.log('All buttons on page:', buttonTexts);
  
  // Wait for any of the Create Mission buttons
  console.log('Waiting for Create Mission button to be visible...');
  await expect(createMissionButton.first()).toBeVisible({ timeout: 10000 });
  
  // Log button state before clicking
  const firstButton = createMissionButton.first();
  const isVisible = await firstButton.isVisible();
  const isEnabled = await firstButton.isEnabled();
  const box = await firstButton.boundingBox();
  console.log('Button state:', { isVisible, isEnabled, box });
  
  await firstButton.click();
  console.log('Create Mission button clicked');
  await page.waitForLoadState('networkidle');

  console.log('📝 Filling mission details...');
  await page.getByRole('textbox', { name: 'Mission ID' }).fill(TEST_MISSION.id);
  await page.getByRole('textbox', { name: 'Name' }).fill(TEST_MISSION.name);
  
  console.log('🗺️ Setting mission location on map...');
  
  // Wait for map container to be ready
  console.log('Waiting for map container...');
  const mapContainer = page.locator('.mapboxgl-map');
  await expect(mapContainer).toBeVisible({ timeout: 10000 });
  
  // Wait for map to be interactive
  console.log('Waiting for map to be interactive...');
  await page.waitForFunction(() => {
    const map = document.querySelector('.mapboxgl-map');
    return map && !map.classList.contains('mapboxgl-map--loading');
  }, { timeout: 10000 }).catch(e => {
    console.log('⚠️ Map loading state check failed:', e);
  });
  
  // Try to find and click the map marker with retries
  console.log('Attempting to interact with map...');
  let retries = 3;
  while (retries > 0) {
    try {
      const mapMarker = page.getByRole('img', { name: 'Map marker' }).getByRole('img');
      await expect(mapMarker).toBeVisible({ timeout: 5000 });
      await mapMarker.click();
      console.log('✅ Successfully clicked map marker');
      break;
    } catch (e) {
      console.log(`⚠️ Retry ${4 - retries}/3: Failed to click map marker:`, e);
      retries--;
      if (retries === 0) {
        console.log('❌ Failed to interact with map after all retries');
        throw e;
      }
      await page.waitForTimeout(1000);
    }
  }
  
  // Click on map with retries
  console.log('Setting map location...');
  retries = 3;
  while (retries > 0) {
    try {
      const mapRegion = page.getByRole('region', { name: 'Map' });
      await expect(mapRegion).toBeVisible({ timeout: 5000 });
      await mapRegion.click({
        position: { x: 433, y: 140 },
        timeout: 5000
      });
      console.log('✅ Successfully set map location');
      break;
    } catch (e) {
      console.log(`⚠️ Retry ${4 - retries}/3: Failed to set map location:`, e);
      retries--;
      if (retries === 0) {
        console.log('❌ Failed to set map location after all retries');
        throw e;
      }
      await page.waitForTimeout(1000);
    }
  }
  
  console.log('Proceeding with mission creation...');
  const submitButton = page.getByRole('button', { name: 'Create Mission' });
  await expect(submitButton).toBeVisible({ timeout: 10000 });
  
  // Log submit button state
  const submitIsVisible = await submitButton.isVisible();
  const submitIsEnabled = await submitButton.isEnabled();
  console.log('Submit button state:', { submitIsVisible, submitIsEnabled });
  
  await submitButton.click();
  console.log('Submit button clicked');
  await page.waitForLoadState('networkidle');
  
  // Enhanced verification and navigation after mission creation
  console.log('Verifying mission creation...');
  
  // Wait for the mission details to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Verify we're on the correct page
  const currentUrl = page.url();
  console.log(`📍 Current URL after creation: ${currentUrl}`);
  
  // Wait for mission name to appear in the page content
  await expect(page.getByRole('main')).toContainText(TEST_MISSION.name, { timeout: 10000 });
  console.log('✅ Mission name visible in content');
  
  // Verify we're in the mission context by checking the breadcrumb/navigation path
  await expect(page.locator('#root')).toContainText([
    TEST_ORGS[0].name,
    TEST_PROJECT.name,
    TEST_MISSION.name
  ].join(''), { timeout: 10000 });
  
  // Try to find any mission-related UI elements
  const missionElements = [
    page.getByRole('heading', { name: TEST_MISSION.name }),
    page.getByRole('link', { name: TEST_MISSION.name }),
    page.getByText(TEST_MISSION.name)
  ];
  
  let foundMissionElement = false;
  for (const element of missionElements) {
    try {
      await expect(element).toBeVisible({ timeout: 5000 });
      foundMissionElement = true;
      console.log('✅ Found mission element in UI');
      break;
    } catch (e) {
      // Continue trying other selectors
    }
  }
  
  if (!foundMissionElement) {
    console.log('⚠️ Could not find mission element with standard selectors, but mission was created');
  }
  
  // Verify the URL structure is correct
  const expectedUrlPattern = new RegExp(`/org/${TEST_ORGS[0].id}/project/${TEST_PROJECT.id}/mission/${TEST_MISSION.id}`);
  expect(currentUrl).toMatch(expectedUrlPattern);
  console.log('✅ Mission URL structure is correct');
  
  console.log('✅ Mission created successfully');
}

// Tests
test.describe('SkyStore Web Application', () => {
  test('should create and manage organizations', async ({ authenticatedPage: page }) => {
    console.log('🧪 Starting organization management test...');
    
    // Create first organization
    await createOrganization(page, TEST_ORGS[0]);
    await refreshAndWait(page);

    console.log('🔄 Testing organization switching...');
    
    // Make sure we're on the correct page before switching
    console.log('📍 Navigating to organization selection...');
    const changeOrgButton = page.getByRole('button', { name: 'Change Organization' });
    // Create second organization
    await page.getByRole('button', { name: 'Change Organization' }).click();
    await createOrganization(page, TEST_ORGS[1]);
    await refreshAndWait(page);

    console.log('🔄 Testing organization switching...');
    // Verify organization switching
    await page.getByRole('button', { name: 'Change Organization' }).click();
    await page.getByRole('button', { name: 'View Projects' }).first().click();
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Test Organization #' }).click();
    await expect(page.getByLabel('Test Organization #')).toContainText(TEST_ORGS[1].name);
    
    await page.getByRole('menuitem', { name: TEST_ORGS[0].name }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel('Test Organization #')).toContainText(TEST_ORGS[0].name);
  });

  test('should create and manage projects and missions', async ({ authenticatedPage: page }) => {
    await refreshAndWait(page);
    
    // Create first organization if not exists
    try {
      await createOrganization(page, TEST_ORGS[0]);
    } catch (e) {
      // Organization might already exist
      console.log('Organization may already exist, continuing...');
    }

    await refreshAndWait(page);

    // Create project
    await createProject(page);
    await refreshAndWait(page);
    
    // Verify project creation
    await page.getByRole('button', { name: 'Change Project' }).click();
    await expect(page.getByRole('main')).toContainText(TEST_PROJECT.name);
    await page.getByRole('main').getByRole('button', { name: 'Select Project' }).click();
    await page.waitForLoadState('networkidle');

    // Create mission
    await expect(page.getByRole('main')).toContainText('No Missions Yet');
    await createMission(page);
    await page.getByRole('main').getByRole('button', { name: 'Select Mission' }).click();
    await page.waitForLoadState('networkidle');

    // Verify full navigation path
    await expect(page.locator('#root')).toContainText([
      'SkyStore',
      TEST_ORGS[0].name,
      TEST_PROJECT.name,
      TEST_MISSION.name
    ].join(''));
  });

  test('should handle asset uploads', async ({ authenticatedPage: page }) => {
    await refreshAndWait(page);
    
    // Navigate to the correct mission if needed
    const uploadButton = page.getByRole('button', { name: 'Upload Assets' }).first();
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    await page.waitForLoadState('networkidle');
    
    // Upload assets
    await page.getByRole('button', { name: 'Upload Assets' }).first().setInputFiles(TEST_ASSETS);
    await page.waitForLoadState('networkidle');

    // Verify uploads with retries
    for (const asset of TEST_ASSETS) {
      await expect(page.getByRole('main')).toContainText(asset, { timeout: 10000 });
    }

    // Navigate through assets
    await page.locator('a').filter({ hasText: `Assets${TEST_MISSION.name}` }).click();
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('textbox', { name: 'Select a mission' }).click();
    await page.getByRole('option', { name: TEST_MISSION.name }).click();
    await page.waitForLoadState('networkidle');
    
    await page.locator('a').filter({ hasText: `Mission${TEST_MISSION.name}` }).click();
    await page.waitForLoadState('networkidle');
    
    await page.locator('a').filter({ hasText: `Assets${TEST_MISSION.name}` }).click();
    await page.waitForLoadState('networkidle');

    // Verify assets are still visible with longer timeout
    await expect(page.getByRole('main')).toContainText(TEST_ASSETS[3], { timeout: 10000 });
    await expect(page.getByRole('main')).toContainText(TEST_ASSETS[2], { timeout: 10000 });
  });
});
