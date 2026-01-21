import { Octokit } from "octokit";

export const createOctokit = (token?: string) => {
  return new Octokit({
    auth: token,
  });
};
