#!/bin/bash

# This script SHOULD NOT BE RUN LOCALLY

# It configures the git user and email for use in GitHub Actions
# The reason that this is a script and not in `.github/workflows/*.yml`
# is that Actions can't update GitHub workflows, so if a change needs to be made
# in these settings, having them here allows them to be changed.

git config user.name github-actions
git config user.email github-actions@github.com
