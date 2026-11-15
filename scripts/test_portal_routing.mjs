import { chromium } from "/Users/jains/.gemini/antigravity/brain/38104b84-f5e3-4de3-b580-86e3fe3d6208/scratch/node_modules/playwright/index.mjs";

async function testNavigation() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message));

  console.log("1. Navigating to /");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  console.log("Current URL:", page.url());

  // Check all links matching Student Portal
  const studentLinks = await page.locator("a:has-text('Student Portal'), button:has-text('Student Portal')").all();
  console.log("Found student links count:", studentLinks.length);
  for (let i = 0; i < studentLinks.length; i++) {
    const href = await studentLinks[i].getAttribute("href");
    const text = await studentLinks[i].innerText();
    console.log(`Link ${i}: text="${text.trim().replace(/\n/g, ' ')}", href="${href}"`);
  }

  // Click the first student portal link
  if (studentLinks.length > 0) {
    console.log("Clicking first student portal link...");
    await studentLinks[0].click();
    await page.waitForTimeout(2000);
    console.log("After click URL:", page.url());
    const title = await page.title();
    console.log("Page title:", title);
    const h1 = await page.locator("h1").allInnerTexts();
    console.log("H1 elements:", h1);
  }

  console.log("\n2. Navigating directly to /student");
  await page.goto("http://localhost:3000/student", { waitUntil: "networkidle" });
  console.log("Current URL:", page.url());
  console.log("Page title:", await page.title());
  console.log("H1 elements:", await page.locator("h1").allInnerTexts());

  console.log("\n3. Navigating directly to /students");
  await page.goto("http://localhost:3000/students", { waitUntil: "networkidle" });
  console.log("Current URL:", page.url());
  console.log("Page title:", await page.title());
  console.log("H1 elements:", await page.locator("h1").allInnerTexts());

  // On /students (404 page), click Student Portal
  const notFoundStudentLink = page.locator("a[href='/student']").first();
  if (await notFoundStudentLink.isVisible()) {
    console.log("Found Student Portal link on 404 page, clicking...");
    await notFoundStudentLink.click();
    await page.waitForTimeout(2000);
    console.log("After clicking Student Portal from 404, URL:", page.url());
    console.log("Page title:", await page.title());
    console.log("H1 elements:", await page.locator("h1").allInnerTexts());
  }

  await browser.close();
}

testNavigation().catch(console.error);
