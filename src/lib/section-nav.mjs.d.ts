export interface SectionNavItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export function headingIdFromTitle(title: string): string;
export function buildSectionNav(markdown: string): SectionNavItem[];
export function remarkHeadingIds(): () => void;
