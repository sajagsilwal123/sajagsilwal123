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
 * Spacious borderless category layout: Build, Ship, Also, AI.
 * Each item is wrapped in <nobr> to prevent detached icon/text wrapping in mobile views.
 * Items flow across the row with generous non-breaking spaces on PC.
 */
function renderMarkdown(data = toolkitData) {
  const sections = [];
  sections.push("## 03 / Toolkit\n");

  const groups = [data.build, data.ship, data.also, data.ai];
  for (const group of groups) {
    sections.push(`### ${group.heading}\n`);
    sections.push('<p align="left">');
    const itemStrings = group.items.map((item) => {
      const size = item.size || 28;
      return `  <nobr><img src="assets/icons/${item.icon}.svg" alt="" width="${size}" height="${size}" valign="middle" />&nbsp;&nbsp;${item.name}</nobr>`;
    });
    sections.push(itemStrings.join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n"));
    sections.push("</p>\n");
  }

  return sections.join("\n").trim();
}

/**
 * Generates the semantic HTML representation for preview / web interfaces
 */
function renderHtml(data = toolkitData) {
  const sections = [];
  sections.push('<div class="toolkit-container">');

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
