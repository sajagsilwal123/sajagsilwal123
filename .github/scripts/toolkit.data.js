/**
 * Toolkit Data Structure & Generators
 * Provides a single source of truth for the 03 / Toolkit section across README.md and preview templates.
 */

const toolkitData = {
  build: {
    heading: "Build",
    items: [
      { name: "TypeScript", icon: "typescript", size: 24 },
      { name: "Node.js", icon: "nodejs", size: 24 },
      { name: "Next.js", icon: "nextjs", size: 22 },
      { name: "PostgreSQL", icon: "postgresql", size: 25 },
      { name: "Redis", icon: "redis", size: 24 }
    ]
  },
  ship: {
    heading: "Ship",
    items: [
      { name: "Docker", icon: "docker", size: 25 },
      { name: "Nginx", icon: "nginx", size: 24 },
      { name: "Linux", icon: "linux", size: 24 },
      { name: "GitHub", icon: "github", size: 22 }
    ]
  },
  deploy: {
    heading: "Deployment & Cloud",
    items: [
      { name: "DigitalOcean", icon: "digitalocean", size: 24 },
      { name: "Vercel", icon: "vercel", size: 22 },
      { name: "AWS", icon: "aws", size: 24 }
    ]
  },
  also: {
    heading: "Also",
    items: [
      { name: "Java", icon: "java", size: 25 },
      { name: "Python", icon: "python", size: 24 },
      { name: "MongoDB", icon: "mongodb", size: 25 }
    ]
  },
  ai: {
    heading: "AI",
    items: [
      { name: "ChatGPT", icon: "chatgpt", size: 24 },
      { name: "Claude", icon: "claude", size: 25 },
      { name: "Gemini", icon: "gemini", size: 24 },
      { name: "Kimi", icon: "kimi", size: 22 },
      { name: "Qwen", icon: "qwen", size: 24 }
    ]
  }
};

/**
 * Helper to render a 2-column compact category table for GitHub Markdown
 */
function renderCategoryTable(group, align = "left", width = "48%") {
  const rows = [];
  rows.push(`<table align="${align}" width="${width}">`);
  rows.push(`  <thead>\n    <tr>\n      <th colspan="2" align="left">${group.heading}</th>\n    </tr>\n  </thead>`);
  rows.push('  <tbody>');

  for (let i = 0; i < group.items.length; i += 2) {
    const left = group.items[i];
    const right = group.items[i + 1];

    const leftCell = `<td width="50%" nowrap><img src="assets/icons/${left.icon}.svg" alt="" width="24" height="24" align="absmiddle" />&nbsp;&nbsp;${left.name}</td>`;
    const rightCell = right
      ? `<td width="50%" nowrap><img src="assets/icons/${right.icon}.svg" alt="" width="24" height="24" align="absmiddle" />&nbsp;&nbsp;${right.name}</td>`
      : '<td width="50%">&nbsp;</td>';

    rows.push('    <tr>');
    rows.push(`      ${leftCell}\n      ${rightCell}`);
    rows.push('    </tr>');
  }

  rows.push('  </tbody>');
  rows.push('</table>');
  return rows.join('\n');
}

/**
 * Generates the GitHub Markdown representation for README.md
 * Desktop: Build & Ship side-by-side, Deployment & Cloud & Also side-by-side, AI full width.
 * Mobile: Naturally flows vertically in single column without card compression.
 */
function renderMarkdown(data = toolkitData) {
  const sections = [];
  sections.push("## 03 / Toolkit\n");

  // Row 1: Build & Ship
  sections.push(renderCategoryTable(data.build, "left", "48%"));
  sections.push(renderCategoryTable(data.ship, "right", "48%"));
  sections.push('<br clear="all" />\n');

  // Row 2: Deployment & Cloud & Also
  sections.push(renderCategoryTable(data.deploy, "left", "48%"));
  sections.push(renderCategoryTable(data.also, "right", "48%"));
  sections.push('<br clear="all" />\n');

  // Row 3: AI (5 items in 1 row)
  sections.push('<table width="100%">');
  sections.push('  <thead>\n    <tr>\n      <th colspan="5" align="left">AI</th>\n    </tr>\n  </thead>');
  sections.push('  <tbody>\n    <tr>');
  for (const item of data.ai.items) {
    sections.push(`      <td width="20%" nowrap><img src="assets/icons/${item.icon}.svg" alt="" width="24" height="24" align="absmiddle" />&nbsp;&nbsp;${item.name}</td>`);
  }
  sections.push('    </tr>\n  </tbody>\n</table>\n');

  return sections.join("\n").trim();
}

/**
 * Generates the semantic HTML representation for preview / web interfaces
 * Matches the reference mockup styling and layout.
 */
function renderHtml(data = toolkitData) {
  const sections = [];
  sections.push('<section class="toolkit-section">');
  sections.push('  <header class="toolkit-header">');
  sections.push('    <h2 class="toolkit-title">03 / Toolkit</h2>');
  sections.push('    <div class="toolkit-divider"></div>');
  sections.push('    <p class="toolkit-description">Technologies I use to build, ship, and explore.</p>');
  sections.push('  </header>');
  sections.push('');
  sections.push('  <div class="toolkit-layout">');

  const groups = [
    { key: "build", wide: false },
    { key: "ship", wide: false },
    { key: "deploy", wide: false },
    { key: "also", wide: false },
    { key: "ai", wide: true }
  ];

  for (const { key, wide } of groups) {
    const group = data[key];
    const wideClass = wide ? " toolkit-group--wide" : "";
    sections.push(`    <div class="toolkit-group${wideClass}">`);
    sections.push(`      <h3 class="toolkit-group-title">${group.heading}</h3>`);
    sections.push('      <div class="toolkit-grid">');

    for (const item of group.items) {
      sections.push('        <div class="toolkit-item">');
      sections.push('          <div class="toolkit-icon">');
      sections.push(`            <img src="assets/icons/${item.icon}.svg" alt="">`);
      sections.push('          </div>');
      sections.push(`          <span class="toolkit-item-name">${item.name}</span>`);
      sections.push('        </div>');
    }

    sections.push('      </div>');
    sections.push('    </div>');
    sections.push('');
  }

  sections.push('  </div>');
  sections.push('</section>');
  return sections.join("\n").trim();
}

module.exports = {
  toolkitData,
  renderMarkdown,
  renderHtml
};
