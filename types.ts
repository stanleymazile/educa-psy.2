export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface ImpactStat {
  label: string;
  value: string;
  suffix?: string;
}
