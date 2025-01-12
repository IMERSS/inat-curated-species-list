## Changelog

**2.0.0**: Dec 2024, in development.

- Rewriting in TS, Turborepo.
- Separate the script into two published packages:

  - `@imerss/inat-curated-species-list-ui` - React components to render the data
  - `@imerss/inat-curated-species-list-tools` - CLI script for extracting the data from iNat's API and generating the data files

- private packages:

  - `@imerss/inat-curated-species-list-generator` - simple package that illustrates the use of `@imerss/inat-curated-species-list-tools`

- Adding option to show _recent additions to the curated list_.
- Remove front-end logic to dynamically ping iNat for the data.

**1.0.0**: Nov 11th 2022

- initial version.
