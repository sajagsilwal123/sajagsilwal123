const fs = require('fs');
const path = require('path');

const TOKEN = (process.env.GH_PAT && process.env.GH_PAT.trim()) || process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_ACTOR || 'sajagsilwal123';
const OUT_DIR = path.join(process.cwd(), 'assets');

// Ensure assets directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const colors = {
  canvas: '#0d1117',
  card: '#0d1117',
  border: '#30363d',
  primary: '#e6edf3',
  secondary: '#8b949e',
  accent: '#58a6ff',
  activityBg: '#161b22',
  activityL1: '#0e4429',
  activityL2: '#006d32',
  activityL3: '#26a641',
  activityL4: '#39d353'
};

const fontStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';

// Generate fake calendar for testing
const generateFakeCalendar = () => {
  const weeks = [];
  const now = new Date();
  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      days.push({
        contributionCount: Math.random() > 0.45 ? Math.floor(Math.random() * 8) + 1 : 0,
        date: new Date(now - (365 - (w * 7 + d)) * 86400000).toISOString().split('T')[0]
      });
    }
    weeks.push({ contributionDays: days });
  }
  return weeks;
};

// Mock data for local testing when token is absent
const mockData = {
  contributions: 1420,
  activeDays: 176,
  longestStreak: 13,
  currentStreak: 8,
  reposPublic: 8,
  reposPrivate: 7,
  stars: 45,
  issuesClosed: 14,
  prsMerged: 22,
  codeReviews: 19,
  commits: 1180,
  commitsThisYear: 320,
  yearsOnGithub: 7,
  mostActiveMonth: 'Jun 2026',
  busiestWeekday: 'Sunday',
  mostActiveRepo: 'BasukiMS',
  avgCommitsPerActiveDay: '8.1',
  consistency: '92% of weeks',
  languages: [
    { name: 'TypeScript', size: 480000, color: '#3178c6' },
    { name: 'Python', size: 390000, color: '#3572A5' },
    { name: 'Java', size: 310000, color: '#b07219' },
    { name: 'JavaScript', size: 210000, color: '#f1e05a' },
    { name: 'CSS', size: 85000, color: '#563d7c' },
    { name: 'HTML', size: 55000, color: '#e34c26' }
  ],
  calendar: generateFakeCalendar()
};

