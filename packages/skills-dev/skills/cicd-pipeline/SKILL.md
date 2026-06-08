---
name: cicd-pipeline
description: GitLab CI pipeline setup, build failure diagnosis, and artifact publishing. Use when a pipeline is broken, a stage is failing, or setting up a new pipeline.
license: MIT
---

# CI/CD Pipeline Guide

**Tradeoff:** Fixing a pipeline by removing the failing check is worse than fixing the underlying problem.

## 1. Pipeline Stages

| Stage | Purpose | Common Failure |
|-------|---------|----------------|
| `build` | Compile + lint | Compile errors, missing deps |
| `test` | Unit + integration | Test failures, coverage drop |
| `publish` | npm/artifact push | Auth error, version already exists |
| `deploy:staging` | Auto deploy | Health check failure |
| `deploy:prod` | Manual gate | — |

## 2. Common Failures

**`npm install` fails:**
- `.npmrc` missing registry or auth token
- Check: Settings → CI/CD → Variables for `NPM_TOKEN`

**`Cannot publish — version already exists`:**
- Bump `version` in `package.json` before pushing — registry versions are immutable

**`Runner not found` / job stuck pending:**
- Check runner registration: Settings → CI/CD → Runners
- Docker executor: verify image is accessible from runner's network

**Health check fails after deploy:**
- App started but isn't ready yet — increase `health_check_interval`
- Port mismatch: app on 8080, health check hitting 80

## 3. Key Files

```
.gitlab-ci.yml              pipeline definition
.npmrc                      registry URL + token reference ($NPM_TOKEN)
packages/*/package.json     version numbers — bump before publish
```

## 4. Debug a Failing Job

```bash
# Reproduce locally with the same Docker image
docker run --rm -it <runner-image> bash
# Then run the failing commands manually
```

Enable `CI_DEBUG_TRACE: "true"` in CI variables for verbose shell output. Disable immediately after — it logs secrets.

The test: Does the job log show the exact command and line that failed, with the full error message?
