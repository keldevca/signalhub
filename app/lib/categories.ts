export const ALL_CATEGORIES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Rust',
  'Go',
  'PHP',
  'C / C++',
  'React',
  'Angular',
  'Next.js',
  'Vue.js',
  'Node.js',
  'Docker',
  'Kubernetes',
  'DevOps',
  'Linux',
  'Cloud',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'iOS / Swift',
  'Android',
  'Flutter',
  'React Native',
  'UI / UX Design',
  'Motion Design',
  '3D / Blender',
  'CSS',
  'Architecture',
  'Open Source',
  'Tech News',
  'Startups',
] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

export const SLUG_TO_CATEGORY: Record<string, Category> = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'python': 'Python',
  'java': 'Java',
  'rust': 'Rust',
  'go': 'Go',
  'php': 'PHP',
  'c-cpp': 'C / C++',
  'react': 'React',
  'angular': 'Angular',
  'nextjs': 'Next.js',
  'vuejs': 'Vue.js',
  'nodejs': 'Node.js',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'devops': 'DevOps',
  'linux': 'Linux',
  'cloud': 'Cloud',
  'ai': 'Artificial Intelligence',
  'machine-learning': 'Machine Learning',
  'data-science': 'Data Science',
  'cybersecurity': 'Cybersecurity',
  'ios-swift': 'iOS / Swift',
  'android': 'Android',
  'flutter': 'Flutter',
  'react-native': 'React Native',
  'ui-ux-design': 'UI / UX Design',
  'motion-design': 'Motion Design',
  '3d-blender': '3D / Blender',
  'css': 'CSS',
  'architecture': 'Architecture',
  'open-source': 'Open Source',
  'tech-news': 'Tech News',
  'startups': 'Startups',
};

export const CATEGORY_TO_SLUG: Record<Category, string> = Object.fromEntries(
  Object.entries(SLUG_TO_CATEGORY).map(([slug, cat]) => [cat, slug])
) as Record<Category, string>;

export const ALL_SLUGS = Object.keys(SLUG_TO_CATEGORY);

const SEPARATOR = '_';

export function categoriesToSlug(categories: string[]): string {
  return categories
    .map((c) => CATEGORY_TO_SLUG[c as Category])
    .filter(Boolean)
    .join(SEPARATOR);
}

export function slugToCategories(slug: string): Category[] {
  return slug
    .split(SEPARATOR)
    .map((s) => SLUG_TO_CATEGORY[s])
    .filter((c): c is Category => Boolean(c));
}
