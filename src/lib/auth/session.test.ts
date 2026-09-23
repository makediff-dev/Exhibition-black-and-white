import test from "node:test";
import assert from "node:assert/strict";
import { parseRegisterRole, registerHref, sanitizeReturnUrl } from "./session.ts";

test("sanitizeReturnUrl keeps internal paths and rejects open redirects", () => {
  assert.equal(sanitizeReturnUrl("/account/customer"), "/account/customer");
  assert.equal(sanitizeReturnUrl("/deals/deal-1?from=messages"), "/deals/deal-1?from=messages");
  assert.equal(sanitizeReturnUrl("//evil.example"), null);
  assert.equal(sanitizeReturnUrl("https://evil.example"), null);
  assert.equal(sanitizeReturnUrl("/login?next=/account"), null);
});

test("parseRegisterRole accepts only product roles", () => {
  assert.equal(parseRegisterRole("contractor"), "contractor");
  assert.equal(parseRegisterRole("admin"), undefined);
});

test("registerHref keeps intended role and return path", () => {
  assert.equal(registerHref("venue", "/venues/expo"), "/register?role=venue&returnUrl=%2Fvenues%2Fexpo");
});
