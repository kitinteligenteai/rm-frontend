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
    account = user,
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
      account,
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
          json: url.pathname.includes("recover") ? {} : account,
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
  await page.getByRole("button", { name: "Preparar sesión guiada" }).click();
  await page.getByRole("button", { name: "Ya calenté, comenzar" }).click();
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pausar", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  await expect(page.getByLabel("Tiempo restante")).toHaveText("00:30");
  await page
    .getByRole("button", { name: "Registrar serie y descansar" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Recupera el aire" }),
  ).toBeVisible();
  await expect(page.getByLabel("Tiempo restante")).toHaveText("00:45");
  await page
    .getByText("Biblioteca de 20 movimientos y variantes", { exact: true })
    .click();
  await expect(page.getByRole("img", { name: /Ilustración de/ })).toHaveCount(
    24,
  );
  await page
    .getByText("Biblioteca de 20 movimientos y variantes", { exact: true })
    .click();
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

for (const mode of ["Sin equipo", "Con mancuernas"])
  test(`gym all 12 sessions load correct images and no empty variants: ${mode}`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(60000);
    await fixture(page);
    await page.goto("/plataforma/gimnasio");
    await page.getByRole("button", { name: mode, exact: true }).click();
    for (let week = 1; week <= 4; week++)
      for (let day = 1; day <= 3; day++) {
        await page
          .getByLabel("Semana", { exact: true })
          .selectOption(String(week));
        await page
          .getByLabel("Sesión", { exact: true })
          .selectOption(String(day));
        const images = page
          .getByRole("region", { name: "Movimientos de esta sesión" })
          .getByRole("img");
        await expect(images).toHaveCount(4);
        for (const image of await images.all()) {
          await image.scrollIntoViewIfNeeded();
          await expect
            .poll(() => image.evaluate((i) => i.complete && i.naturalWidth > 0))
            .toBe(true);
        }
        await expect(page.getByRole("alert")).toHaveCount(0);
        await noOverflow(page);
      }
    await expect(page.getByRole('status').filter({hasText:'Guardado en tu cuenta.'})).toBeVisible();
    await page.screenshot({
      path: `audit-evidence/${testInfo.project.name}-gym-${mode === "Sin equipo" ? "body" : "dumbbells"}.png`,
      fullPage: true,
    });
  });
