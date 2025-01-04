import { nanoid } from 'nanoid';
import { Taxon, TaxonomyMap } from '@imerss/inat-curated-species-list-common';
import { Identification, INatTaxonAncestor, Observation } from '../types/generator.types';

export const formatNum = (num: number) => new Intl.NumberFormat('en-US').format(num);

type Keys = {
  [key: string]: boolean;
};

const generatedKeys: Keys = {};
let currKeyLength = 1;

/**
 * Helper method used for data minimization. It returns a unique key of the shortest length available.
 *
 * This method could be improved.
 */
export const getShortestUniqueKey: () => string = () => {
  let key = '';
  for (let i = 0; i < 20; i++) {
    const currKey = nanoid(currKeyLength);
    if (!generatedKeys[currKey]) {
      key = currKey;
      generatedKeys[currKey] = true;
      break;
    }
  }
  if (key) {
    return key;
  }
  currKeyLength++;

  return getShortestUniqueKey();
};

export const getTaxonomy = (ancestors: INatTaxonAncestor[], taxonsToReturn: Taxon[]): TaxonomyMap =>
  ancestors.reduce((acc, curr) => {
    if (taxonsToReturn.indexOf(curr.rank) !== -1) {
      acc[curr.rank] = curr.name;
    }
    return acc;
  }, {} as TaxonomyMap);

// TODO taxon switches. Example: https://www.inaturalist.org/observations/143778176

/*

Scenario
--------

Here it was uploaded on Dec 5th, 2022 and approved the same day by a curator. 
In Jan 2023 there was a taxon change, so the OLD identification entries now get a new date. 

This is why it's appearing in the results, even though it was added to our checklist prior before our start date. 

Question: how to accurately map a confirmed observation by a curator over potentially multiple taxon changes? 
  
For that, a taxon change observation has `taxon_change` data + previous_observation_taxon data. Every observation with the 
old taxon gets a new entry flagged as a "taxon_change", but only the first identification added as part of the taxon change
(i.e. the original observation that first selected the now older taxon) will have a previous_observation_taxon with the ID 
of the previous taxon.

So basically just create a data structure that finds the original DATE of the confirmation observation. Then:
- ignore the entry if it's before the start date. 
- if it's AFTER, add it to the list of 


previous_observation_taxon: { id: [taxon ID] }

taxon.is_active: false
taxon_change?: { 
  id: number;
  type: 'TaxonSwap'
}

*/

export const getConfirmationDateAccountingForTaxonChanges = (
  curatorIdentificationIndex: number,
  obs: Observation,
): string => {
  const curatorConfirmationDate = obs.identifications[curatorIdentificationIndex].created_at;

  // if this observation wasn't part of a taxon swap, we're good. Just return the confirmation date
  if (!obs.identifications[curatorIdentificationIndex].taxon_change) {
    return curatorConfirmationDate;
  }

  // now for the rest of the logic...

  return null;
};
