# Task D: Git, GitHub, Versioning, and Deployment Report

## 1. Repository identity and access

| Item | Evidence to complete after publication |
|---|---|
| Repository name | `sunrise-dental-clinic-system` |
| Visibility | Public: anyone with the URL can view the source and workflow history |
| GitHub repository URL | **Paste the public URL here** |
| Target latest release/tag | `v1.0.0` (create after the final commit) |
| Deployed frontend URL | **Paste the GitHub Pages URL here** |
| Last verified | **Record date and time here** |

The repository must be set to **Public** in GitHub under Settings > General > Danger Zone. No passwords, API keys, database dumps, generated build output, or local environment files are included. The `.gitignore` file excludes Maven output and environment-specific configuration.

## 2. Daily version history

The project is versioned with small, purposeful commits and annotated release tags. Replace the example dates with the actual development dates and include the commit IDs from `git log`.

| Version | Date | Main change | Verification |
|---|---|---|---|
| `v0.1.0` | Day 1 | Created project structure, Spring Boot module, frontend, and database schema | Application structure reviewed |
| `v0.2.0` | Day 2 | Added authentication, registration, and role-based dashboard flows | Login and registration checks |
| `v0.3.0` | Day 3 | Added appointment registration, search, statuses, and dashboard metrics | Backend tests and browser flow |
| `v0.4.0` | Day 4 | Added patient records, billing, treatment pricing, and receipt generation | Service/controller tests |
| `v1.0.0` | Latest day | Target release: consolidated the latest UI, profile tools, help flow, CI build, and Pages deployment | `mvn test` and GitHub Actions |

Recommended commands for creating the history:

```text
git init
git add .
git commit -m "chore: create clinic system foundation"
git branch -M main
git remote add origin https://github.com/<owner>/sunrise-dental-clinic-system.git
git push -u origin main

git tag -a v0.1.0 -m "Initial clinic system foundation"
git push origin v0.1.0
git tag -a v1.0.0 -m "Release latest clinic management features"
git push origin v1.0.0
```

For each development day, use a separate commit with a verb-led message, for example `feat: add appointment search` or `test: cover treatment pricing`. The commit history and tag list provide an auditable record of which feature was introduced in each version.

## 3. Version-control techniques demonstrated

- **Remote repository:** GitHub is the public source of truth and provides history, releases, pull requests, and Actions logs.
- **Main branch protection:** Keep `main` deployable. Changes should be reviewed or tested before merging.
- **Feature branches:** Use names such as `feature/appointment-search`, `fix/receipt-total`, and `docs/task-d-report` for isolated work.
- **Atomic commits:** One logical change per commit makes review, rollback, and marking the daily versions clear.
- **Semantic release tags:** `v0.1.0`, `v0.2.0`, and `v1.0.0` identify meaningful project states.
- **`.gitignore`:** Prevents credentials, IDE metadata, Maven `target/`, and local database artifacts from entering the public repository.
- **Remote verification:** Demonstrate `git remote -v`, `git branch --show-current`, `git log --oneline --decorate`, and `git tag` in the evidence screenshots.

## 4. CI/CD workflow

The workflow at `.github/workflows/ci-and-deploy.yml` runs on every push and pull request. It:

1. Checks out the selected commit.
2. Sets up Java 17 and Maven caching.
3. Runs `mvn test` in `backend/`.
4. On a push to `main`, uploads `frontend/` as a Pages artifact.
5. Deploys that artifact to GitHub Pages.

This demonstrates continuous integration for the backend and continuous deployment for the latest static frontend. The backend requires a Java hosting service and a managed MySQL database; GitHub Pages cannot run Spring Boot. The deployment boundary is therefore explicit: Pages deploys the browser UI, while the API is deployed separately with `PORT`, `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables.

## 5. Deployment demonstration

Capture the following after the first successful push to `main`:

1. GitHub repository landing page showing **Public**, the latest commit, and the `v1.0.0` tag.
2. Actions run showing the `backend-tests` job passed and the `deploy-frontend` job passed.
3. GitHub Pages settings showing the published URL.
4. The deployed landing page at the published URL.
5. The deployed login and dashboard flow with a test account.
6. A release/tag page showing that the latest deployed version is `v1.0.0`.

Do not expose real patient data in screenshots. Use the supplied demo accounts or synthetic records only, and redact repository-owner email addresses and any hosting secrets.

## 6. Screenshot evidence index

Store screenshots in `docs/screenshots/` using these names and reference them in the submitted report:

| File | What it proves |
|---|---|
| `01-public-repository.png` | Public GitHub repository and latest commit |
| `02-version-tags.png` | Daily tags/releases and version history |
| `03-actions-success.png` | CI test and deployment workflow succeeded |
| `04-pages-settings.png` | GitHub Pages deployment URL and source |
| `05-deployed-home.png` | Latest frontend version is live |
| `06-deployed-dashboard.png` | Login and role dashboard workflow is demonstrated |

## 7. Final submission checklist

- [ ] Public repository URL pasted above and opens in an incognito browser.
- [ ] `main` contains the latest code and is linked to the deployment workflow.
- [ ] Daily commits and version tags are visible in GitHub.
- [ ] `v1.0.0` has been created as the latest release and matches the deployed frontend.
- [ ] CI test and deployment run are green.
- [ ] Screenshot evidence is stored under `docs/screenshots/` and described above.
- [ ] No secrets or patient-identifying data are committed.