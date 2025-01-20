import { describe, expect, test } from 'vitest';
import { getConfirmationDateAccountingForTaxonChanges } from './helpers';
import { Observation } from '../types/generator.types';

describe('getConfirmationDateAccountingForTaxonChanges', () => {
  test('when the curator identification is not a taxon change, it returns the date', () => {
    const obs: Observation = {
      id: 999,
      observed_on_details: {
        date: '2023-02-18',
      },
      created_at_details: {
        date: '2023-02-18',
      },
      user: {
        login: 'observer-bob',
        name: 'Bob',
        id: 5,
      },
      identifications: [
        {
          taxon_id: 123,
          taxon_change: null,
          created_at: '2024-01-01',
          current: true,
          user: {
            login: 'curator-jim',
          },
          taxon: {
            id: 999,
            name: 'Orthosia hibisci',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 123,
            name: 'previous species',
            rank: 'species',
          },
        },
      ],
      taxon: {
        id: 0,
        rank: undefined,
        name: '',
        is_active: true,
      },
    };

    const taxonChanges = [];
    expect(getConfirmationDateAccountingForTaxonChanges(0, obs, taxonChanges)).toEqual({
      deprecatedTaxonIds: [],
      originalConfirmationDate: '2024-01-01',
    });
  });

  test('when first `current` curator identification is from a single taxon change with 2 original obs, it returns the original confirmation date', () => {
    const obs: Observation = {
      id: 999,
      observed_on_details: {
        date: '2023-02-18',
      },
      created_at_details: {
        date: '2023-02-18',
      },
      user: {
        login: 'observer-bob',
        name: 'Bob',
        id: 5,
      },
      identifications: [
        // [0]: original correct observation by observer-bob
        {
          taxon_id: 126207,
          taxon_change: null,
          created_at: '2023-01-01',
          current: false,
          user: {
            login: 'observer-bob',
          },
          taxon: {
            id: 2222,
            name: 'Schizura unicornis',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 126207,
            name: 'previous species',
            rank: 'species',
          },
        },
        // [1]: confirmed observation by curator-jim
        {
          taxon_id: 126207,
          taxon_change: null,
          created_at: '2023-05-05',
          current: false,
          user: {
            login: 'curator-jim',
          },
          taxon: {
            id: 1357,
            name: 'Schizura unicornis',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 126207,
            name: 'previous species',
            rank: 'species',
          },
        },
        // [2]: first auto-generated taxon swap observation for observer-bob's record
        {
          taxon_id: 1373714,
          taxon_change: {
            id: 135,
            type: 'TaxonSwap',
          },
          created_at: '2023-01-01',
          current: true,
          user: {
            login: 'observer-bob',
          },
          taxon: {
            id: 135,
            name: 'Schizura unicornis',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 126207,
            name: 'previous species',
            rank: 'species',
          },
        },
        // [3]: second auto-generated taxon swap observation for curator-jims's record
        {
          taxon_id: 1373714,
          taxon_change: {
            id: 135,
            type: 'TaxonSwap',
          },
          created_at: '2025-01-01',
          current: true,
          user: {
            login: 'curator-jim',
          },
          taxon: {
            id: 12345,
            name: 'Coelodasys unicornis',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 1373714,
            name: 'previous species',
            rank: 'species',
          },
        },
      ],
      taxon: {
        id: 0,
        rank: undefined,
        name: '',
        is_active: true,
      },
    };

    const taxonChanges = [];
    expect(getConfirmationDateAccountingForTaxonChanges(3, obs, taxonChanges)).toEqual({
      deprecatedTaxonIds: [126207],
      originalConfirmationDate: '2023-05-05',
    });
  });

  test('when there are 2 taxon changes, returns old taxon IDs and the original confirmation date', () => {
    const obs: Observation = {
      id: 999,
      observed_on_details: {
        date: '2023-02-18',
      },
      created_at_details: {
        date: '2023-02-18',
      },
      user: {
        login: 'observer-bob',
        name: 'Bob',
        id: 5,
      },
      identifications: [
        // [0]: confirmed observation by curator-jim
        {
          taxon_id: 1,
          taxon_change: null,
          created_at: '2023-01-01',
          current: false,
          user: {
            login: 'curator-jim',
          },
          taxon: {
            id: 4,
            name: 'Schizura unicornis',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 1,
            name: 'taxon',
            rank: 'species',
          },
        },
        // [1]: auto-generated taxon swap observation for curator-jims's record
        {
          taxon_id: 2,
          taxon_change: {
            id: 135,
            type: 'TaxonSwap',
          },
          created_at: '2024-01-01',
          current: false,
          user: {
            login: 'curator-jim',
          },
          taxon: {
            id: 5,
            name: 'Coelodasys unicornis',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 1,
            name: 'taxon',
            rank: 'species',
          },
        },
        // [2]: second auto-generated taxon swap observation for curator-jims's record
        {
          taxon_id: 3,
          taxon_change: {
            id: 136,
            type: 'TaxonSwap',
          },
          created_at: '2025-01-01',
          current: true,
          user: {
            login: 'curator-jim',
          },
          taxon: {
            id: 6,
            name: 'Coelodasys totallymadeupius',
            rank: 'species',
            ancestors: [],
          },
          previous_observation_taxon: {
            id: 2,
            name: 'taxon',
            rank: 'species',
          },
        },
      ],
      taxon: {
        id: 0,
        rank: undefined,
        name: '',
        is_active: true,
      },
    };

    const taxonChanges = [];
    expect(getConfirmationDateAccountingForTaxonChanges(2, obs, taxonChanges)).toEqual({
      deprecatedTaxonIds: [2, 1],
      originalConfirmationDate: '2023-01-01',
    });
  });
});
