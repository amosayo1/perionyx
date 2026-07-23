#!/usr/bin/env bash
# brain.sh — Perionyx Brain CLI
# Usage: bash brain.sh <command> [args]

set -euo pipefail

BRAIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATES_DIR="$BRAIN_DIR/Templates"
TODAY="$(date +%Y-%m-%d)"

# --- Helpers ---

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/--*/-/g; s/^-//; s/-$//'
}

die() {
  echo "Error: $1" >&2
  exit 1
}

copy_template() {
  local tpl="$TEMPLATES_DIR/$1"
  local dest="$2"
  [[ -f "$tpl" ]] || die "Template not found: $tpl"
  [[ -f "$dest" ]] && die "File already exists: $dest"
  cp "$tpl" "$dest"
  echo "$dest"
}

replace_all() {
  sed -i '' "s|$1|$2|g" "$3"
}

# --- Commands ---

cmd_new_phase() {
  local num="${1:?Usage: brain.sh new-phase <number> <name>}"
  local name="${2:?Usage: brain.sh new-phase <number> <name>}"
  local slug
  slug="$(slugify "$name")"
  local dest="$BRAIN_DIR/13-Engineering-Journal/phase-${num}-${slug}.md"

  copy_template "tpl-phase.md" "$dest"
  replace_all '{{phase-number}}' "$num" "$dest"
  replace_all '{{phase-name}}' "$name" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  echo "Created: $dest"
}

cmd_new_adr() {
  local num="${1:?Usage: brain.sh new-adr <number> <title>}"
  local title="${2:?Usage: brain.sh new-adr <number> <title>}"
  local slug
  slug="$(slugify "$title")"
  local dest="$BRAIN_DIR/11-ADR/adr-${num}-${slug}.md"

  copy_template "tpl-adr.md" "$dest"
  replace_all '{{title}}' "$title" "$dest"
  replace_all '{{adr_number}}' "$num" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  echo "Created: $dest"
}

cmd_new_journal() {
  local dest="$BRAIN_DIR/13-Engineering-Journal/journal-${TODAY}.md"

  copy_template "tpl-journal.md" "$dest"
  replace_all '{{title}}' "Engineering Journal — $TODAY" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  echo "Created: $dest"
}

cmd_new_interview() {
  local name="${1:?Usage: brain.sh new-interview <name>}"
  local slug
  slug="$(slugify "$name")"
  local dest="$BRAIN_DIR/09-Customer-Discovery/interview-${slug}.md"

  copy_template "tpl-interview.md" "$dest"
  replace_all '{{title}}' "Interview: $name" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  replace_all '{{interviewee_name}}' "$name" "$dest"
  echo "Created: $dest"
}

cmd_new_research() {
  local topic="${1:?Usage: brain.sh new-research <topic>}"
  local slug
  slug="$(slugify "$topic")"
  local dest="$BRAIN_DIR/10-Research/research-${slug}.md"

  copy_template "tpl-research.md" "$dest"
  replace_all '{{title}}' "Research: $topic" "$dest"
  replace_all '{{topic}}' "$topic" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  echo "Created: $dest"
}

cmd_new_security_finding() {
  local title="${1:?Usage: brain.sh new-security-finding <title>}"
  local slug
  slug="$(slugify "$title")"
  local dest="$BRAIN_DIR/04-Security/finding-${slug}.md"

  copy_template "tpl-security-finding.md" "$dest"
  replace_all '{{title}}' "$title" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  echo "Created: $dest"
}

cmd_new_meeting() {
  local dest="$BRAIN_DIR/13-Engineering-Journal/meeting-${TODAY}.md"

  copy_template "tpl-meeting.md" "$dest"
  replace_all '{{title}}' "Meeting — $TODAY" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  echo "Created: $dest"
}

cmd_new_experiment() {
  local title="${1:?Usage: brain.sh new-experiment <title>}"
  local slug
  slug="$(slugify "$title")"
  local dest="$BRAIN_DIR/10-Research/experiment-${slug}.md"

  copy_template "tpl-experiment.md" "$dest"
  replace_all '{{title}}' "Experiment: $title" "$dest"
  replace_all '{{experiment_name}}' "$title" "$dest"
  replace_all '{{date}}' "$TODAY" "$dest"
  echo "Created: $dest"
}