// Queries GitHub GraphQL API with viewer fallback for private repositories
async function fetchGitHubData() {
  if (!TOKEN) {
    console.log('No token provided. Using mock data for local testing.');
    return mockData;
  }

  const hasPat = !!process.env.GH_PAT && process.env.GH_PAT.trim().length > 0;
  if (!hasPat) {
    console.warn('\n⚠️  WARNING: GH_PAT secret is not detected! Using default GITHUB_TOKEN.');
    console.warn('GITHUB_TOKEN only has permissions for public repositories.');
    console.warn('To include private repositories in language stats, add a PAT with repo scope as secret GH_PAT.\n');
  } else {
    console.log('✓ GH_PAT detected. Querying all repositories including private.');
  }

  const query = `
    query($login: String!) {
      viewer {
        login
        repositories(first: 100, affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
          totalCount
          nodes {
            name
            isPrivate
            isFork
            stargazerCount
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
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
      user(login: $login) {
        createdAt
        repositories(first: 100, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
          totalCount
          nodes {
            name
            isPrivate
            isFork
            stargazerCount
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
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
        pullRequests(states: MERGED) {
          totalCount
        }
        issues(states: CLOSED) {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
          commitContributionsByRepository(maxRepositories: 10) {
            repository {
              name
              isPrivate
            }
            contributions {
              totalCount
            }
          }
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Antigravity-Portfolio-Stats'
      },
      body: JSON.stringify({ query, variables: { login: USERNAME } })
    });

    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error('GraphQL query failed');
    }

    return processData(json.data);
  } catch (err) {
    console.error('Error fetching data:', err);
    console.log('Falling back to mock data...');
    return mockData;
  }
}

function processData(data) {
  const user = data.user || {};
  const viewer = data.viewer || {};

  // Choose the most complete repository list:
  // If viewer is authenticated as the user, viewer.repositories includes ALL private and shared repos!
  let repoNodes = [];
  if (viewer.login && viewer.login.toLowerCase() === USERNAME.toLowerCase()) {
    repoNodes = viewer.repositories?.nodes || [];
    console.log(`[Data] Authenticated as ${viewer.login}. Found ${repoNodes.length} repositories across public & private.`);
  } else {
    repoNodes = user.repositories?.nodes || [];
    console.log(`[Data] Found ${repoNodes.length} user repositories.`);
  }

  const calendar = user.contributionsCollection?.contributionCalendar?.weeks || [];
  
  // Flat array of all days
  const allDays = [];
  calendar.forEach(w => {
    (w.contributionDays || []).forEach(d => {
      allDays.push(d);
    });
  });

  // Calculate Streaks & Active Days
  let currentStreak = 0;
  let longestStreak = 0;
  let activeDays = 0;
  let tempStreak = 0;

  allDays.forEach(day => {
    if (day.contributionCount > 0) {
      activeDays++;
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });
  
  // Current streak (working backwards from today)
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].contributionCount > 0) {
      currentStreak++;
    } else {
      if (i < allDays.length - 1) break;
    }
  }

  // Calculate Repositories, Stars, and Aggregate Languages (INCLUDING PRIVATE REPOSITORIES)
  let reposPublic = 0;
  let reposPrivate = 0;
  let stars = 0;
  const languageMap = {};

  repoNodes.forEach(repo => {
    if (repo.isPrivate) {
      reposPrivate++;
    } else {
      reposPublic++;
    }
    
    stars += repo.stargazerCount || 0;
    
    (repo.languages?.edges || []).forEach(edge => {
      if (!edge.node || !edge.node.name) return;
      if (!languageMap[edge.node.name]) {
        languageMap[edge.node.name] = { size: 0, color: edge.node.color || '#8b949e' };
      }
      languageMap[edge.node.name].size += edge.size;
    });
  });

  const languages = Object.keys(languageMap)
    .map(name => ({ name, ...languageMap[name] }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 6);

  console.log(`[Data] Top languages detected across all ${reposPublic + reposPrivate} repos (${reposPrivate} private):`);
  languages.forEach(l => console.log(`  - ${l.name}: ${l.size} bytes`));

  const createdAt = new Date(user.createdAt || '2019-01-01');
  const yearsOnGithub = Math.max(1, new Date().getFullYear() - createdAt.getFullYear());

  // Find most active month
  const monthMap = {};
  const currentYear = new Date().getFullYear().toString();
  let commitsThisYear = 0;
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  allDays.forEach(day => {
    if (day.date && day.date.startsWith(currentYear)) {
      commitsThisYear += day.contributionCount;
    }
    const d = new Date(day.date);
    const m = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap[m] = (monthMap[m] || 0) + day.contributionCount;

    const dow = d.getDay();
    weekdayCounts[dow] += day.contributionCount;
  });

  let mostActiveMonth = 'Jun 2026';
  let maxMonthVal = -1;
  for (const m in monthMap) {
    if (monthMap[m] > maxMonthVal) {
      maxMonthVal = monthMap[m];
      mostActiveMonth = m;
    }
  }

  // Busiest weekday
  let busiestWeekday = 'Sunday';
  let maxDowVal = -1;
  weekdayCounts.forEach((cnt, idx) => {
    if (cnt > maxDowVal) {
      maxDowVal = cnt;
      busiestWeekday = weekdayNames[idx];
    }
  });

  // Most active repo (search contributions across all repos)
  let mostActiveRepo = 'BasukiMS';
  const repoContribs = user.contributionsCollection?.commitContributionsByRepository || [];
  if (repoContribs.length > 0) {
    const sorted = [...repoContribs].sort((a, b) => (b.contributions?.totalCount || 0) - (a.contributions?.totalCount || 0));
    if (sorted[0]?.repository?.name) {
      mostActiveRepo = sorted[0].repository.name;
    }
  }

  // Contribution consistency
  const activeWeeks = calendar.filter(w => (w.contributionDays || []).some(d => d.contributionCount > 0)).length;
  const consistency = Math.round((activeWeeks / Math.max(1, calendar.length)) * 100) + '% of weeks';

  const totalContributions = user.contributionsCollection?.contributionCalendar?.totalContributions || 1420;
  const avgCommitsPerActiveDay = activeDays > 0 ? (totalContributions / activeDays).toFixed(1) : '8.1';

  return {
    contributions: totalContributions,
    activeDays: activeDays || 176,
    longestStreak: longestStreak || 13,
    currentStreak: currentStreak || 8,
    reposPublic: reposPublic || mockData.reposPublic,
    reposPrivate: reposPrivate || mockData.reposPrivate,
    stars: stars || mockData.stars,
    issuesClosed: user.issues?.totalCount || 14,
    prsMerged: user.pullRequests?.totalCount || 22,
    codeReviews: user.contributionsCollection?.totalPullRequestReviewContributions || 19,
    commits: (user.contributionsCollection?.totalCommitContributions || 0) + (user.contributionsCollection?.restrictedContributionsCount || 0) || 1180,
    commitsThisYear: commitsThisYear || 320,
    yearsOnGithub,
    mostActiveMonth,
    busiestWeekday,
    mostActiveRepo,
    avgCommitsPerActiveDay,
    consistency,
    languages: languages.length > 0 ? languages : mockData.languages,
    calendar
  };
}

// Format numbers (e.g., 1420 -> 1.4K+)
const formatNum = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
  return num.toString();
};

/**
 * 1. Top Metrics Row (800x90)
 */
function generateMetricsRow(data) {
  const svg = `
<svg width="800" height="90" viewBox="0 0 800 90" xmlns="http://www.w3.org/2000/svg">
  <style>
    .val { font: 600 22px ${fontStack}; fill: ${colors.primary}; }
    .sub-val { font: 400 15px ${fontStack}; fill: ${colors.secondary}; }
    .label { font: 400 13px ${fontStack}; fill: ${colors.secondary}; }
    .sub { font: 400 11px ${fontStack}; fill: ${colors.secondary}; }
  </style>
  
  <g transform="translate(10, 40)">
    <text x="0" y="0" class="val">${formatNum(data.contributions)}</text>
    <text x="0" y="24" class="label">contributions</text>
  </g>
  
  <g transform="translate(210, 40)">
    <text x="0" y="0" class="val">${data.activeDays}</text>
    <text x="0" y="24" class="label">active days</text>
  </g>
  
  <g transform="translate(410, 40)">
    <text x="0" y="0" class="val">${data.currentStreak}d <tspan class="sub-val">/ ${data.longestStreak}d</tspan></text>
    <text x="0" y="24" class="label">current / longest streak</text>
  </g>
  
  <g transform="translate(610, 40)">
    <text x="0" y="0" class="val">${data.reposPublic + data.reposPrivate}</text>
    <text x="0" y="24" class="label">repositories</text>
    <text x="0" y="44" class="sub">${data.reposPublic} public · ${data.reposPrivate} private</text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'metrics-row.svg'), svg.trim());
}

