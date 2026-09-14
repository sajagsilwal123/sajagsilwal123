const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GH_PAT || process.env.GITHUB_TOKEN;
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

// Mock data for local testing when token is absent
const mockData = {
  contributions: 3342,
  activeDays: 218,
  longestStreak: 14,
  currentStreak: 5,
  reposPublic: 8,
  reposPrivate: 12,
  stars: 45,
  issues: 18,
  commits: 2150,
  yearsOnGithub: 7,
  mostActiveMonth: 'June 2026',
  languages: [
    { name: 'TypeScript', size: 450000, color: '#3178c6' },
    { name: 'JavaScript', size: 300000, color: '#f1e05a' },
    { name: 'Java', size: 150000, color: '#b07219' },
    { name: 'Python', size: 80000, color: '#3572A5' }
  ],
  calendar: []
};

// Generate fake calendar for testing
const generateFakeCalendar = () => {
  const weeks = [];
  const now = new Date();
  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      days.push({
        contributionCount: Math.random() > 0.5 ? Math.floor(Math.random() * 10) : 0,
        date: new Date(now - (365 - (w * 7 + d)) * 86400000).toISOString().split('T')[0]
      });
    }
    weeks.push({ contributionDays: days });
  }
  return weeks;
};
if (mockData.calendar.length === 0) mockData.calendar = generateFakeCalendar();

// Queries GitHub GraphQL API
async function fetchGitHubData() {
  if (!TOKEN) {
    console.log('No token provided. Using mock data for local testing.');
    return mockData;
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        createdAt
        repositories(first: 100, ownerAffiliations: OWNER) {
          nodes {
            isPrivate
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
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          restrictedContributionsCount
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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables: { login: USERNAME } })
    });

    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error('GraphQL query failed');
    }

    return processData(json.data.user);
  } catch (err) {
    console.error('Error fetching data:', err);
    console.log('Falling back to mock data...');
    return mockData;
  }
}

function processData(user) {
  const calendar = user.contributionsCollection.contributionCalendar.weeks;
  
  // Calculate Streaks & Active Days
  let currentStreak = 0;
  let longestStreak = 0;
  let activeDays = 0;
  
  // Flat array of all days
  const allDays = [];
  calendar.forEach(w => {
    w.contributionDays.forEach(d => {
      allDays.push(d);
    });
  });

  // Calculate streaks (working forwards)
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
      // If today is 0, check yesterday. If yesterday is 0, streak broken.
      if (i < allDays.length - 1) break;
    }
  }

  // Calculate Repositories
  let reposPublic = 0;
  let reposPrivate = 0;
  let stars = 0;
  const languageMap = {};

  user.repositories.nodes.forEach(repo => {
    if (repo.isPrivate) reposPrivate++;
    else reposPublic++;
    
    stars += repo.stargazerCount;
    
    repo.languages.edges.forEach(edge => {
      if (!languageMap[edge.node.name]) {
        languageMap[edge.node.name] = { size: 0, color: edge.node.color };
      }
      languageMap[edge.node.name].size += edge.size;
    });
  });

  const languages = Object.keys(languageMap)
    .map(name => ({ name, ...languageMap[name] }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  const createdAt = new Date(user.createdAt);
  const yearsOnGithub = Math.max(1, new Date().getFullYear() - createdAt.getFullYear());

  // Find most active month
  const monthMap = {};
  allDays.forEach(day => {
    const d = new Date(day.date);
    const m = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthMap[m] = (monthMap[m] || 0) + day.contributionCount;
  });
  let mostActiveMonth = '';
  let maxMonthVal = -1;
  for (const m in monthMap) {
    if (monthMap[m] > maxMonthVal) {
      maxMonthVal = monthMap[m];
      mostActiveMonth = m;
    }
  }

  return {
    contributions: user.contributionsCollection.contributionCalendar.totalContributions,
    activeDays,
    longestStreak,
    currentStreak,
    reposPublic,
    reposPrivate,
    stars,
    issues: user.contributionsCollection.totalIssueContributions,
    commits: user.contributionsCollection.totalCommitContributions + (user.contributionsCollection.restrictedContributionsCount || 0),
    yearsOnGithub,
    mostActiveMonth,
    languages,
    calendar
  };
}

// Format numbers (e.g., 3342 -> 3.3K+)
const formatNum = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
  return num.toString();
};

