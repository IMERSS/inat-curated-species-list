import { describe, expect, test } from 'vitest';
import { getConfirmationDateAccountingForTaxonChanges } from './helpers';
import { Observation } from '../types/generator.types';

describe('getConfirmationDateAccountingForTaxonChanges', () => {
  const obs: Observation = {
    id: 999,
    observed_on_details: {
      date: '123',
    },
    created_at_details: {
      date: 'lll',
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
          name: 'Orthosia hibisci',
          rank: 'species',
          ancestors: [],
        },
      },
    ],
    taxon: {
      id: 0,
      rank: undefined,
      name: '',
      is_active: false,
    },
  };

  test('returning a single', () => {
    expect(getConfirmationDateAccountingForTaxonChanges(0, obs)).toEqual('2024-01-01');
  });
});
