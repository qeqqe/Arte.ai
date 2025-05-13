export interface ScrapedJob {
  md: string;
  description: string;
  organization: Organization;
  posted_time_ago: string;
}

export interface Organization {
  logo_url: string;
  name: string;
  location: string;
}
