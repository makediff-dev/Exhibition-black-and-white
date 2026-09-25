import test from "node:test";
import assert from "node:assert/strict";
import { currentReturnPath, loginHref, parseRegisterRole, registerHref, sanitizeReturnUrl } from "./session.ts";

test("sanitizeReturnUrl keeps internal paths and rejects open redirects", () => {
  assert.equal(sanitizeReturnUrl("/account/customer"), "/account/customer");
  assert.equal(sanitizeReturnUrl("/deals/deal-1?from=messages"), "/deals/deal-1?from=messages");
  assert.equal(
    sanitizeReturnUrl("/account/organizer/edit-event?id=evt-1&tab=bookings"),
    "/account/organizer/edit-event?id=evt-1&tab=bookings"
  );
  assert.equal(sanitizeReturnUrl("/events/evt-1#schedule"), "/events/evt-1#schedule");
  assert.equal(sanitizeReturnUrl("//evil.example"), null);
  assert.equal(sanitizeReturnUrl("https://evil.example"), null);
  assert.equal(sanitizeReturnUrl("/login?next=/account"), null);
});

test("loginHref preserves edit-event id and tab after logout", () => {
  const dest = currentReturnPath("/account/organizer/edit-event", "?id=evt-1&tab=bookings");
  assert.equal(
    loginHref(dest),
    "/login?returnUrl=%2Faccount%2Forganizer%2Fedit-event%3Fid%3Devt-1%26tab%3Dbookings"
  );
});

test("parseRegisterRole accepts only product roles", () => {
  assert.equal(parseRegisterRole("contractor"), "contractor");
  assert.equal(parseRegisterRole("admin"), undefined);
});

test("registerHref keeps intended role and return path", () => {
  assert.equal(registerHref("venue", "/venues/expo"), "/register?role=venue&returnUrl=%2Fvenues%2Fexpo");
});
