# inat-curated-species-list

A tool to query iNaturalist for all observations made by one or more users in a specific taxon and place, and derive a curated list of all unique species, along with the option to download it. This allows you to create tailored list of species that have been approved by a group of experts, rather than rely on the community "research grade" standard.

### Demo

You can [access the script here](https://imerss.github.io/inat-curated-species-list/), but if you're a dev, please download it and run it locally. 

<kbd>
  <img src="./resources/screenshot.png" />
</kbd>

                                             
## Run locally

The script requires npm and node. Run:

- `nvm install` (or use the node version specified in `.nvmrc`)
- `npm install`
- `npm run start`


## Generate data file

To use this tool programmatically, do the following:

- Clone the repo
- edit the root `./src/constants.js` file to change the usernames, place and taxon. Get these values from iNat.
- In the root, run: `npm install`
- Add a `"type": "module"` property-value to the package.json file.
- Run `npm run generate`. That should generate a `./dist/data.json` file with the results of the query.

It's not the prettiest output right now, but it gets the job done. The messages were really intended for the UI version, 
not the command line. But hey, it works. :) 

The data is of the following form. It's an unsorted object where the top level properties are the taxon of the
species/subspecies. The count value represents the number of observations that have IDs by any of the users provided.

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
