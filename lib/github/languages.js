/**
 * Languages Module
 * Aggregates byte counts for all programming languages across all owned
 * public and private repositories and calculates percentage distribution.
 */

/**
 * Aggregates language byte counts across an array of repository objects.
 * @param {Array} allRepos - Array of repositories with languages field.
 * @param {number} maxLanguages - Maximum languages to return (default 6).
 */
function aggregateLanguages(allRepos, maxLanguages = 6) {
  const languageTotals = {};

  for (const repo of allRepos) {
    const languages = repo.languages || [];
    for (const lang of languages) {
      if (!lang.name || lang.size <= 0) continue;

      if (!languageTotals[lang.name]) {
        languageTotals[lang.name] = {
          name: lang.name,
          color: lang.color || '#8b949e',
          size: 0
        };
      }
      languageTotals[lang.name].size += lang.size;
    }
  }

  const totalBytes = Object.values(languageTotals).reduce((sum, l) => sum + l.size, 0);

  if (totalBytes === 0) {
    return [];
  }

  const sortedLanguages = Object.values(languageTotals)
    .sort((a, b) => b.size - a.size)
    .slice(0, maxLanguages)
    .map(lang => {
      const frac = lang.size / totalBytes;
      const percentage = (frac * 100).toFixed(1);
      return {
        name: lang.name,
        color: lang.color,
        size: lang.size,
        percentage
      };
    });

  return sortedLanguages;
}

module.exports = {
  aggregateLanguages
};
