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
 * Two-column category layout: Build & Ship side by side, Also & AI side by side below.
 * Uses <nobr> and <br> per item to prevent detached icon/text wrapping in mobile views.
 */
function renderMarkdown(data = toolkitData) {
  const sections = [];
  sections.push("## 03 / Toolkit\n");

  const renderGroupCell = (group) => {
    const lines = [];
    lines.push(`### ${group.heading}\n`);
    lines.push('<p align="left">');
    const itemLines = group.items.map((item) => {
      const size = item.size || 28;
      return `  <nobr><img src="assets/icons/${item.icon}.svg" alt="" width="${size}" height="${size}" valign="middle" />&nbsp;&nbsp;${item.name}</nobr>`;
    });
    lines.push(itemLines.join("<br>\n"));
    lines.push("</p>");
    return lines.join("\n");
  };

  sections.push('<table width="100%">');
  sections.push('<tr>');
  sections.push('<td width="50%" valign="top">\n');
  sections.push(renderGroupCell(data.build));
  sections.push('\n</td>');
  sections.push('<td width="50%" valign="top">\n');
  sections.push(renderGroupCell(data.ship));
  sections.push('\n</td>');
  sections.push('</tr>');
  sections.push('<tr>');
  sections.push('<td width="50%" valign="top">\n');
  sections.push(renderGroupCell(data.also));
  sections.push('\n</td>');
  sections.push('<td width="50%" valign="top">\n');
  sections.push(renderGroupCell(data.ai));
  sections.push('\n</td>');
  sections.push('</tr>');
  sections.push('</table>\n');

  return sections.join("\n").trim();
}

/**
 * Generates the semantic HTML representation for preview / web interfaces
 */
function renderHtml(data = toolkitData) {
  const sections = [];
  sections.push('<div class="toolkit-grid">');

  for (const groupKey of ["build", "ship", "also", "ai"]) {
    const group = data[groupKey];
    sections.push('  <div class="toolkit-group">');
    sections.push(`    <div class="toolkit-heading">${group.heading}</div>`);
    sections.push('    <div class="toolkit-list">');

    for (const item of group.items) {
      const size = item.size || 28;
      sections.push('      <div class="toolkit-item">');
      sections.push(`        <span class="toolkit-icon icon--${size}"><img src="assets/icons/${item.icon}.svg" alt="" aria-hidden="true" /></span>`);
      sections.push(`        <span>${item.name}</span>`);
      sections.push('      </div>');
    }

    sections.push('    </div>');
    sections.push('  </div>');
  }

  sections.push('</div>\n');
  return sections.join("\n").trim();
}

module.exports = {
  toolkitData,
  renderMarkdown,
  renderHtml
};