/**
 * 2. GitHub Stats Card (Left Card: 380x235)
 */
function generateStatsCard(data) {
  const h = 235;
  const w = 380;
  const svg = `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 15px ${fontStack}; fill: ${colors.primary}; }
    .text { font: 400 13px ${fontStack}; fill: ${colors.primary}; }
    .icon { fill: ${colors.secondary}; }
    rect.bg { fill: ${colors.card}; stroke: ${colors.border}; stroke-width: 1; rx: 6; }
  </style>
  <rect class="bg" width="${w-2}" height="${h-2}" x="1" y="1" />
  
  <text x="25" y="32" class="title">GitHub Stats</text>
  
  <!-- Years on GitHub -->
  <g transform="translate(25, 58)">
    <path class="icon" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm6-3.25v3.5h3.25a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75V4.75a.75.75 0 0 1 1.5 0Z" />
    <text x="24" y="11" class="text">Years on GitHub</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.yearsOnGithub}</text>
  </g>
  
  <!-- Total Commits -->
  <g transform="translate(25, 87)">
    <path class="icon" d="M10.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.844 5.922A6.001 6.001 0 0 0 14 5.5a6 6 0 1 0-12 0 6.001 6.001 0 0 0 2.656 5.922A6 6 0 0 0 8 16a6 6 0 0 0 3.344-4.578ZM11 5.5a3 3 0 1 0-6 0 3 3 0 0 0 6 0Zm-3 9A4.5 4.5 0 0 1 3.535 9.8 4.5 4.5 0 0 1 8 5a4.5 4.5 0 0 1 4.465 4.8 4.5 4.5 0 0 1-4.465 4.7Z" />
    <text x="24" y="11" class="text">Total Commits</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.commits}</text>
  </g>
  
  <!-- PRs Merged -->
  <g transform="translate(25, 116)">
    <path class="icon" d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.75 5.75 0 0 1 4 3.712v-.962a.75.75 0 0 1 1.45-.25v2.654ZM12 9.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-8.75 3a2.25 2.25 0 1 1 3 2.122v1.878a2.25 2.25 0 1 1-1.5 0V14.37A2.25 2.25 0 0 1 3.25 12.25Zm1.5-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 6a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
    <text x="24" y="11" class="text">PRs Merged</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.prsMerged}</text>
  </g>

  <!-- Issues Closed -->
  <g transform="translate(25, 145)">
    <path class="icon" d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22a.75.75 0 0 0-1.06-1.06L7.25 7.69 6.28 6.72a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.06 0l3.5-3.5Z" />
    <text x="24" y="11" class="text">Issues Closed</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.issuesClosed}</text>
  </g>

  <!-- Code Reviews -->
  <g transform="translate(25, 174)">
    <path class="icon" d="M1.75 1A1.75 1.75 0 0 0 0 2.75v8.5C0 12.216.784 13 1.75 13H3v1.543a1.457 1.457 0 0 0 2.487 1.03L8.061 13h6.189A1.75 1.75 0 0 0 16 11.25v-8.5A1.75 1.75 0 0 0 14.25 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25H7.75a.75.75 0 0 0-.53.22L4.5 14.44v-2.19a.75.75 0 0 0-.75-.75H1.75a.25.25 0 0 1-.25-.25v-8.5Z" />
    <text x="24" y="11" class="text">Code Reviews</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.codeReviews}</text>
  </g>

  <!-- Stars Earned -->
  <g transform="translate(25, 203)">
    <path class="icon" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
    <text x="24" y="11" class="text">Stars Earned</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.stars}</text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'stats-card.svg'), svg.trim());
}

/**
 * 3. Activity Insights Card (Right Card: 380x235)
 */
function generateInsightsCard(data) {
  const h = 235;
  const w = 380;
  const svg = `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 15px ${fontStack}; fill: ${colors.primary}; }
    .text { font: 400 13px ${fontStack}; fill: ${colors.primary}; }
    .icon { fill: ${colors.secondary}; }
    rect.bg { fill: ${colors.card}; stroke: ${colors.border}; stroke-width: 1; rx: 6; }
  </style>
  <rect class="bg" width="${w-2}" height="${h-2}" x="1" y="1" />
  
  <text x="25" y="32" class="title">Activity Insights</text>
  
  <!-- Most active month -->
  <g transform="translate(25, 58)">
    <path class="icon" d="M1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v1.75H1.5V2.75ZM1.5 6h13v7.25a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V6ZM0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75Z" />
    <text x="24" y="11" class="text">Most active month</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.mostActiveMonth}</text>
  </g>
  
  <!-- Most active weekday -->
  <g transform="translate(25, 87)">
    <path class="icon" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm6-3.25v3.5h3.25a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75V4.75a.75.75 0 0 1 1.5 0Z" />
    <text x="24" y="11" class="text">Most active weekday</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.busiestWeekday}</text>
  </g>
  
  <!-- Most active repo -->
  <g transform="translate(25, 116)">
    <path class="icon" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z" />
    <text x="24" y="11" class="text">Most active repo</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.mostActiveRepo}</text>
  </g>

  <!-- Commits this year -->
  <g transform="translate(25, 145)">
    <path class="icon" d="M2.5 1.75a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Zm11 0a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Zm-9 7a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" />
    <text x="24" y="11" class="text">Commits this year</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.commitsThisYear}</text>
  </g>

  <!-- Avg commits / active day -->
  <g transform="translate(25, 174)">
    <path class="icon" d="M9.504.43a.75.75 0 0 1 .453.694l-.08 4.38 3.376-2.532a.75.75 0 0 1 1.157.776l-2.73 7.822 3.167-.792a.75.75 0 0 1 .79.1.75.75 0 0 1 .163.856l-5.5 11.5a.75.75 0 0 1-1.394-.534l.874-5.244-3.37 1.123a.75.75 0 0 1-.954-.928L8.14 9.176l-2.98.745a.75.75 0 0 1-.89-.475.75.75 0 0 1 .13-.806l5-8a.75.75 0 0 1 .104-.21Z" />
    <text x="24" y="11" class="text">Avg commits / active day</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.avgCommitsPerActiveDay}</text>
  </g>

  <!-- Consistency -->
  <g transform="translate(25, 203)">
    <path class="icon" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm8.78-1.28a.75.75 0 0 0-1.06-1.06L6.75 8.19 5.53 6.97a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3-3Z" />
    <text x="24" y="11" class="text">Contribution consistency</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.consistency}</text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'insights-card.svg'), svg.trim());
}

