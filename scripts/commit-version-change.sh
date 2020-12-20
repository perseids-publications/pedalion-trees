#!/bin/bash

# This script is used to commit an `package.json` file that has been
# updated through the `.github/workflows/release.yml` action.

# It adds `package.json` then commits it with a short message

# Add files
git add package.json

# Commit
git commit -m "[github actions] bump version"
