/**
 * Toolkit Data Structure & Generators
 * Provides a single source of truth for the 03 / Toolkit section across README.md and preview templates.
 */

const toolkitData = {
  build: {
    heading: "Build",
    items: [
      { name: "TypeScript", icon: "typescript" },
      { name: "Node.js", icon: "nodejs" },
      { name: "Next.js", icon: "nextjs" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "Redis", icon: "redis" }
    ]
  },
  ship: {
    heading: "Ship",
    items: [
      { name: "Docker", icon: "docker" },
      { name: "Nginx", icon: "nginx" },
      { name: "Linux", icon: "linux" },
      { name: "GitHub", icon: "github" }
    ]
  },
  also: {
    heading: "Also",
    items: [
      { name: "Java", icon: "java" },
      { name: "Python", icon: "python" },
      { name: "MongoDB", icon: "mongodb" }
    ]
  },
  ai: {
    heading: "AI",
    items: [
      { name: "ChatGPT", icon: "chatgpt" },
      { name: "Claude", icon: "claude" },
      { name: "Gemini", icon: "gemini" },
      { name: "Kimi", icon: "kimi" },
      { name: "Qwen", icon: "qwen" }
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
      return `  <span style="display:inline-flex;align-items:center;${marginStyle}">\n    <img src="assets/icons/${item.icon}.svg" alt="" width="20" height="20" valign="middle" />&nbsp;&nbsp;${item.name}\n  </span>`;
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
      sections.push('    <div class="toolkit-item">');
      sections.push(`      <span class="icon"><img src="assets/icons/${item.icon}.svg" alt="" aria-hidden="true" /></span>`);
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
