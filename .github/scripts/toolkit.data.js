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
 * Uses clean 2-column tables per category with atomic icon + label cells (<td width="50%">).
 * Category headings use <p><strong>Category</strong></p> to prevent GitHub from generating anchor link icons (🔗).
 */
function renderMarkdown(data = toolkitData) {
  const sections = [];
  sections.push("## 03 / Toolkit\n");

  const groups = [data.build, data.ship, data.also, data.ai];
  for (const group of groups) {
    sections.push(`<p><strong>${group.heading}</strong></p>\n`);
    sections.push('<table width="100%">');

    for (let i = 0; i < group.items.length; i += 2) {
      const itemLeft = group.items[i];
      const itemRight = group.items[i + 1];

      const leftSize = itemLeft.size || 24;
      const leftCell = `    <td width="50%"><img src="assets/icons/${itemLeft.icon}.svg" alt="" width="${leftSize}" height="${leftSize}" valign="middle" />&nbsp;&nbsp;${itemLeft.name}</td>`;

      let rightCell = '    <td width="50%">&nbsp;</td>';
      if (itemRight) {
        const rightSize = itemRight.size || 24;
        rightCell = `    <td width="50%"><img src="assets/icons/${itemRight.icon}.svg" alt="" width="${rightSize}" height="${rightSize}" valign="middle" />&nbsp;&nbsp;${itemRight.name}</td>`;
      }

      sections.push("  <tr>");
      sections.push(leftCell);
      sections.push(rightCell);
      sections.push("  </tr>");
    }

    sections.push("</table>\n");
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
      const size = item.size || 24;
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
