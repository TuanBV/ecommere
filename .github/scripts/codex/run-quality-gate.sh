#!/usr/bin/env bash
set -euo pipefail

output="${1:-.codex-runtime/quality-gate.json}"
mkdir -p "$(dirname "$output")"
results_file="$(mktemp)"; trap 'rm -f "$results_file"' EXIT
failed=0

record() {
  local name="$1" status="$2" command="$3" code="$4" summary="$5"
  python3 - "$results_file" "$name" "$status" "$command" "$code" "$summary" <<'PY'
import json, sys
p, name, status, command, code, summary = sys.argv[1:]
with open(p, "a", encoding="utf-8") as f:
    f.write(json.dumps({"name": name, "status": status, "command": command,
                        "exit_code": int(code), "summary": summary}) + "\n")
PY
}
run_check() {
  local name="$1"; shift
  local display="$*" log=".codex-runtime/${name//[^a-zA-Z0-9_-]/-}.log" code
  echo "+ $display"
  set +e; "$@" >"$log" 2>&1; code=$?; set -e
  if (( code == 0 )); then record "$name" passed "$display" "$code" "completed";
  else record "$name" failed "$display" "$code" "see sanitized diagnostic artifact"; failed=1; fi
}
unavailable() {
  echo "! $1 unavailable: $2"; record "$1" unavailable "$2" 0 "$3"
  [[ "${4:-optional}" == "required" ]] && failed=1
}

mkdir -p .codex-runtime
[[ -d node_modules ]] || unavailable dependencies "npm ci" "node_modules is absent; install dependencies before the Codex step" required
if [[ -d node_modules ]]; then
  run_check format-web npm run format:check -w apps/web
  run_check lint-api npm run lint -w apps/api
  # `next lint` is not a supported Next.js 15 command in this repository.
  unavailable lint-web "npm run lint -w apps/web" "configured command uses unavailable next lint" required
  run_check typecheck-api ./node_modules/.bin/tsc --noEmit -p apps/api/tsconfig.json
  run_check typecheck-web ./node_modules/.bin/tsc --noEmit -p apps/web/tsconfig.json
  unavailable unit-tests "npm test" "no workspace test script or runner is configured"
  run_check prisma-generate npm run prisma:generate
  run_check generated-code-consistency git diff --exit-code -- apps/api/prisma package-lock.json
  run_check build npm run build
fi

python3 - "$results_file" "$output" "$failed" <<'PY'
import json, sys
rows = [json.loads(x) for x in open(sys.argv[1], encoding="utf-8") if x.strip()]
data = {"status": "failed" if int(sys.argv[3]) else "passed", "checks": rows}
with open(sys.argv[2], "w", encoding="utf-8", newline="\n") as f:
    json.dump(data, f, indent=2); f.write("\n")
PY
(( failed == 0 ))
