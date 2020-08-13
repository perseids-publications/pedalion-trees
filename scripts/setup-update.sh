#!/bin/bash

# This script is used to set up the local tree to match a particular git
# identifier in perseids-publications/treebank-template and then to check out
# files that may have been modified locally. It is run as part of the
# `.github/workflows/update.yml` workflow and should only be run manually with
# caution. It requires the repository to be in a particular state (freshly
# cloned). See `README.md` and `.github/workflows/update.yml`.

# The script:
# 1. adds perseids-publications/treebank-template as a remote called source
# 2. takes a git identifier as an argument and the sets the local
#    repository to match source/identifier
# 3. checks out (from origin/master) a few files and directories that are not
#    part of the template (e.g. the XML files added by the user)
# 4. deletes xml files that may have been added to the template

# Add the remote and get the latest data
git remote add source https://github.com/perseids-publications/treebank-template.git
git fetch source --tags --force

# Set the working tree to match source and the argument passed in (e.g. master)
git restore --source "$1" .

# Check out files and directories that may be modified
git checkout origin/master public/xml
git checkout origin/master .env
git checkout origin/master README.md
git checkout origin/master src/config.json
git checkout origin/master .github/funding.yml

# Workflows cannot themselves touch workflow files
# https://github.community/t/github-linting-remote-rejected/121365
git checkout origin/master .github/workflows

# Remove extra files that were removed in source
git clean -f public/xml
