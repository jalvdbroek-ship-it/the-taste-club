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
test("zonder toestemming in de config staat beheer uit op publieke hosts", () => {
  assert.equal(adminAllowed({ beheer: { toegestaanOpElkeHost: false } }, "example.com"), false);
  assert.equal(adminAllowed({}, "example.com"), false);
  assert.equal(adminAllowed({ beheer: { toegestaanOpElkeHost: false } }, "localhost"), true);
});
test("de demo zet beheer bewust open op elke host, met een label dat zegt dat het een demo zonder beveiliging is", () => {
  const { config } = load();
  assert.equal(config.beheer.toegestaanOpElkeHost, true);
  assert.equal(adminAllowed(config, "jalvdbroek-ship-it.github.io"), true);
  assert.match(config.beheer.label, /demo/i);
  assert.match(config.beheer.label, /geen echte beveiliging/i);
  assert.match(config.beheer.label, /dit apparaat/i);
});
