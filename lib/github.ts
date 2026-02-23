import { Octokit } from "octokit";

export const createOctokit = (token?: string, timeoutMs: number = 10000) => {
  return new Octokit({
    auth: token,
    request: {
      timeout: timeoutMs,
    },
  });
};
