import type { PageLoad } from './$types';

// better-auth redirects the email link to this page with either `?token=...`
// (valid) or `?error=INVALID_TOKEN` (expired/invalid).
export const load: PageLoad = ({ url }) => {
  return {
    token: url.searchParams.get('token'),
    linkError: url.searchParams.get('error'),
  };
};
