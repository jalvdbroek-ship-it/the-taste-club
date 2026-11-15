import test from "node:test";
import assert from "node:assert/strict";
import { isLocalHost, adminAllowed } from "../src/lib/env.mjs";
import { load } from "./fixtures.mjs";

test("lokale en privenetwerk-hosts mogen het beheerprototype openen", () => {
  for (const h of ["localhost", "127.0.0.1", "192.168.1.20", "10.0.0.5", "172.16.4.2", "172.31.255.1", "taste.local"]) assert.ok(isLocalHost(h), h);
});
test("publieke hosts niet", () => {
  for (const h of ["degoudenkurk.nl", "172.32.0.1", "8.8.8.8", "localhost.evil.com", "", undefined]) assert.ok(!isLocalHost(h), String(h));
});
test("standaard staat beheer uit op publieke hosts, tenzij de config dat bewust toestaat", () => {
  const { config } = load();
  assert.equal(config.beheer.toegestaanOpElkeHost, false);
  assert.equal(adminAllowed(config, "example.com"), false);
  assert.equal(adminAllowed({ beheer: { toegestaanOpElkeHost: true } }, "example.com"), true);
});
