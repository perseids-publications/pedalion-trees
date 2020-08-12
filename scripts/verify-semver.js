#!/usr/bin/env node

// This script verifies whether a string matches Semver
// It is used in `.github/workflows/release.yml`.

// The script accepts the string as a command line argument and
// exits successfully if it is valid and with an error if it is not valid.
// Note that the version should be prefixed with `v`.
// Examples: v1.0.0, v2.33.1, v0.0.4-alpha
// See https://semver.org/spec/v2.0.0.html for more information and for
// the source of the regex used here.

// Get the version string from ARGV
const version = process.argv[2];

// Exit with error if there is no version
if (version === undefined) {
  // eslint-disable-next-line no-console
  console.log('No version provided');
  process.exit(1);
}

// Test the string against a Semver regex
const semver = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
if (!semver.test(version)) {
  // eslint-disable-next-line no-console
  console.log('Invalid version: the version must match https://semver.org/spec/v2.0.0.html and be preceded by "v" (e.g. v1.0.0)');
  process.exit(1);
}
