#!/usr/bin/env node

import crypto from "node:crypto";
import { SITE_URL } from "../src/lib/content-manifest.mjs";

const SCOPE = "https://www.googleapis.com/auth/webmasters";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SITE_PROPERTY = process.env.GSC_SITE_URL || "sc-domain:christianlehman.com";
const SITEMAP_URL = process.env.GSC_SITEMAP_URL || `${SITE_URL}/sitemap.xml`;

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function readServiceAccount() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("Missing GSC_SERVICE_ACCOUNT_JSON.");
  }
  const account = JSON.parse(raw);
  if (!account.client_email || !account.private_key) {
    throw new Error("GSC_SERVICE_ACCOUNT_JSON must include client_email and private_key.");
  }
  return account;
}

async function accessToken(account) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: account.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(account.private_key);
  const assertion = `${unsigned}.${base64Url(signature)}`;
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Google token request failed HTTP ${res.status}: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function submitSitemap(token) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_PROPERTY)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`;
  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google sitemap submit failed HTTP ${res.status}: ${text}`);
  }
}

const account = readServiceAccount();
const token = await accessToken(account);
await submitSitemap(token);
console.log(`Submitted sitemap to Google Search Console: ${SITEMAP_URL} for ${SITE_PROPERTY}`);
