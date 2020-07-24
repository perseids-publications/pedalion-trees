#!/usr/bin/env node

// This script is used to resolve `package.json` merge conflicts as part of the
// `.github/workflows/update.yml` workflow. It should only be run manually with
// caution and it requires the repository to be in particular state
// (specifically, it requires `scripts/setup-update.sh` to  have been run first).
// See `README.md` and  `.github/workflows/update.yml`.

// When a repository using perseids-publications/treebank-template wants to
// update the template code, the workflow will update the local repository
// to match the template then run some git commands that check out files like
// `src/config.json` (see `scripts/setup-update.sh`).
// The only file that should have conflicts is `package.json`. This script uses
// the git command line to get the `package.json` from origin/master and reads
// the local `package.json` file (which matches source/master).
// It takes the "name", "version", and "homepage" from the origin/master
// version, keeps the rest the same, then writes the result to `package.json`.

const { execSync } = require('child_process');

const { readFileSync, writeFileSync } = require('fs');

// Read the old package.json with `git show`
const oldPackage = JSON.parse(
  execSync('git show origin/master:package.json'),
);

// Read the new package.json - currently in the repository
const newPackage = JSON.parse(
  readFileSync('package.json', { encoding: 'utf8', flag: 'r' }),
);

// Replace the relevant fields
[
  'name',
  'version',
  'homepage',
].forEach((key) => {
  newPackage[key] = oldPackage[key];
});

// Write to package.json
writeFileSync('package.json', `${JSON.stringify(newPackage, null, 2)}\n`);
