/**
 * Repositories Module
 * Fetches all owned public and private repositories using authenticated GraphQL.
 * Handles pagination and language size extraction.
 */

const { queryGraphQL, getUsername } = require('./client');

/**
 * Fetches all repositories owned by the user (both public and private).
 * Paginates through all pages so no repository is omitted.
 */
async function fetchAllOwnedRepositories() {
  const username = getUsername();
  let allRepos = [];
  let hasNextPage = true;
  let endCursor = null;

  // First, check if the authenticated token belongs to the user via viewer
  const viewerQuery = `
    query($after: String) {
      viewer {
        login
        repositories(
          first: 100,
          affiliations: [OWNER],
          isFork: false,
          orderBy: { field: PUSHED_AT, direction: DESC },
          after: $after
        ) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            name
            isPrivate
            isFork
            stargazerCount
            languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    while (hasNextPage) {
      const data = await queryGraphQL(viewerQuery, { after: endCursor });
      const viewer = data.viewer || {};

      // If viewer is the user, viewer.repositories gives access to all public + private owned repos
      if (viewer.login && viewer.login.toLowerCase() === username.toLowerCase()) {
        const repoData = viewer.repositories;
        const nodes = repoData.nodes || [];
        allRepos.push(...nodes);
        hasNextPage = repoData.pageInfo?.hasNextPage || false;
        endCursor = repoData.pageInfo?.endCursor || null;
      } else {
        // Authenticated as a bot or different account (e.g. default GITHUB_TOKEN)
        console.warn(`[Repositories] Authenticated as '${viewer.login || 'unknown'}', not '${username}'.`);
        console.warn(`[Repositories] To include private repositories, configure secret GH_PAT with repo scope.`);
        return await fetchUserRepositoriesFallback(username);
      }
    }
  } catch (err) {
    console.warn(`[Repositories] Viewer query encountered error: ${err.message}. Trying user query fallback.`);
    return await fetchUserRepositoriesFallback(username);
  }

  return normalizeRepositories(allRepos);
}

/**
 * Fallback when querying as user(login: $login)
 */
async function fetchUserRepositoriesFallback(username) {
  let allRepos = [];
  let hasNextPage = true;
  let endCursor = null;

  const userQuery = `
    query($login: String!, $after: String) {
      user(login: $login) {
        repositories(
          first: 100,
          ownerAffiliations: [OWNER],
          isFork: false,
          orderBy: { field: PUSHED_AT, direction: DESC },
          after: $after
        ) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            name
            isPrivate
            isFork
            stargazerCount
            languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await queryGraphQL(userQuery, { login: username, after: endCursor });
    const user = data.user || {};
    const repoData = user.repositories;
    if (!repoData) break;
    allRepos.push(...(repoData.nodes || []));
    hasNextPage = repoData.pageInfo?.hasNextPage || false;
    endCursor = repoData.pageInfo?.endCursor || null;
  }

  return normalizeRepositories(allRepos);
}

/**
 * Cleans and normalizes repository objects
 */
function normalizeRepositories(nodes) {
  const publicRepos = [];
  const privateRepos = [];
  let totalStars = 0;

  for (const node of nodes) {
    const languages = (node.languages?.edges || []).map(edge => ({
      name: edge.node?.name || '',
      color: edge.node?.color || '#8b949e',
      size: edge.size || 0
    })).filter(l => l.name && l.size > 0);

    const repo = {
      name: node.name,
      isPrivate: !!node.isPrivate,
      isFork: !!node.isFork,
      stargazerCount: node.stargazerCount || 0,
      languages
    };

    totalStars += repo.stargazerCount;

    if (repo.isPrivate) {
      privateRepos.push(repo);
    } else {
      publicRepos.push(repo);
    }
  }

  return {
    publicRepos,
    privateRepos,
    totalRepositories: publicRepos.length + privateRepos.length,
    publicRepositories: publicRepos.length,
    privateRepositories: privateRepos.length,
    totalStars
  };
}

module.exports = {
  fetchAllOwnedRepositories
};
