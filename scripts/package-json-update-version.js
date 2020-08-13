#!/usr/bin/env node

// This script is used to update the `version` in `package.json`
// It is used in `.github/workflows/release.yml`.

// It accepts one command line argument: the version number string

const { readFileSync, writeFileSync } = require('fs');

// Read the package.json file
const packageJson = JSON.parse(
  readFileSync('package.json', { encoding: 'utf8', flag: 'r' }),
);

// Get the version number from ARGV and remove `v` from the beginning
const version = process.argv[2].substr(1);

// Replace the relevant fields
packageJson.version = version;

// Write to package.json
writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