test("guided workout resumes on second device and alternative, rest and completed session persist", async ({
  page,
  browser,
}) => {
  const { store } = await fixture(page);
  await page.goto("/plataforma/gimnasio");
  await page
    .getByRole("button", { name: "Con mancuernas", exact: true })
    .click();
  await page.getByLabel("Vueltas", { exact: true }).selectOption("1");
  await page.getByRole("button", { name: "Preparar sesión guiada" }).click();
  await page.getByRole("button", { name: "Ya calenté, comenzar" }).click();
  await page
    .getByRole("button", { name: "Usar alternativa más sencilla" })
    .click();
  const guide = page.getByRole("region", { name: "Sesión guiada" });
  await expect(
    guide.getByRole("heading", { name: "Sentadilla en silla", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Registrar serie y descansar" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Guardado en tu cuenta." }),
  ).toBeVisible();
  const context = await browser.newContext();
  const other = await context.newPage();
  await fixture(other, { existingStore: store });
  await other.goto("/plataforma/gimnasio");
  await expect(
    other.getByRole("heading", { name: "Recupera el aire" }),
  ).toBeVisible();
  for (let i = 0; i < 4; i++) {
    await other
      .getByRole("button", { name: "Continuar al siguiente paso" })
      .click();
    if (i < 3)
      await other
        .getByRole("button", { name: "Registrar serie y descansar" })
        .click();
  }
  await expect(
    other.getByRole("heading", { name: "Baja el ritmo" }),
  ).toBeVisible();
  await other
    .getByRole("button", { name: "Finalizar y guardar sesión" })
    .click();
  await expect(
    other.getByText("1 sesiones registradas", { exact: true }),
  ).toBeVisible();
  await expect(
    other.getByRole("status").filter({ hasText: "Guardado en tu cuenta." }),
  ).toBeVisible();
  await other.reload();
  await expect(
    other.getByText("1 sesiones registradas", { exact: true }),
  ).toBeVisible();
  await context.close();
});
test("dirty local cache is never uploaded after failed remote load", async ({
  page,
}) => {
  const key = `rm:${user.id}:gym:v1`;
  const local = {
    version: 2,
    selection: { mode: "cuerpo", week: 2, day: 1, rounds: 2 },
    marks: { local: true },
  };
  await page.addInitScript(
    ({ key, local }) =>
      localStorage.setItem(
        key,
        JSON.stringify({ value: local, dirty: true, baseline: {} }),
      ),
    { key, local },
  );
  const { requests, store } = await fixture(page, {
    stateFailure: true,
    existingStore: { rows: [], planner: {}, gym: { remote: true }, logs: [] },
  });
  await page.goto("/plataforma/gimnasio");
  await expect(
    page.getByText("No pudimos cargar tus datos. Reintenta antes de editar.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preparar sesión guiada" }),
  ).toBeDisabled();
  expect(
    requests.filter((r) => r.url.includes("save_program_state")),
  ).toHaveLength(0);
  expect(store.gym).toEqual({ remote: true });
});
test("different account cannot recover the previous account cache", async ({
  page,
}) => {
  await page.addInitScript(
    (id) =>
      localStorage.setItem(
        `rm:${id}:gym:v1`,
        JSON.stringify({
          value: { secret: "previous-account", sessions: { old: true } },
          dirty: false,
        }),
      ),
    user.id,
  );
  await fixture(page, {
    account: {
      ...user,
      id: "00000000-0000-4000-8000-000000000099",
      email: "second@example.invalid",
    },
  });
  await page.goto("/plataforma/gimnasio");
  await expect(
    page.getByText("0 sesiones registradas", { exact: true }),
  ).toBeVisible();
});

