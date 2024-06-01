interface GithubCommit {
  message: string;
}

interface GithubRepository {
  master_branch?: string;
}

export interface GithubEvent {
  commits?: GithubCommit[];
  ref?: string;
  repository?: GithubRepository;
}