cmd_validate_links() {
  local syntax_errors=0
  local forward_refs=0
  local actual_broken=0
  local total_links=0

  local syntax_list=""
  local forward_list=""
  local broken_list=""

  echo "=== Brain Link Validator ==="
  echo ""

  # Phase 1: Check syntax — find malformed wikilinks
  while IFS= read -r match; do
    [[ -z "$match" ]] && continue
    local file="${match%%:*}"
    local rest="${match#*:}"
    local linenum="${rest%%:*}"
    local relpath
    relpath="$(realpath --relative-to="$BRAIN_DIR" "$file" 2>/dev/null || echo "$file")"
    syntax_list+="  $relpath:$linenum — malformed wikilink\n"
    ((syntax_errors++)) || true
  done < <(
    # Find lines with [[ but no matching ]] on the same line
    grep -rn '\[\[' "$BRAIN_DIR" --include="*.md" 2>/dev/null \
      | grep -v '\]\]' || true
  )

  # Phase 2: Extract all valid wikilinks and classify
  while IFS= read -r match; do
    [[ -z "$match" ]] && continue
    local file="${match%%:*}"
    local rest="${match#*:}"
    local linenum="${rest%%:*}"
    local content="${rest#*:}"
    local relpath
    relpath="$(realpath --relative-to="$BRAIN_DIR" "$file" 2>/dev/null || echo "$file")"

    # Extract individual wikilinks (non-greedy)
    local links
    links="$(echo "$content" | grep -o '\[\[[^]]*\]\]' | sed 's/\[\[//g; s/\]\]//g')" || true

    while IFS= read -r link; do
      [[ -z "$link" ]] && continue
      ((total_links++)) || true

      local base="${link%%#*}"
      # Strip pipe alias — everything after | is display text
      base="${base%%|*}"
      local found
      found="$(find "$BRAIN_DIR" -type f -name "${base}.md" 2>/dev/null | head -1)"

      if [[ -n "$found" ]]; then
        continue  # Valid link, skip
      fi

      # Link is unresolved — classify it
      # Classify unresolved link
      # Default: all unresolved links are forward references in a growing vault.
      # Only flag as "actual broken" if the link has a directory path that suggests
      # it should point to an existing note (e.g., brain/00-Home/brain-health).
      local is_absolute_path=false
      case "$base" in
        brain/*|docs/*|src/*)
          is_absolute_path=true
          ;;
      esac

      if $is_absolute_path; then
        # Absolute path that doesn't resolve = likely broken
        broken_list+="  $relpath:$linenum → [[$link]]\n"
        ((actual_broken++)) || true
      else
        # Relative link = forward reference to future content
        forward_list+="  $relpath:$linenum → [[$link]]\n"
        ((forward_refs++)) || true
      fi
    done <<< "$links"
  done < <(grep -rn '\[\[' "$BRAIN_DIR" --include="*.md" 2>/dev/null)

  # Output results
  echo "Total wikilinks scanned: $total_links"
  echo ""

  if [[ $syntax_errors -gt 0 ]]; then
    echo "SYNTAX ERRORS ($syntax_errors)"
    echo "  Malformed wikilinks — missing closing ]], bad pipe syntax, etc."
    echo ""
    echo -e "$syntax_list"
  fi

  if [[ $actual_broken -gt 0 ]]; then
    echo "ACTUAL BROKEN LINKS ($actual_broken)"
    echo "  These link to notes that should exist but don't — fix or remove."
    echo ""
    echo -e "$broken_list"
  fi

  if [[ $forward_refs -gt 0 ]]; then
    echo "FORWARD REFERENCES ($forward_refs)"
    echo "  Links to notes not yet created — expected, resolve as content grows."
    echo ""
    # Show first 20 forward references
    echo -e "$forward_list" | head -20
    if [[ $forward_refs -gt 20 ]]; then
      echo "  ... and $((forward_refs - 20)) more"
    fi
    echo ""
  fi

  echo "---"
  echo "Summary: $syntax_errors syntax errors, $actual_broken actual broken, $forward_refs forward references"

  if [[ $syntax_errors -eq 0 && $actual_broken -eq 0 ]]; then
    echo "No action required — all links are either valid or intentional forward references."
  else
    echo "Action needed: fix $syntax_errors syntax errors and $actual_broken broken links."
  fi
}

cmd_health() {
  local total_md total_canvas total_wikilinks total_tags

  total_md="$(find "$BRAIN_DIR" -type f -name '*.md' | wc -l | tr -d ' ')"
  total_canvas="$(find "$BRAIN_DIR" -type f -name '*.canvas' | wc -l | tr -d ' ')"
  total_wikilinks="$(grep -r '\[\[' "$BRAIN_DIR" --include="*.md" -c 2>/dev/null | awk -F: '{s+=$NF} END {print s+0}')"
  total_tags="$(grep -r 'tags:' "$BRAIN_DIR" --include="*.md" -l 2>/dev/null | wc -l | tr -d ' ')"

  echo "=== Brain Health ==="
  echo ""
  echo "  Markdown files:    $total_md"
  echo "  Canvas files:      $total_canvas"
  echo "  Wikilinks:         $total_wikilinks"
  echo "  Files with tags:   $total_tags"
  echo ""
  echo "--- Files per folder ---"
  echo ""

  for dir in "$BRAIN_DIR"/*/; do
    [[ -d "$dir" ]] || continue
    local count
    count="$(find "$dir" -type f \( -name '*.md' -o -name '*.canvas' \) | wc -l | tr -d ' ')"
    local name
    name="$(basename "$dir")"
    if [[ $count -gt 0 ]]; then
      printf "  %-30s %d\n" "$name" "$count"
    fi
  done

  echo ""
  echo "======================="
}

# --- Main ---

command="${1:-}"
shift || true

case "$command" in
  new-phase)          cmd_new_phase "$@" ;;
  new-adr)            cmd_new_adr "$@" ;;
  new-journal)        cmd_new_journal "$@" ;;
  new-interview)      cmd_new_interview "$@" ;;
  new-research)       cmd_new_research "$@" ;;
  new-security-finding) cmd_new_security_finding "$@" ;;
  new-meeting)        cmd_new_meeting "$@" ;;
  new-experiment)     cmd_new_experiment "$@" ;;
  validate-links)     cmd_validate_links ;;
  health)             cmd_health ;;
  ""|help|-h|--help)
    cat <<EOF
brain.sh — Perionyx Brain CLI

Usage: bash brain.sh <command> [args]

Commands:
  new-phase <num> <name>       Create a phase journal entry
  new-adr <num> <title>        Create an Architecture Decision Record
  new-journal                  Create today's engineering journal entry
  new-interview <name>         Create a customer interview note
  new-research <topic>         Create a research note
  new-security-finding <title> Create a security finding
  new-meeting                  Create meeting notes
  new-experiment <title>       Create an experiment note
  validate-links               Classify wikilinks (syntax, broken, forward refs)
  health                       Show vault health stats
  help                         Show this help
EOF
    ;;
  *)
    echo "Unknown command: $command" >&2
    echo "Run 'bash brain.sh help' for usage." >&2
    exit 1
    ;;
esac
