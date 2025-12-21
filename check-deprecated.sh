#!/bin/bash

# Configuration
CONCURRENT_CHECKS=10
IGNORED_PACKAGES="workspace:*"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}🔍 Scaling Monorepo for deprecated packages...${NC}"
echo -e "${BLUE}   Concurrency: ${CONCURRENT_CHECKS} checks in parallel${NC}"
echo "---------------------------------------------------"

# Check for jq
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed.${NC}"
    exit 1
fi

# Create a temporary file to store unique dependencies
temp_file=$(mktemp)
unique_deps_file=$(mktemp)

# Find all package.json files, ignoring node_modules
find . -name "package.json" -not -path "*/node_modules/*" | while read -r pkg_file; do
    # echo -e "Scraping ${YELLOW}$pkg_file${NC}..."
    jq -r '(.dependencies // {} | to_entries[] | "\(.key)@\(.value)"), (.devDependencies // {} | to_entries[] | "\(.key)@\(.value)")' "$pkg_file" >> "$temp_file"
done

# Filter and sort unique packages
# 1. Remove workspace:* references
# 2. Sort and unique
grep -v "workspace:" "$temp_file" | sort -u > "$unique_deps_file"
total_pkgs=$(wc -l < "$unique_deps_file" | tr -d ' ')

echo -e "📦 Found ${BOLD}$total_pkgs${NC} unique external dependencies."
printf "%-40s %-20s %-15s %s\n" "PACKAGE" "VERSION" "STATUS" "MESSAGE"
echo "------------------------------------------------------------------------------------------------"

check_package() {
    local pkg_str=$1
    local name=$(echo "$pkg_str" | cut -d '@' -f 1)
    local version_raw=$(echo "$pkg_str" | cut -d '@' -f 2-)
    
    # Strip common semver ranges for the query (basic heuristic)
    local version=${version_raw//[\^~]/}

    # If version is * or latest, just check the package root
    if [[ "$version" == "*" || "$version" == "latest" ]]; then
        version=""
    fi

    # Query npm
    # We fetch the specific version's deprecated field, or the package's deprecated field if no version
    if [[ -z "$version" ]]; then
        deprecated_msg=$(npm view "$name" deprecated 2>/dev/null)
    else
        deprecated_msg=$(npm view "$name@$version" deprecated 2>/dev/null)
    fi

    if [[ -n "$deprecated_msg" && "$deprecated_msg" != "null" ]]; then
        # Limit message length
        local trunc_msg="${deprecated_msg:0:60}"
        if [[ ${#deprecated_msg} -gt 60 ]]; then trunc_msg="${trunc_msg}..."; fi
        
        printf "${RED}%-40s %-20s %-15s %s${NC}\n" "$name" "$version_raw" "DEPRECATED ❌" "$trunc_msg"
    else
       # Uncomment to see all packages passed
       # printf "${GREEN}%-40s %-20s %-15s${NC}\n" "$name" "$version_raw" "OK ✔️"
       :
    fi
}

export -f check_package
export RED GREEN YELLOW BLUE NC

# Run checks in parallel using xargs
# -P sets max procs
# -n 1 passes one argument per call
cat "$unique_deps_file" | xargs -P "$CONCURRENT_CHECKS" -n 1 -I {} bash -c 'check_package "$@"' _ {}

# Clean up
rm "$temp_file" "$unique_deps_file"

echo "---------------------------------------------------"
echo -e "${GREEN}✨ Scan complete!${NC}"