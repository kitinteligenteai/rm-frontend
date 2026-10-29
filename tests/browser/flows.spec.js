import { test, expect } from "@playwright/test";
import fs from "node:fs";
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "qa@example.invalid",
  created_at: "2025-01-01T00:00:00Z",
  user_metadata: { full_name: "Cuenta QA", onboarding_completed: true },
  aud: "authenticated",
  role: "authenticated",
};
async function fixture(
  page,
  {
    products = [{ product_id: "programa-completo", status: "active" }],
    rows = [],
    accessFailure = false,
    saveFailure = false,
    signedIn = true,
    existingStore = null,
    stateFailure = false,
  } = {},
) {
  const store = existingStore || { rows, planner: {}, gym: {}, logs: [] };
  const requests = [];
  if (signedIn)
    await page.addInitScript(
      (user) =>
        localStorage.setItem(
          "sb-rm-test-auth-token",
          JSON.stringify({
            access_token: "qa",
            refresh_token: "qa",
            expires_at: 9999999999,
            user,
          }),
        ),
      user,
    );
  await page.route("**/*", async (r) => {
    const url = new URL(r.request().url());
    if (url.hostname === "127.0.0.1") return r.continue();
    if (
      url.hostname === "rm-test.invalid" ||
      url.hostname.includes("supabase.co")
    ) {
      requests.push({ url: url.pathname, method: r.request().method() });
      let body = {};
      try {
        body = r.request().postDataJSON() || {};
      } catch {
        /* No JSON request body. */
      }
      if (url.pathname.includes("/auth/"))
        return r.fulfill({
          json: url.pathname.includes("recover") ? {} : user,
        });
      if (url.pathname.includes("my_entitlements"))
        return r.fulfill({
          status: accessFailure ? 503 : 200,
          json: accessFailure ? { message: "offline" } : products,
        });
      if (url.pathname.includes("seguimiento_7dias")) {
        if (r.request().method() !== "GET") {
          if (saveFailure)
            return r.fulfill({ status: 503, json: { message: "offline" } });
          store.rows = store.rows.filter(
            (x) => x.dia_numero !== body.dia_numero,
          );
          store.rows.push(body);
          return r.fulfill({ status: 201, json: null });
        }
        return r.fulfill({ json: store.rows });
      }
      if (url.pathname.includes("save_program_state")) {
        if (saveFailure)
          return r.fulfill({ status: 503, json: { message: "offline" } });
        store[body.p_section] = body.p_value;
        return r.fulfill({ json: null });
      }
      if (url.pathname.includes("program_state"))
        return stateFailure
          ? r.fulfill({ status: 503, json: { message: "offline" } })
          : r.fulfill({ json: { planner: store.planner, gym: store.gym } });
      if (url.pathname.includes("progress_logs")) {
        if (r.request().method() === "POST") {
          if (saveFailure)
            return r.fulfill({ status: 503, json: { message: "offline" } });
          store.logs.push({ ...body, id: 1 });
          return r.fulfill({ status: 201, json: null });
        }
        return r.fulfill({ json: store.logs });
      }
      if (url.pathname.includes("gimnasio/")) {
        const name = url.pathname.split("/").pop();
        const path =
          (process.env.RM_GYM_ASSET_DIR || "tests/fixtures") + "/" + name;
        if (fs.existsSync(path))
          return r.fulfill({
            contentType: "image/png",
            body: fs.readFileSync(path),
          });
      }
      if (url.pathname.includes("get-kit-download"))
        return r.fulfill({ status: 403, json: { error: "purchase_required" } });
      return r.fulfill({ json: [] });
    }
    // No production analytics, real payments, emails or external writes in browser QA.
    if (r.request().resourceType() === "image")
      return r.fulfill({ status: 204 });
    return r.abort();
  });
  return { store, requests };
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("anonymous visitor is sent to login", async ({ page }) => {
  await fixture(page, { signedIn: false });
  await page.goto("/plataforma/gimnasio");
  await expect(page).toHaveURL(/auth/);
});
for (const type of ["none", "kit", "revoked"])
  test(`${type} cannot enter premium`, async ({ page }) => {
    const products =
      type === "none"
        ? []
        : [
            {
              product_id: type === "kit" ? "kit-7-dias" : "programa-completo",
              status: type === "revoked" ? "revoked" : "active",
            },
          ];
    await fixture(page, { products });
    await page.goto("/plataforma/gimnasio");
    await expect(
      page.getByRole("heading", { name: "Necesitas el Programa Completo" }),
    ).toBeVisible();
    await noOverflow(page);
  });
test("entitlement service failure fails closed with retry", async ({
  page,
}) => {
  await fixture(page, { accessFailure: true });
  await page.goto("/plataforma/gimnasio");
  await expect(
    page.getByRole("heading", { name: "No pudimos verificar tu acceso" }),
  ).toBeVisible();
});
test("old account starts day 1; checklist persists after reload and absence retains progress", async ({
  page,
}, testInfo) => {
  const { store } = await fixture(page);
  await page.goto("/plataforma/panel-de-control");
  await expect(page.getByRole("heading", { name: /Día 1/ })).toBeVisible();
  for (const checkbox of await page.getByRole("checkbox").all()) {
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  }
  expect(store.rows[0].tareas_completadas).toHaveLength(3);
  await page.reload();
  await expect(page.getByRole("heading", { name: /Día 2/ })).toBeVisible();
  store.rows[0].updated_at = new Date(Date.now() - 7 * 86400000).toISOString();
  await page.reload();
  await expect(
    page.getByText(/Tu último avance guardado fue hace 7 días/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tengo antojo" }).click();
  await expect(page.getByText(/no necesitas compensarlo/)).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: `audit-evidence/${testInfo.project.name}-dashboard.png`,
    fullPage: true,
  });
});
test("failed checklist save is visible and does not claim progress", async ({
  page,
}) => {
  await fixture(page, { saveFailure: true });
  await page.goto("/plataforma/panel-de-control");
  await page.getByRole("checkbox").first().click();
  await expect(page.getByRole("alert")).toContainText("No se guardó");
  await expect(page.getByRole("checkbox").first()).not.toBeChecked();
});
test("gym shows real illustrations, timer and saved series across reload", async ({
  page,
}, testInfo) => {
  await fixture(page);
  await page.goto("/plataforma/gimnasio");
  await expect(
    page.getByRole("heading", { name: "Gimnasio digital", exact: true }),
  ).toBeVisible();
  const check = page.getByRole("checkbox").first();
  await expect(check).toBeEnabled();
  await check.check();
  await expect(
    page.getByRole("status").filter({ hasText: "Guardado en tu cuenta." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page
    .getByRole("button", { name: "Iniciar", exact: true })
    .first()
    .click();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();
  await page.getByRole("button", { name: "Pausar" }).click();
  await page
    .getByRole("button", { name: "Reiniciar", exact: true })
    .first()
    .click();
  await expect(page.getByLabel("Tiempo restante").first()).toHaveText("00:30");
  await page.getByText("Ver las 12 ilustraciones").click();
  await expect(page.getByRole("img", { name: /Ilustración/ })).toHaveCount(16);
  await noOverflow(page);
  await page.screenshot({
    path: `audit-evidence/${testInfo.project.name}-gym.png`,
    fullPage: true,
  });
});
test("planner creates editable menu, change survives reload; mobile navigation reachable", async ({
  page,
}, testInfo) => {
  await fixture(page);
  await page.goto("/plataforma/planeador");
  await page.getByRole("button", { name: "Crear propuesta de menú" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Guardado en tu cuenta.",
  );
  const first = page.getByRole("button", {
    name: "Elegir Desayuno para Lunes",
  });
  await first.click();
  await page
    .getByRole("button", { name: /g Prot/ })
    .first()
    .click();
  const chosen = await first.locator("p").innerText();
  await expect(page.getByRole("status")).toContainText(
    "Guardado en tu cuenta.",
  );
  await page.reload();
  await expect(first.locator("p")).toHaveText(chosen);
  await noOverflow(page);
  await page.screenshot({
    path: `audit-evidence/${testInfo.project.name}-planner.png`,
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Navegación móvil" })
    .getByRole("link", { name: "Bitácora" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Bitácora de Progreso" }),
  ).toBeVisible();
});
test("bitacora does not claim a failed insert succeeded and retains form", async ({
  page,
}) => {
  await fixture(page, { saveFailure: true });
  await page.goto("/plataforma/bitacora");
  await page.getByLabel("Peso (kg)", { exact: true }).fill("100");
  await page.getByRole("button", { name: "Guardar Progreso" }).click();
  await expect(page.getByRole("alert")).toContainText("No se guardó");
  await expect(page.getByLabel("Peso (kg)", { exact: true })).toHaveValue(
    "100",
  );
});
test("reset request and valid existing recovery session can update password", async ({
  page,
}) => {
  const { requests } = await fixture(page);
  await page.goto("/reset-password");
  await expect(
    page.getByRole("heading", { name: "Nueva Contraseña" }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Escribe tu nueva contraseña"),
  ).toBeVisible();
  await page
    .getByLabel("Nueva contraseña", { exact: true })
    .fill("Qa-Password-2026");
  await page.getByRole("button", { name: "Guardar y Entrar" }).click();
  await expect(
    page.getByText("¡Contraseña guardada! Iniciando sesión..."),
  ).toBeVisible();
  expect(
    requests.some((r) => r.url.includes("/auth/v1/user") && r.method === "PUT"),
  ).toBe(true);
});
test("return URL never claims approval by itself", async ({ page }) => {
  await fixture(page, { signedIn: false });
  await page.goto("/gracias-upsell?session_id=untrusted");
  await expect(
    page.getByText("Verificación de compra", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Pago confirmado", { exact: true })).toHaveCount(
    0,
  );
});
test("public landing and legal routes have no runtime exception or horizontal overflow", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fixture(page, { signedIn: false });
  for (const path of [
    "/",
    "/programa",
    "/reinicio-7-dias",
    "/terminos",
    "/privacidad",
    "/devoluciones",
    "/pago-pendiente",
    "/pago-fallido",
  ]) {
    await page.goto(path);
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
  await page.goto("/programa");
  await page.screenshot({
    path: `audit-evidence/${testInfo.project.name}-program.png`,
    fullPage: true,
  });
});

test("cloud state can be resumed in a separate browser context", async ({
  page,
  browser,
}) => {
  const { store } = await fixture(page);
  await page.goto("/plataforma/gimnasio");
  await expect(page.getByRole("checkbox").first()).toBeEnabled();
  await page.getByRole("checkbox").first().check();
  await expect(
    page.getByRole("status").filter({ hasText: "Guardado en tu cuenta." }),
  ).toBeVisible();
  const second = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const other = await second.newPage();
  await fixture(other, { existingStore: store });
  await other.goto("http://127.0.0.1:4175/plataforma/gimnasio");
  await expect(other.getByRole("checkbox").first()).toBeChecked();
  await second.close();
});
test("unavailable cloud without a local copy cannot overwrite unknown saved state", async ({
  page,
}) => {
  const { requests } = await fixture(page, { stateFailure: true });
  await page.goto("/plataforma/gimnasio");
  await expect(
    page.getByText("No pudimos cargar tus datos. Reintenta antes de editar."),
  ).toBeVisible();
  await expect(page.getByRole("checkbox").first()).toBeDisabled();
  expect(
    requests.filter((r) => r.url.includes("save_program_state")).length,
  ).toBe(0);
});
test("password recovery request uses the reset route and expired link cannot set a password", async ({
  page,
}) => {
  const { requests } = await fixture(page, { signedIn: false });
  await page.goto("/auth?mode=reset");
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill("qa@example.invalid");
  await page.getByRole("button", { name: "Enviar Enlace" }).click();
  await expect(page.getByText(/Revisa tu correo/)).toBeVisible();
  expect(
    requests.some((r) => r.url.includes("/recover") && r.method === "POST"),
  ).toBe(true);
  await page.goto("/reset-password#error=access_denied&error_code=otp_expired");
  await expect(
    page.getByText(/El enlace no es válido o ha caducado/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Guardar y Entrar" }),
  ).toHaveCount(0);
});
test("all program sections render without runtime exceptions", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fixture(page);
  for (const path of ["recetas", "social", "biblioteca", "mis-compras"]) {
    await page.goto("/plataforma/" + path);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
});
