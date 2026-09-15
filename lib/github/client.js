/**
 * Server-Side Authenticated GitHub Client
 * Handles GraphQL and REST communication with GitHub.
 * Protects credentials by reading strictly from server-side environment variables.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env if present in workspace root
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key] && val) {
            process.env[key] = val;
          }
        }
      }
    }
  }
} catch (e) {
  // Ignore file read issues
}

const TOKEN = (process.env.GH_PAT && process.env.GH_PAT.trim()) || 
              (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) || 
              '';

const USERNAME = process.env.GITHUB_USERNAME || process.env.GITHUB_ACTOR || 'sajagsilwal123';

function hasAuthToken() {
  return !!TOKEN && TOKEN.length > 0;
}

function hasPat() {
  return !!process.env.GH_PAT && process.env.GH_PAT.trim().length > 0;
}

function getUsername() {
  return USERNAME;
}

/**
 * Executes an authenticated GraphQL query against api.github.com/graphql
 */
async function queryGraphQL(query, variables = {}) {
  if (!hasAuthToken()) {
    throw new Error('No GitHub token provided. Cannot execute authenticated GraphQL query.');
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'SajagSilwal-Portfolio-StatsEngine'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub GraphQL HTTP error ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map(e => e.message).join('; ');
    throw new Error(`GitHub GraphQL errors: ${messages}`);
  }

  return json.data;
}

/**
 * Executes an authenticated REST query against api.github.com
 */
async function queryRest(endpoint) {
  if (!hasAuthToken()) {
    throw new Error('No GitHub token provided. Cannot execute authenticated REST query.');
  }

  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SajagSilwal-Portfolio-StatsEngine'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub REST HTTP error ${response.status}: ${errorText}`);
  }

  return response.json();
}

module.exports = {
  hasAuthToken,
  hasPat,
  getUsername,
  queryGraphQL,
  queryRest
};
