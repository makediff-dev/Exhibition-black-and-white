import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMessagesContextHref,
  canonicalizeEntityId,
  findThreadByContext,
  parseContextSearchParams,
  sameEntityRef,
} from "./entity-ref.ts";
import type { MessageThread } from "../../data/types/index.ts";

test("venue public id and catalog id resolve to one card", () => {
  assert.equal(canonicalizeEntityId("venue", "v-1"), "v-1");
  assert.equal(canonicalizeEntityId("venue", "venue-1"), "v-1");
  assert.equal(
    sameEntityRef({ type: "venue", id: "v-1" }, { type: "venue", id: "venue-1" }),
    true
  );
});

test("parseContextSearchParams reads context and legacy venue query", () => {
  assert.deepEqual(
    parseContextSearchParams(new URLSearchParams("contextType=deal&contextId=deal-1")),
    { type: "deal", id: "deal-1" }
  );
  assert.deepEqual(
    parseContextSearchParams(new URLSearchParams("related=venue&venueId=venue-1")),
    { type: "venue", id: "v-1" }
  );
});

test("deal messages href is a chat route, not the deal page", () => {
  const href = buildMessagesContextHref({ type: "deal", id: "deal-1" });
  assert.equal(href, "/messages?contextType=deal&contextId=deal-1");
  assert.equal(href.includes("/deals/deal-1"), false);
});

test("findThreadByContext matches deal-1 and ignores venue aliases", () => {
  const threads = [
    {
      id: "msg-1",
      contextType: "deal",
      contextId: "deal-1",
      relatedType: "deal",
      relatedId: "deal-1",
    },
    {
      id: "msg-venue-v-1",
      contextType: "venue",
      contextId: "v-1",
      relatedType: "venue",
      relatedId: "v-1",
    },
  ] as MessageThread[];

  assert.equal(findThreadByContext(threads, { type: "deal", id: "deal-1" })?.id, "msg-1");
  assert.equal(findThreadByContext(threads, { type: "venue", id: "venue-1" })?.id, "msg-venue-v-1");
});
