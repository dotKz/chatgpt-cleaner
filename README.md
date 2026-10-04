<div align="center">

# ChatGPT Cleaner

**A lightweight, privacy-friendly userscript for managing ChatGPT conversations in bulk.**

Search, filter by project, archive, restore and clean up large ChatGPT histories from a compact UI designed to feel at home inside ChatGPT.

[![Version](https://img.shields.io/badge/version-1.0.0-10a37f?style=flat-square)](#changelog)
[![Userscript](https://img.shields.io/badge/userscript-Tampermonkey-111111?style=flat-square)](#installation)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![ChatGPT](https://img.shields.io/badge/ChatGPT-web-10a37f?style=flat-square)](https://chatgpt.com/)

[Install userscript](https://raw.githubusercontent.com/dotKz/chatgpt-cleaner/main/chatgpt-cleaner.user.js) · [Report a bug](https://github.com/dotKz/chatgpt-cleaner/issues/new?template=bug_report.yml) · [Request a feature](https://github.com/dotKz/chatgpt-cleaner/issues/new?template=feature_request.yml)

**English** · [Français](README.fr.md)

</div>

---

## Why ChatGPT Cleaner?

ChatGPT is great at creating conversations. Cleaning up hundreds of them is less fun.

ChatGPT Cleaner adds a compact conversation manager directly to the ChatGPT web app so you can review large histories, isolate project chats, find archived conversations and apply bulk actions without repeatedly opening the sidebar menu.

## Features

- **Native-style interface** designed to blend into the ChatGPT web UI.
- **Active, archived and selected views** for fast review.
- **Project-aware filtering**: all chats, project chats, chats outside projects, or one specific project.
- **Project dropdown with search** for accounts with many projects.
- **Fast conversation search** by title and project.
- **Sorting** by newest, oldest, A → Z or project.
- **Bulk selection** with a dedicated selected-items view before taking action.
- **Bulk archive** active conversations.
- **Bulk restore** archived conversations.
- **Bulk delete** selected conversations with an in-panel confirmation step.
- **Direct open action** for jumping back to a conversation before deciding what to do with it.
- **Automatic language detection** based on ChatGPT / browser language.
- **15 interface languages** included: English, French, Spanish, German, Italian, Portuguese, Dutch, Polish, Turkish, Russian, Japanese, Korean, Simplified Chinese, Traditional Chinese and Arabic.
- **Dark/light adaptation** to the current ChatGPT theme.
- **Progressive rendering, limited project concurrency and retries** to remain responsive on large histories.
- **No external dependencies, analytics or tracking.**

## Installation

### Recommended — Tampermonkey

1. Install **Tampermonkey** in your browser.
2. Open the [raw userscript](https://raw.githubusercontent.com/dotKz/chatgpt-cleaner/main/chatgpt-cleaner.user.js).
3. Confirm the installation in Tampermonkey.
4. Reload [chatgpt.com](https://chatgpt.com/).
5. Open **ChatGPT Cleaner** from its floating launcher.

### Manual installation

1. Open Tampermonkey.
2. Create a new userscript.
3. Replace the default content with [`chatgpt-cleaner.user.js`](chatgpt-cleaner.user.js).
4. Save the script and reload ChatGPT.

## Usage

1. Open **ChatGPT Cleaner**.
2. Choose **Active**, **Archives** or **Selected**.
3. Optionally filter by scope or project and choose a sort order.
4. Search for specific conversations if needed.
5. Select the conversations you want to manage.
6. Use **Archive**, **Restore** or **Delete**.

The **Selected** view is useful as a final review step before running a bulk action.

## Privacy

ChatGPT Cleaner runs entirely inside your browser on ChatGPT pages.

- It does **not** send conversation data to third-party servers.
- It does **not** include analytics or tracking.
- It does **not** use external libraries or remote code.
- It uses your existing authenticated ChatGPT session to call the same internal web endpoints needed for conversation management.
- Conversation/project lists and selections are held in memory for the current page session; they are not written to local storage by the script.

## Compatibility

ChatGPT Cleaner targets:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

A userscript manager such as Tampermonkey is required.

The script is intended for the **ChatGPT web app**. It is not a native iOS, Android or desktop-app extension.

## Important notice

> ChatGPT Cleaner is an **unofficial community project** and is not affiliated with, endorsed by or maintained by OpenAI.

The script relies on **undocumented internal ChatGPT web APIs**. OpenAI may change those endpoints or their behavior at any time, which can temporarily break some features.

Always review your selection before using bulk actions. Deletion behavior follows the ChatGPT web endpoint behavior available at the time of release.

## Updating

When installed through the raw `.user.js` URL, Tampermonkey can use the `@updateURL` metadata to detect newer versions.

Every public release should increment the userscript `@version`, for example:

```text
1.0.0 → 1.0.1 → 1.1.0 → 2.0.0
```

This project follows [Semantic Versioning](https://semver.org/).

## Repository structure

```text
chatgpt-cleaner/
├── chatgpt-cleaner.user.js
├── README.md
├── README.fr.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
├── .editorconfig
├── .gitignore
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   └── pull_request_template.md
└── docs/
    └── screenshots/
```

## Changelog

### v1.0.0

Initial public release.

Highlights:

- Native-style compact conversation manager.
- Active / archive / selection views.
- Project-aware filtering and searchable project dropdown.
- Search and multiple sort modes.
- Bulk archive, restore and delete actions.
- Automatic theme and language adaptation.
- 15 supported interface languages.
- Performance optimizations for larger histories.

See [`CHANGELOG.md`](CHANGELOG.md) for the full history.

## Contributing

Bug reports and focused improvements are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.

For bugs, include your browser, userscript manager version, ChatGPT language/theme, console errors if relevant, and clear reproduction steps. **Never include access tokens, cookies or private conversation content.**

## Author

Created by **dotKz**.

- Discord: **kz.kz**
- GitHub issues: [support / bug reports](https://github.com/dotKz/chatgpt-cleaner/issues)

## License

Released under the [MIT License](LICENSE).
