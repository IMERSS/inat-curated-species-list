## Development

1. Select the right version of node.
   `nvm use`

2. Bootstrap the monorepo
   `pnpm install`

3. Run the local dev server demoing the components.
   `pnpm dev`

   Note: this doesn't current auto-open the browser. Open `http://localhost:3000` in your browser.

---

## Plan to remove dependency on baseline data in iNat

1. First, generate a `baseline.json` file containing all species from the user account that entered the known baseline species data. This data file will be incorporated into the curated list generation script in lieu of the data already being in iNat.

```
[
	{
		id: number;
		speciesName: string;
      taxonomy: []; // as per
	}
	...
]
```

3. Update the generation script for species data, new additions & taxon changes to factor in this data as a baseline. Accepting it as existing data.

\*\*\* 4. Do a diff of old vs new files to confirm it's correct, then delete all observations on iNat made by that account.

- One off: run the generation script, then filter out anything in the baseline.json file that's already been identified on iNat.

## Regular usage

Okay! At this point, here's how regular usage of the script will work.

1. Run the generation script, but always have a copy of the last-ran `new-additions-data.json` file. That's essential. \*

2. Do a diff between the new additions data files (before + after). if there are new additions:
   1. Ping iNat (find endpoint here) to see if there's been a taxon change for the taxon IDs for new additions.
   2. If so, update `baseline.json` to set the new taxon IDs then re-run the generation script.
   3. If not, it's a genuine new addition.

- Store all this in a repo. It's the only sensible way. That would simplify logging change to `new-additions-data.json` and greatly simplify debugging when issue came up (we'd have the full history). Every time you run it, it would generate new JSON files for new additions, species + taxon changes & they would be committed to the repo.