test("conflicting cache requires explicit resolution and saves a recovery copy", async ({
  page,
}) => {
  const key = `rm:${user.id}:gym:v1`;
  const local = {
    version: 2,
    selection: { mode: "cuerpo", week: 2, day: 1, rounds: 2 },
    marks: { local: true },
  };
  await page.addInitScript(
    ({ key, local }) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem(
          key,
          JSON.stringify({ value: local, dirty: true, baseline: {} }),
        );
        sessionStorage.setItem("seeded", "1");
      }
    },
    { key, local },
  );
  const { requests, store } = await fixture(page, {
    existingStore: { rows: [], planner: {}, gym: { remote: true }, logs: [] },
  });
  await page.goto("/plataforma/gimnasio");
  await expect(
    page.getByText("Hay cambios distintos en este navegador y en tu cuenta.", {
      exact: false,
    }),
  ).toBeVisible();
  expect(
    requests.filter((r) => r.url.includes("save_program_state")),
  ).toHaveLength(0);
  await page
    .getByRole("button", {
      name: "Cargar versión de mi cuenta y conservar copia local",
    })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Guardado en tu cuenta." }),
  ).toBeVisible();
  expect(store.gym).toEqual({ remote: true });
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key + ":conflict-backup")).value,
      key,
    ),
  ).toEqual(local);
});
test("exercise illustration opens as a modal and returns to session", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/plataforma/gimnasio");
  await page
    .getByRole("button", {
      name: "Ampliar ilustración de Sentadilla en silla",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("dialog", {
      name: "Ilustración ampliada: Sentadilla en silla",
    }),
  ).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: "Cerrar imagen" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("mobile cross-browser return explains automatic delivery without trusting URL status", async ({
  page,
}) => {
  await fixture(page, { signedIn: false });
  await page.goto(
    "/gracias-kit?session_id=00000000-0000-4000-8000-000000000088&status=approved",
  );
  await expect(
    page.getByText(/No necesitas volver al mismo navegador/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Consultar estado de mi compra" }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Pago verificado por el servidor.", { exact: false }),
  ).toHaveCount(0);
  await noOverflow(page);
});
test("logout removes the current environment session and preserves per-account progress cache", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/plataforma/gimnasio");
  await page.getByRole("checkbox").first().check();
  await expect(
    page.getByRole("status").filter({ hasText: "Guardado en tu cuenta." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/auth/);
  expect(
    await page.evaluate(() => localStorage.getItem("sb-rm-test-auth-token")),
  ).toBeNull();
  expect(
    await page.evaluate(
      (id) => JSON.parse(localStorage.getItem(`rm:${id}:gym:v1`)).value.marks,
      user.id,
    ),
  ).toBeTruthy();
});
test("MXN checkout collects matching delivery email and posts no client price", async ({
  page,
}, testInfo) => {
  await fixture(page, { signedIn: false });
  await page.goto("/programa");
  await page
    .getByRole("button", { name: "🇲🇽 MXN", exact: true })
    .first()
    .click();
  const form = page
    .locator("form")
    .filter({
      has: page.getByRole("button", {
        name: "Pagar Programa Completo",
        exact: true,
      }),
    })
    .first();
  await form
    .getByLabel("Correo para recibir tu producto", { exact: true })
    .fill("qa@example.invalid");
  await form
    .getByLabel("Confirma tu correo", { exact: true })
    .fill("wrong@example.invalid");
  await page.getByRole("checkbox").first().check();
  await form
    .getByRole("button", { name: "Pagar Programa Completo", exact: true })
    .click();
  await expect(form.getByRole("alert")).toContainText(
    "Los correos deben coincidir",
  );
  await form
    .getByLabel("Confirma tu correo", { exact: true })
    .fill("qa@example.invalid");
  let payload;
  await page.route(
    "**/functions/v1/mp-generate-preference-v2",
    async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({
        status: 503,
        json: { error: "staging_checkout_not_configured" },
      });
    },
  );
  await form
    .getByRole("button", { name: "Pagar Programa Completo", exact: true })
    .click();
  await expect.poll(() => payload?.email).toBe("qa@example.invalid");
  expect(payload.emailConfirmation).toBe("qa@example.invalid");
  expect(payload.productId).toBe("programa-completo");
  expect(payload.price).toBeUndefined();
  await expect(form.getByRole("alert")).toContainText(
    "No se pudo iniciar el pago",
  );
  await noOverflow(page);
  await page.screenshot({
    path: `audit-evidence/${testInfo.project.name}-checkout.png`,
  });
});

test("JSONB key ordering does not cause a false conflict for a legitimate dirty cache", async ({
  page,
}) => {
  const key = `rm:${user.id}:gym:v1`;
  const local = {
    selection: { mode: "cuerpo", week: 2, day: 1, rounds: 2 },
    marks: { local: true },
  };
  await page.addInitScript(
    ({ key, local }) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          value: local,
          dirty: true,
          baseline: { alpha: 1, beta: { x: 2, y: 3 } },
        }),
      ),
    { key, local },
  );
  const { store } = await fixture(page, {
    existingStore: {
      rows: [],
      planner: {},
      gym: { beta: { y: 3, x: 2 }, alpha: 1 },
      logs: [],
    },
  });
  await page.goto("/plataforma/gimnasio");
  await expect(
    page.getByRole("status").filter({ hasText: "Guardado en tu cuenta." }),
  ).toBeVisible();
  expect(store.gym).toEqual(local);
});
test("retry reads remote changes before replaying a failed local write", async ({
  page,
}) => {
  const { store } = await fixture(page, { saveFailure: true });
  await page.goto("/plataforma/gimnasio");
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("status")).toContainText("Sin sincronizar");
  store.gym = { fromAnotherDevice: true };
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Hay cambios distintos");
  expect(store.gym).toEqual({ fromAnotherDevice: true });
});