function generateMetricsRow(data) {
  const svg = `
<svg width="800" height="90" viewBox="0 0 800 90" xmlns="http://www.w3.org/2000/svg">
  <style>
    .val { font: 600 22px ${fontStack}; fill: ${colors.primary}; }
    .label { font: 400 13px ${fontStack}; fill: ${colors.secondary}; }
    .sub { font: 400 11px ${fontStack}; fill: ${colors.secondary}; }
  </style>
  
  <g transform="translate(10, 40)">
    <text x="0" y="0" class="val">${formatNum(data.contributions)}</text>
    <text x="0" y="24" class="label">contributions</text>
  </g>
  
  <g transform="translate(200, 40)">
    <text x="0" y="0" class="val">${data.activeDays}</text>
    <text x="0" y="24" class="label">active days</text>
  </g>
  
  <g transform="translate(380, 40)">
    <text x="0" y="0" class="val">${data.longestStreak}d</text>
    <text x="0" y="24" class="label">longest streak</text>
  </g>
  
  <g transform="translate(560, 40)">
    <text x="0" y="0" class="val">${data.reposPublic + data.reposPrivate}</text>
    <text x="0" y="24" class="label">repositories</text>
    <text x="0" y="44" class="sub">${data.reposPublic} public · ${data.reposPrivate} private</text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'metrics-row.svg'), svg.trim());
}

function generateStatsCard(data) {
  const h = 180;
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
  
  <text x="25" y="35" class="title">GitHub Stats</text>
  
  <g transform="translate(25, 65)">
    <path class="icon" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm6-3.25v3.5h3.25a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75V4.75a.75.75 0 0 1 1.5 0Z" />
    <text x="25" y="11" class="text">Years on GitHub:</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.yearsOnGithub}</text>
  </g>
  
  <g transform="translate(25, 95)">
    <path class="icon" d="M10.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm.844 5.922A6.001 6.001 0 0 0 14 5.5a6 6 0 1 0-12 0 6.001 6.001 0 0 0 2.656 5.922A6 6 0 0 0 8 16a6 6 0 0 0 3.344-4.578ZM11 5.5a3 3 0 1 0-6 0 3 3 0 0 0 6 0Zm-3 9A4.5 4.5 0 0 1 3.535 9.8 4.5 4.5 0 0 1 8 5a4.5 4.5 0 0 1 4.465 4.8 4.5 4.5 0 0 1-4.465 4.7Z" />
    <text x="25" y="11" class="text">Total Commits:</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.commits}</text>
  </g>
  
  <g transform="translate(25, 125)">
    <path class="icon" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.25 2.25 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.25 2.25 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
    <text x="25" y="11" class="text">Pull Requests:</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.issues}</text>
  </g>

  <g transform="translate(25, 155)">
    <path class="icon" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
    <text x="25" y="11" class="text">Stars Earned:</text>
    <text x="${w-50}" y="11" class="text" text-anchor="end" font-weight="600">${data.stars}</text>
  </g>
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'stats-card.svg'), svg.trim());
}

function generateLanguagesCard(data) {
  const h = 180;
  const w = 380;
  
  let totalSize = data.languages.reduce((acc, l) => acc + l.size, 0);
  
  let langsHtml = '';
  let currentY = 65;
  data.languages.forEach((l, i) => {
    const p = ((l.size / totalSize) * 100).toFixed(1);
    langsHtml += `
      <g transform="translate(25, ${currentY})">
        <circle cx="5" cy="5" r="5" fill="${l.color}" />
        <text x="20" y="10" class="text">${l.name}</text>
        <text x="${w-50}" y="10" class="text" text-anchor="end" font-weight="600">${p}%</text>
      </g>
    `;
    currentY += 25;
  });

  const svg = `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 15px ${fontStack}; fill: ${colors.primary}; }
    .text { font: 400 13px ${fontStack}; fill: ${colors.primary}; }
    rect.bg { fill: ${colors.card}; stroke: ${colors.border}; stroke-width: 1; rx: 6; }
  </style>
  <rect class="bg" width="${w-2}" height="${h-2}" x="1" y="1" />
  
  <text x="25" y="35" class="title">Most Used Languages</text>
  
  ${langsHtml}
</svg>
  `;
  fs.writeFileSync(path.join(OUT_DIR, 'languages-card.svg'), svg.trim());
}

function generateHeatmap(data) {
  const h = 200;
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
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const d = new Date(firstDay.date);
      if (d.getMonth() !== lastMonth) {
        monthLabels += `<text x="${x}" y="15" class="label">${months[d.getMonth()]}</text>`;
        lastMonth = d.getMonth();
      }
    }

    week.contributionDays.forEach((day, dIdx) => {
      // Days are Sun-Sat (0-6). The dIdx is exactly this.
      const y = dIdx * (boxSize + gap) + 30;
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
    .title { font: 600 15px ${fontStack}; fill: ${colors.primary}; }
    .label { font: 400 10px ${fontStack}; fill: ${colors.secondary}; }
    .sub { font: 400 12px ${fontStack}; fill: ${colors.secondary}; }
  </style>
  
  <text x="10" y="30" class="title" style="display:none;">Contribution Activity</text>
  
  <g transform="translate(0, 0)">
    ${monthLabels}
    ${weeksHtml}
  </g>

  <g transform="translate(10, 160)">
    <text x="0" y="0" class="sub">${data.activeDays} active days · ${data.longestStreak} day longest streak</text>
    <text x="0" y="20" class="sub">most active → ${data.mostActiveMonth}</text>
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
  generateLanguagesCard(data);
  generateHeatmap(data);
  
  console.log('Done!');
}

run();