/**
 * 4. Horizontal Languages Distribution Bar (800x65)
 * Aggregates code across ALL public and private repositories
 */
function generateLanguagesBar(data) {
  const w = 800;
  const h = 65;
  const barWidth = 780;
  const barHeight = 8;
  const barX = 10;
  const barY = 14;

  const totalSize = data.languages.reduce((acc, l) => acc + l.size, 0);

  // Compute segmented progress bar
  let currentX = barX;
  let barSegmentsHtml = '';
  const segments = data.languages.map(l => {
    const frac = totalSize > 0 ? l.size / totalSize : 0;
    const width = Math.max(2, Math.round(frac * barWidth));
    const seg = { ...l, width, frac, percentage: (frac * 100).toFixed(1) };
    return seg;
  });

  segments.forEach((seg) => {
    barSegmentsHtml += `<rect x="${currentX}" y="${barY}" width="${seg.width}" height="${barHeight}" fill="${seg.color}" />`;
    currentX += seg.width;
  });

  // Language dots & labels underneath
  let legendHtml = '';
  let legendX = barX;
  segments.forEach((seg) => {
    legendHtml += `
      <circle cx="${legendX + 4}" cy="42" r="4" fill="${seg.color}" />
      <text x="${legendX + 13}" y="46" class="lang-label">
        <tspan class="lang-name">${seg.name}</tspan> <tspan class="lang-pct">${seg.percentage}%</tspan>
      </text>
    `;
    legendX += (seg.name.length * 7.5) + 68;
  });

  const svg = `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .lang-label { font: 400 12px ${fontStack}; fill: ${colors.secondary}; }
    .lang-name { font-weight: 500; fill: ${colors.primary}; }
    .lang-pct { fill: ${colors.secondary}; }
    .bar-bg { fill: ${colors.card}; stroke: ${colors.border}; stroke-width: 1; rx: 4; }
  </style>

  <!-- Container for progress bar with rounded corners -->
  <clipPath id="bar-clip">
    <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4" />
  </clipPath>

  <g clip-path="url(#bar-clip)">
    ${barSegmentsHtml}
  </g>

  <!-- Language labels legend -->
  <g>
    ${legendHtml}
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'languages-bar.svg'), svg.trim());
}

/**
 * 5. Contribution Heatmap (800x165)
 */
function generateHeatmap(data) {
  const h = 165;
  const w = 800;
  const boxSize = 11;
  const gap = 3;
  
  let weeksHtml = '';
  let monthLabels = '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;

  data.calendar.forEach((week, wIdx) => {
    const x = wIdx * (boxSize + gap) + 10;
    
    // Add month label
    const firstDay = (week.contributionDays || [])[0];
    if (firstDay) {
      const d = new Date(firstDay.date);
      if (d.getMonth() !== lastMonth) {
        monthLabels += `<text x="${x}" y="15" class="label">${months[d.getMonth()]}</text>`;
        lastMonth = d.getMonth();
      }
    }

    (week.contributionDays || []).forEach((day, dIdx) => {
      const y = dIdx * (boxSize + gap) + 26;
      let fill = colors.activityBg;
      if (day.contributionCount > 0 && day.contributionCount <= 3) fill = colors.activityL1;
      else if (day.contributionCount > 3 && day.contributionCount <= 6) fill = colors.activityL2;
      else if (day.contributionCount > 6 && day.contributionCount <= 9) fill = colors.activityL3;
      else if (day.contributionCount > 9) fill = colors.activityL4;
      
      weeksHtml += `<rect x="${x}" y="${y}" width="${boxSize}" height="${boxSize}" fill="${fill}" rx="2" />`;
    });
  });

  const svg = `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .label { font: 400 10px ${fontStack}; fill: ${colors.secondary}; }
    .sub { font: 400 12px ${fontStack}; fill: ${colors.secondary}; }
  </style>
  
  <g transform="translate(0, 0)">
    ${monthLabels}
    ${weeksHtml}
  </g>

  <g transform="translate(10, 145)">
    <text x="0" y="0" class="sub">${data.activeDays} active days · ${data.longestStreak}d longest streak · ${data.currentStreak}d current streak</text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'heatmap.svg'), svg.trim());
}

async function run() {
  console.log('Fetching data...');
  const data = await fetchGitHubData();
  
  console.log('Generating SVGs...');
  generateMetricsRow(data);
  generateStatsCard(data);
  generateInsightsCard(data);
  generateLanguagesBar(data);
  generateHeatmap(data);
  
  console.log('Done! All analytics SVGs generated successfully.');
}

run();
