import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { apiCreateNewUser } from "../helpers/api-requests.js";

test.describe("Returning User Cookie", () => {
  let email: string;
  let password: string;

  test.beforeEach(async ({}) => {
    email = faker.internet.email({
      provider: "example.com",
    });
    password = faker.internet.password();
    await apiCreateNewUser(
      email,
      password,
      faker.person.firstName(),
      faker.person.lastName()
    );
  });

  test("should set returning_user cookie after successful login", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    // Verify cookie doesn't exist before login
    const cookiesBefore = await page.context().cookies();
    const returningUserCookieBefore = cookiesBefore.find(
      (cookie) => cookie.name === "returning_user"
    );
    expect(returningUserCookieBefore).toBeUndefined();

    // Perform login
    await page.getByTestId("email").locator("input").fill(email);
    await page.getByTestId("password").locator("input").fill(password);
    await page.getByTestId("sign-in-submit").click();

    // Wait for successful login
    await expect(page.getByTestId("profile-menu-item")).toBeVisible();

    // Verify returning_user cookie is set after login
    const cookiesAfter = await page.context().cookies();
    const returningUserCookie = cookiesAfter.find(
      (cookie) => cookie.name === "returning_user"
    );

    expect(returningUserCookie).toBeDefined();
    expect(returningUserCookie?.value).toBe("true");
    expect(returningUserCookie?.path).toBe("/");
  });

  test("should set returning_user cookie after successful sign-up", async ({
    page,
  }) => {
    const newEmail = faker.internet.email({
      provider: "example.com",
    });
    const newPassword = faker.internet.password();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    await page.goto("/sign-up");

    // Verify cookie doesn't exist before sign-up
    const cookiesBefore = await page.context().cookies();
    const returningUserCookieBefore = cookiesBefore.find(
      (cookie) => cookie.name === "returning_user"
    );
    expect(returningUserCookieBefore).toBeUndefined();

    // Fill sign-up form
    await page.getByTestId("first-name").locator("input").fill(firstName);
    await page.getByTestId("last-name").locator("input").fill(lastName);
    await page.getByTestId("email").locator("input").fill(newEmail);
    await page.getByTestId("password").locator("input").fill(newPassword);

    // Accept policy - try both possible test IDs
    const privacyCheckbox = page
      .getByTestId("privacy")
      .locator('input[type="checkbox"]');
    if ((await privacyCheckbox.count()) > 0) {
      await privacyCheckbox.check();
    } else {
      // Fallback to privacy-policy if privacy doesn't work
      await page
        .getByTestId("privacy-policy")
        .locator('input[type="checkbox"]')
        .check();
    }

    // Submit sign-up
    await page.getByTestId("sign-up-submit").click();

    // Wait for successful sign-up - wait for navigation away from sign-up page
    await expect(page).not.toHaveURL(/\/sign-up$/);

    // Verify returning_user cookie is set after sign-up
    const cookiesAfter = await page.context().cookies();
    const returningUserCookie = cookiesAfter.find(
      (cookie) => cookie.name === "returning_user"
    );

    expect(returningUserCookie).toBeDefined();
    expect(returningUserCookie?.value).toBe("true");
    expect(returningUserCookie?.path).toBe("/");
  });

  test("should clear returning_user cookie after logout", async ({ page }) => {
    await page.goto("/sign-in");

    // Login first
    await page.getByTestId("email").locator("input").fill(email);
    await page.getByTestId("password").locator("input").fill(password);
    await page.getByTestId("sign-in-submit").click();

    // Wait for successful login
    await expect(page.getByTestId("profile-menu-item")).toBeVisible();

    // Verify cookie exists after login
    let cookies = await page.context().cookies();
    let returningUserCookie = cookies.find(
      (cookie) => cookie.name === "returning_user"
    );
    expect(returningUserCookie).toBeDefined();

    // Logout via menu
    await page.getByTestId("profile-menu-item").click();
    // Click logout menu item (usually contains "Logout" text)
    await page.getByRole("menuitem", { name: /logout/i }).click();

    // Wait for logout to complete and redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);

    // Verify cookie is cleared after logout
    cookies = await page.context().cookies();
    returningUserCookie = cookies.find(
      (cookie) => cookie.name === "returning_user"
    );
    expect(returningUserCookie).toBeUndefined();
  });

  test("should redirect to sign-in when returning_user cookie exists but user is not logged in", async ({
    page,
  }) => {
    // First, login to set the cookie
    await page.goto("/sign-in");
    await page.getByTestId("email").locator("input").fill(email);
    await page.getByTestId("password").locator("input").fill(password);
    await page.getByTestId("sign-in-submit").click();
    await expect(page.getByTestId("profile-menu-item")).toBeVisible();

    // Verify cookie is set
    const cookies = await page.context().cookies();
    const returningUserCookie = cookies.find(
      (cookie) => cookie.name === "returning_user"
    );
    expect(returningUserCookie).toBeDefined();

    // Clear auth token cookie to simulate logged out state
    // but keep returning_user cookie
    await page.context().clearCookies();
    // Re-set only the returning_user cookie
    await page.context().addCookies([
      {
        name: "returning_user",
        value: "true",
        domain: "localhost",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
      },
    ]);

    // Navigate to home page
    await page.goto("/");

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should not redirect to sign-in when returning_user cookie does not exist", async ({
    page,
  }) => {
    // Clear all cookies
    await page.context().clearCookies();

    // Navigate to home page
    await page.goto("/");

    // Should stay on home page (not redirect to sign-in)
    // The URL should not contain /sign-in
    const url = page.url();
    expect(url).not.toContain("/sign-in");
  });
});
