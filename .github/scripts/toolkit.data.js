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
 * Generates the GitHub Markdown representation for README.md
 * Uses clean, robust 2-column tables per category with optical icon sizing.
 * Ensures predictable, stable rendering on both desktop and mobile GitHub.
 */
function renderMarkdown(data = toolkitData) {
  const sections = [];
  sections.push("## 03 / Toolkit\n");

  const groups = [data.build, data.ship, data.deploy, data.also, data.ai];
  for (const group of groups) {
    sections.push(`<p><strong>${group.heading}</strong></p>\n`);
    sections.push('<table width="100%">');

    for (let i = 0; i < group.items.length; i += 2) {
      const left = group.items[i];
      const right = group.items[i + 1];

      const leftSize = left.size || 24;
      const leftCell = `<td width="50%"><img src="assets/icons/${left.icon}.svg" alt="" width="${leftSize}" height="${leftSize}" align="absmiddle" />&nbsp;&nbsp;${left.name}</td>`;

      let rightCell = '<td width="50%">&nbsp;</td>';
      if (right) {
        const rightSize = right.size || 24;
        rightCell = `<td width="50%"><img src="assets/icons/${right.icon}.svg" alt="" width="${rightSize}" height="${rightSize}" align="absmiddle" />&nbsp;&nbsp;${right.name}</td>`;
      }

      sections.push("  <tr>");
      sections.push(`    ${leftCell}\n    ${rightCell}`);
      sections.push("  </tr>");
    }

    sections.push("</table>\n");
  }

  return sections.join("\n").trim();
}

/**
 * Generates the semantic HTML representation for preview / web interfaces
 * Uses the responsive 2-column CSS Grid layout for desktop, explicitly collapsing on mobile.
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
