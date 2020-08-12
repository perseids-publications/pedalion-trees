#!/bin/bash

# This script simply pushes to master. It is used by
# `.github/workflows/update.yml` and `.github/workflows/release.yml`

# The reason that this is a script and not in `.github/workflows/update.yml`
# is that Actions can't update GitHub workflows, so if a change needs to be made
# in the workflow, having the script here allows it to be changed.

git push origin master
