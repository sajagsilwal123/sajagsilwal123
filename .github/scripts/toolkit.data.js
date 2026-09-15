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
      { name: "Next.js", icon: "nextjs", size: 24 },
      { name: "PostgreSQL", icon: "postgresql", size: 25 },
      { name: "Redis", icon: "redis", size: 24 }
    ]
  },
  ship: {
    heading: "Ship",
    items: [
      { name: "Docker", icon: "docker", size: 25 },
      { name: "Nginx", icon: "nginx", size: 24 },
      { name: "Linux", icon: "linux", size: 25 },
      { name: "GitHub", icon: "github", size: 24 }
    ]
  },
  also: {
    heading: "Also",
    items: [
      { name: "Java", icon: "java", size: 26 },
      { name: "Python", icon: "python", size: 24 },
      { name: "MongoDB", icon: "mongodb", size: 25 }
    ]
  },
  ai: {
    heading: "AI",
    items: [
      { name: "ChatGPT", icon: "chatgpt", size: 25 },
      { name: "Claude", icon: "claude", size: 25 },
      { name: "Gemini", icon: "gemini", size: 24 },
      { name: "Kimi", icon: "kimi", size: 24 },
      { name: "Qwen", icon: "qwen", size: 24 }
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
      const marginStyle = isLast ? "" : "margin-right:28px;";
      const size = item.size || 24;
      return `  <span style="display:inline-flex;align-items:center;${marginStyle}">\n    <img src="assets/icons/${item.icon}.svg" alt="" width="${size}" height="${size}" valign="middle" />&nbsp;&nbsp;${item.name}\n  </span>`;
    });

    // Join with non-breaking spaces for GitHub markdown rendering resilience
    sections.push(itemSpans.join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n"));
    sections.push("</p>\n");

    if (groupKey !== Object.keys(data)[Object.keys(data).length - 1]) {
      sections.push("<br>\n");
    }
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
      const size = item.size || 24;
      const styleAttr = size !== 24 ? ` style="width: ${size}px; height: ${size}px;"` : "";
      sections.push('    <div class="toolkit-item">');
      sections.push(`      <span class="toolkit-icon"><img src="assets/icons/${item.icon}.svg"${styleAttr} alt="" aria-hidden="true" /></span>`);
      sections.push(`      <span>${item.name}</span>`);
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
