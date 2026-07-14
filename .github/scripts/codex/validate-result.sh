#!/usr/bin/env bash
set -euo pipefail

result="${1:-.codex-runtime/issue-result.json}"
context="${2:-.codex-runtime/issue-context.json}"
python3 - "$result" "$context" <<'PY'
import json, re, sys
r=json.load(open(sys.argv[1],encoding="utf-8")); c=json.load(open(sys.argv[2],encoding="utf-8"))
required={"status","summary","issue_number","base_branch","working_branch","changed_files",
"acceptance_criteria","commands_run","tests","security_findings","risks","manual_verification",
"pr_title","pr_body","failure_reason"}
if set(r)!=required: raise SystemExit(f"result keys mismatch: missing={required-set(r)}, extra={set(r)-required}")
if r["status"] not in {"success","needs_info","blocked","failed"}: raise SystemExit("invalid status")
if r["issue_number"]!=c["issue_number"] or r["base_branch"]!=c["base_branch"] or r["working_branch"]!=c["working_branch"]: raise SystemExit("context mismatch")
if not re.fullmatch(r"codex/issue-[1-9][0-9]*-[a-z0-9]+(?:-[a-z0-9]+)*",r["working_branch"]): raise SystemExit("invalid branch")
if len(set(r["changed_files"]))!=len(r["changed_files"]): raise SystemExit("duplicate changed files")
if r["status"]=="success":
    if not r["pr_title"] or f"Closes #{r['issue_number']}" not in r["pr_body"]: raise SystemExit("invalid PR data")
    if any(x.get("severity")=="blocking" for x in r["security_findings"]): raise SystemExit("blocking security finding")
    if any(x.get("status")=="failed" for x in r["acceptance_criteria"]): raise SystemExit("failed acceptance criterion")
    if any(x.get("status")=="not_verified" and not x.get("evidence","").strip() for x in r["acceptance_criteria"]): raise SystemExit("unexplained unverified criterion")
    if any(x.get("exit_code",0)!=0 for x in r["commands_run"]): raise SystemExit("failed recorded command")
    if r["failure_reason"]: raise SystemExit("success has failure reason")
    qpath=sys.argv[1].rsplit('/',1)[0]+'/quality-gate.json' if '/' in sys.argv[1] else 'quality-gate.json'
    q=json.load(open(qpath,encoding="utf-8"))
    if q.get("status")!="passed": raise SystemExit("deterministic quality gate did not pass")
elif not r["failure_reason"]: raise SystemExit("non-success lacks failure reason")
print("result valid")
PY
