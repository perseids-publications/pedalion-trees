#!/bin/bash

# This script is used to commit the local tree and give it a commit message
# that explains what was done. It is run as part of the
# `.github/workflows/update.yml` workflow and should only be run manually with
# caution. It requires the repository to be in a particular state (specifically,
# it requires `scripts/setup-upddate.sh` and `scripts/package-json-merge.js`
# to have been run. See `README.md` and `.github/workflows/update.yml`.

# The script:
# 1. adds all files to the index
# 2. creates a commit using the commit hash of the given identifier

# Add files
git add .

# Commit
git commit -m "[github actions] update from source `git show-ref -s $1`"
