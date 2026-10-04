# GitHub repository setup — ChatGPT Cleaner v1.0.0

## Create the repository

Use these values on GitHub:

- **Owner:** `dotKz`
- **Repository name:** `chatgpt-cleaner`
- **Description:** `A lightweight Tampermonkey userscript to manage ChatGPT conversations in bulk — search, filter by project, archive, restore and delete from a native-style UI.`
- **Visibility:** `Public`
- **Add README:** `Off`
- **Add .gitignore:** `No .gitignore`
- **Add license:** `No license`

README, `.gitignore` and the MIT license are already included in this repository pack, so creating an empty repository avoids an unnecessary first-commit conflict.

## Repository About section

After the first push, open the repository and edit the **About** section.

### Description

`A lightweight Tampermonkey userscript to manage ChatGPT conversations in bulk — search, filter by project, archive, restore and delete from a native-style UI.`

### Website

You can use the direct install URL:

`https://raw.githubusercontent.com/dotKz/chatgpt-cleaner/main/chatgpt-cleaner.user.js`

If you later publish on Greasy Fork or OpenUserJS, use that public listing instead because it provides a nicer install/update page.

### Topics

Recommended GitHub topics:

- `chatgpt`
- `chatgpt-cleaner`
- `userscript`
- `tampermonkey`
- `javascript`
- `conversation-manager`
- `bulk-actions`
- `productivity`
- `archive`

## Recommended repository features

In **Settings → General → Features**:

- **Issues:** On
- **Discussions:** Optional; leave off for v1.0.0 unless you expect a community quickly
- **Projects:** Off unless you plan to manage a public roadmap on GitHub
- **Wiki:** Off; the README and docs are enough for this project

Keep the default branch as **`main`**.

## First commit

From inside the `chatgpt-cleaner` folder:

```bash
git init
git add .
git commit -m "chore: initial release v1.0.0"
git branch -M main
git remote add origin https://github.com/dotKz/chatgpt-cleaner.git
git push -u origin main
```

## Create the v1.0.0 tag

```bash
git tag -a v1.0.0 -m "ChatGPT Cleaner v1.0.0"
git push origin v1.0.0
```

## Create the GitHub Release

Open **Releases → Draft a new release**.

- **Tag:** `v1.0.0`
- **Release title:** `ChatGPT Cleaner v1.0.0`
- **Target:** `main`
- **Pre-release:** Off
- **Latest release:** On

Paste the contents of `RELEASE_NOTES_v1.0.0.md` as the release description.

Optionally attach `chatgpt-cleaner.user.js` as a release asset, although the raw `main` file is already used for Tampermonkey updates.

## Suggested first commit history

For a clean public history, this is enough:

```text
chore: initial release v1.0.0
```

After launch, use simple conventional commit messages such as:

```text
fix: restore archive loading after ChatGPT API change
feat: add date range filtering
ui: refine project dropdown spacing
i18n: add Swedish translation
docs: update installation instructions
```

## Userscript metadata

The public file is already prepared with:

- `@version 1.0.0`
- `@author dotKz`
- `@license MIT`
- GitHub homepage and issue links
- automatic `@updateURL` / `@downloadURL`
- ChatGPT domain matches

Author contact in the source:

- **dotKz**
- Discord: **kz.kz**

## Before making the repository public

Check these points:

1. Test `chatgpt-cleaner.user.js` once from the exact repository copy.
2. Confirm that active chats load.
3. Confirm that archived chats load.
4. Confirm project filtering on at least one project.
5. Test archive and restore on disposable conversations.
6. Test delete only on disposable conversations.
7. Test ChatGPT in dark and light mode.
8. Test at least English and French language switching.
9. Verify that no token, cookie, account ID or private conversation content appears anywhere in the repository.
10. Add one current screenshot under `docs/screenshots/` when the UI is final.

## Social preview

A GitHub social preview is worth adding once the UI is final.

Recommended size: **1280 × 640 px**.

Suggested content:

- ChatGPT Cleaner wordmark/title
- Short line: `Bulk conversation management for ChatGPT`
- A clean crop of the real cleaner panel
- Very dark neutral background
- `v1.0.0 · Tampermonkey userscript`

Avoid making the preview look like an official OpenAI product. Keep the repository clearly labeled as an unofficial community tool.
