---
name: Bug Triage & RCA
id: bug-triage
version: 1.2.0
role: dev
category: Developer Activity
---

# Bug Triage & RCA

AI-assisted bug triaging, root cause analysis, and priority scoring
using Jira JQL queries and Oracle MCP server tools.

## Trigger Keywords

Invoke this skill when the user mentions: bug, triage, RCA, root cause,
defect analysis, issue investigation, Jira bug, error log.

## Investigation Flow

1. **Fetch issue details** — use Jira JQL to pull the bug metadata,
   affected component, module code, and reporter context.

2. **Identify module** — map the Jira component label to a Dev
   module code (e.g. TPM, ISM, GRC, AUD) and derive the relevant
   metric/infolet IDs.

3. **Query SI_DB_LOG** — search error logs around the reported timestamp
   using `get_app_db_logs` with log_level=E and relevant module filter.

4. **Check workflow state** — if the bug involves a submission or
   assignment, fetch the process_instance_id and run
   `get_task_details_from_pid` to see current workflow position.

5. **Trace form data** — if data is missing or wrong, check the push
   table (SI_`METRIC_ID`_T) and master table for the record.

6. **Correlate with recent deployments** — run `get_db_modified_objects`
   with the relevant package_name to see if recent changes could be
   the cause.

7. **Score and summarize** — produce a concise RCA with:
   - Root cause (code / config / data / environment)
   - Affected records count
   - Suggested fix approach
   - Priority recommendation (P1/P2/P3)

## Key Tables

- `SI_DB_LOG` — primary error log
- `MS_APPS_MAM_RUN_LOG` — MAM run failures
- `SI_EVENT_ASSIGNMENTS` — assignment status
- `SI_METRICS_T` — form/metric metadata

> Managed by Dev Skills CLI. Run `npx @dev/skills update` for latest.
