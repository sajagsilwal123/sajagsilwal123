/**
 * Toolkit Data Structure & Generators
 * Provides a single source of truth for the 03 / Toolkit section across README.md and preview templates.
 */

const toolkitData = {
  build: {
    heading: "Build",
    items: [
      { name: "TypeScript", icon: "typescript", size: 28 },
      { name: "Node.js", icon: "nodejs", size: 28 },
      { name: "Next.js", icon: "nextjs", size: 28 },
      { name: "PostgreSQL", icon: "postgresql", size: 29 },
      { name: "Redis", icon: "redis", size: 28 }
    ]
  },
  ship: {
    heading: "Ship",
    items: [
      { name: "Docker", icon: "docker", size: 29 },
      { name: "Nginx", icon: "nginx", size: 28 },
      { name: "Linux", icon: "linux", size: 28 },
      { name: "GitHub", icon: "github", size: 28 }
    ]
  },
  also: {
    heading: "Also",
    items: [
      { name: "Java", icon: "java", size: 29 },
      { name: "Python", icon: "python", size: 28 },
      { name: "MongoDB", icon: "mongodb", size: 29 }
    ]
  },
  ai: {
    heading: "AI",
    items: [
      { name: "ChatGPT", icon: "chatgpt", size: 28 },
      { name: "Claude", icon: "claude", size: 29 },
      { name: "Gemini", icon: "gemini", size: 28 },
      { name: "Kimi", icon: "kimi", size: 28 },
      { name: "Qwen", icon: "qwen", size: 28 }
    ]
  }
};

/**
 * Generates the GitHub Markdown representation for README.md
 */
function renderMarkdown(data = toolkitData) {
  const sections = [];
  sections.push("## 03 / Toolkit\n");

  for (const groupKey of Object.keys(data)) {
    const group = data[groupKey];
    sections.push(`### ${group.heading}\n`);
    sections.push('<p align="left">');

    const itemSpans = group.items.map((item, idx) => {
      const isLast = idx === group.items.length - 1;
      const marginStyle = isLast ? "" : "margin-right:36px;";
      const size = item.size || 28;
      return `  <span style="display:inline-flex;align-items:center;${marginStyle}">\n    <img src="assets/icons/${item.icon}.svg" alt="" width="${size}" height="${size}" valign="middle" />&nbsp;&nbsp;${item.name}\n  </span>`;
    });

    // Join with non-breaking spaces for GitHub markdown rendering resilience
    sections.push(itemSpans.join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n"));
    sections.push("</p>\n");
  }

  return sections.join("\n").trim();
}

/**
 * Generates the semantic HTML representation for preview / web interfaces
 */
function renderHtml(data = toolkitData) {
  const sections = [];

  for (const groupKey of Object.keys(data)) {
    const group = data[groupKey];
    sections.push('<div class="toolkit-group">');
    sections.push(`  <div class="toolkit-heading">${group.heading}</div>`);
    sections.push('  <div class="toolkit-list">');

    for (const item of group.items) {
      const size = item.size || 28;
      sections.push('    <div class="toolkit-item">');
      sections.push(`      <span class="toolkit-icon"><img src="assets/icons/${item.icon}.svg" width="${size}" height="${size}" alt="" aria-hidden="true" /></span>`);
      sections.push(`      <span class="toolkit-name">${item.name}</span>`);
      sections.push('    </div>');
    }

    sections.push('  </div>');
    sections.push('</div>\n');
  }

  return sections.join("\n").trim();
}

module.exports = {
  toolkitData,
  renderMarkdown,
  renderHtml
};
