/**
 * TypeScript definitions for GitHub Statistics Engine
 * Distinguishes between internal raw data (including private details)
 * and sanitized public data (safe for portfolio display).
 */

export interface RepositoryLanguage {
  name: string;
  color: string;
  size: number;
}

export interface InternalRepository {
  name: string;
  isPrivate: boolean;
  isFork: boolean;
  stargazerCount: number;
  languages: RepositoryLanguage[];
}

export interface InternalContributionDay {
  date: string;
  contributionCount: number;
}

export interface InternalContributionWeek {
  contributionDays: InternalContributionDay[];
}

export interface InternalGitHubStats {
  publicRepos: InternalRepository[];
  privateRepos: InternalRepository[];
  totalStars: number;
  contributionWeeks: InternalContributionWeek[];
  totalCommitContributions: number;
  restrictedContributionsCount: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  pullRequestsMerged: number;
  issuesClosed: number;
  createdAt: string;
}

export interface LanguageStat {
  name: string;
  color: string;
  size: number;
  percentage: string;
}

/**
 * Publicly consumable stats payload.
 * Strictly sanitized: No private repository names, URLs, or confidential metadata.
 */
export interface PublicGitHubStats {
  // Repository counts
  totalRepositories: number;
  publicRepositories: number;
  privateRepositories: number;

  // Contributions & Activity
  totalContributions: number;
  totalCommits: number;
  commitsThisYear: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;

  // Collaboration
  pullRequestsMerged: number;
  issuesClosed: number;
  codeReviews: number;
  starsEarned: number;
  yearsOnGithub: number;

  // Insights
  mostActiveMonth: string;
  mostActiveWeekday: string;
  mostActivePublicRepo: string; // Strictly public repo name to prevent private leak
  avgCommitsPerActiveDay: string;
  consistency: string;

  // Languages across public + private repositories
  languages: LanguageStat[];

  // 52-week calendar for heatmap visualization
  calendar: InternalContributionWeek[];
}
