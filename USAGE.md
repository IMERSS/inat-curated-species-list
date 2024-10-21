# Usage

> October 2024: VERY incomplete! Bear with me while I rewrite the code and get it properly documented. Lots to explain!

This `@imerss/inat-curated-species-list` package is separated into two areas:

1. The code, used to render the HTML on your site
2. A script to query iNaturalist's API and create data files of the information you need.

Please read over this full document to get an understanding of how to use it.

## How it works

The diagram below gives an high-level overview of how the scripts works. Each step is explained below.

<kbd>
  <img src="./resources/architecture.png" />
</kbd>

### 1. Generate your data files

In order to display your species list, first you need to generate the data. While the iNaturalist site contains all the source data, it's not possible to just query it directly. The problem is that a lot of computation is needed to locate, parse and reduce the data into a concise list of species. Secondly, we don't want to hammer their website. Thirdly, the dat.

So what this step does

The tooling to generate.

## The code

### Scenario 1: React component

1. Import the package.

```
npm install @imerss/inat-curated-species-list
```

2. Update the settings file with those three values.

### Scenario 2: Standalone embedded HTML

---

## Run locally

The script requires pnpm and node. Run:

- `nvm install` (or use the node version specified in `.nvmrc`)
- `pnpm install`
- `pnpm run dev`

## Generate data file

To use this tool programmatically, do the following:

- Clone the repo
- edit the root `./src/constants.ts` file to change the usernames, place and taxon. Get these values from iNat.
- In the root, run: `npm install`
- Add a `"type": "module"` property-value to the package.json file.
- Run `npm run generate`. That should generate a `./dist/data.json` file with the results of the query.

It's not the prettiest output right now, but it gets the job done. The messages were really intended for the UI version,
not the command line. But hey, it works. :)

The data is of the following form. It's an unsorted object where the top level properties are the taxon of the
species. The count value represents the number of observations that have IDs by any of the users provided.

```json
{
   "47153":{
      "data":{
         "kingdom":"Animalia",
         "phylum":"Arthropoda",
         "subphylum":"Hexapoda",
         "class":"Insecta",
         "subclass":"Pterygota",
         "order":"Lepidoptera",
         "superfamily":"Tortricoidea",
         "family":"Tortricidae",
         "subfamily":"Olethreutinae",
         "tribe":"Grapholitini",
         "genus":"Cydia",
         "species":"Cydia pomonella"
      },
      "count":19
   },
   "47226":{
      "data":{
         "kingdom":"Animalia",
         "phylum":"Arthropoda",
         "subphylum":"Hexapoda",
         "class":"Insecta",
         "subclass":"Pterygota",
         "order":"Lepidoptera",
         "superfamily":"Papilionoidea",
         "family":"Papilionidae",
         "subfamily":"Papilioninae",
         "tribe":"Papilionini",
         "genus":"Papilio",
         "subgenus":"Pterourus",
         "species":"Papilio rutulus"
      },
      "count":7
   },
   ...
}
```

## <DataTable /> component

You'll need to be a developer for this bit.

The DataTable component is designed to render the JSON structure listed in the previous section. That renders the information in a table with links back to iNat for the species observations. Take a look at the `src/Standalone.js` file for an illustration of how you can tie it all together.

Here's how you use it, and what each prop means:

```jsx
<DataTable
  data={data}
  usernames={C.USERS}
  placeId={C.PLACE_ID}
  defaultVisibleCols={['superfamily', 'family', 'subfamily', 'tribe', 'genus', 'species']}
  hideControls={true}
  showCount={false}
  allowDownload={false}
/>
```

- **data**: the JSON structure as described in the previous section.
- **usernames**: a comma-delimited list of iNat usernames. These are the users you're treating as experts: they're the ones who have made the reviews in the given taxon.
- **placeId**: the iNat place ID.
- **defaultVisibleCols**: the raw JSON data contains information on all available ranks for each species. But in most cases that's probably superfluous information. Just pass the an array containing the ranks you want to show. This is the full list: `'kingdom', 'phylum', 'subphylum', 'class', 'subclass', 'order', 'superfamily', 'family', 'subfamily', 'tribe', 'subtribe', 'genus', 'subgenus', 'species'`
- **allowedCols**: if you haven't hidden the controls (see next prop), this controls which ranks should appear in the user interface.
- **hideControls**: this hides the control section at the top of the table to allow users to choose what ranks to view.
- **showCount**: this lets you hide a column that lists the number of observations that have been reviewed by the user list.
- **allowDownload**: this option controls whether an icon appears to let users download the full data.
