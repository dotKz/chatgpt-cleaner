# Contributing

Thanks for helping improve ChatGPT Cleaner.

## Before opening an issue

- Make sure you are using the latest release.
- Reload ChatGPT and reproduce the problem once more.
- Check existing issues for duplicates.

## Bug reports

Please include:

- Browser and version.
- Userscript manager and version.
- ChatGPT language and theme.
- Whether the issue affects active chats, archives, projects or a bulk action.
- Reproduction steps.
- Relevant browser-console errors.

**Do not include:**

- Access tokens.
- Session cookies.
- Account identifiers.
- Private conversation content.
- Personal information from your ChatGPT history.

## Pull requests

Keep pull requests focused. If possible:

1. Explain the user-facing problem.
2. Describe the proposed change.
3. Test light and dark themes.
4. Test at least English and French UI labels when touching interface text.
5. Keep the userscript dependency-free unless there is a strong reason not to.
6. Increment `@version` only when preparing a release, not for every development commit.

## Style

The project intentionally favors a small single-file userscript, minimal dependencies and an interface that visually blends into ChatGPT.
