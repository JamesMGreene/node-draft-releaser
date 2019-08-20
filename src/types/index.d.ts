export interface ICommit {
  sha: string;
  url: string;
}

export interface ITag {
  commit: ICommit;
  name: string;
  tarball_url: string;
  zipball_url: string;
}

export interface IUser {
  id: number;
  login: string;
  // etc.
}

export interface IRelease {
  assets: any[];
  assets_url: string;
  author: IUser;
  body: string;
  created_at: string;
  draft: boolean;
  html_url: string;
  id: number;
  name: string;
  prerelease: boolean;
  published_at: string | null;
  tag_name: string;
  tarball_url: string | null;
  target_commitish: string;
  upload_url: string;
  url: string;
  zipball_url: string | null;
}
