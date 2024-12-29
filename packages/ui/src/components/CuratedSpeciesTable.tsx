import { FC, useCallback, useEffect, useState } from 'react';
import { Loader } from './Loader.js';
import { DataTable } from './DataTable.js';
import debounce from 'debounce';
import {
  unminifySpeciesData,
  CuratedSpeciesData,
  CuratedSpeciesDataMinified,
  Taxon,
} from '@imerss/inat-curated-species-list-common';

export interface CuratedSpeciesTableProps {
  readonly dataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
}

/**
 * This component is bundled separately and included as a separate self-contained javascript file in the build artifacts.
 *
 * See the documentation on how this component can use used. But the basic idea is that consumers would define a global object
 * containing the data it needs.
 */
export const CuratedSpeciesTable: FC<CuratedSpeciesTableProps> = ({ dataUrl, curatorUsernames, placeId }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<CuratedSpeciesData | undefined>();
  const [taxons, setTaxons] = useState<Taxon[]>();
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [filteredData, setFilteredData] = useState<CuratedSpeciesData | undefined>();

  const updateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    debounceVal(e.target.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceVal = useCallback(
    debounce((val) => {
      setDebouncedFilter(val);
    }, 200),
    [],
  );

  useEffect(() => {
    fetch(dataUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((minifiedData: CuratedSpeciesDataMinified) => {
        setTaxons(minifiedData.taxons);
        setData(unminifySpeciesData(minifiedData));
        setLoaded(true);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (!debouncedFilter) {
      setFilteredData(data);
      return;
    }

    const newObj = {};
    const re = new RegExp(debouncedFilter, 'i');
    Object.keys(data).forEach((id) => {
      let found = false;
      Object.keys(data[id]!.data).forEach((taxon) => {
        // @ts-ignore-next-line
        if (re.test(data[id].data[taxon])) {
          found = true;
        }
      });

      if (found) {
        // @ts-ignore-next-line
        newObj[id] = data[id];
      }
    });

    setFilteredData(newObj);
  }, [data, debouncedFilter]);

  if (!loaded || !data || !filteredData || !taxons) {
    return (
      <div className="inat-curated-species-standalone-loader">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <p>Sorry, there was an error loading the data.</p>;
  }

  const numFilteredItems = Object.keys(filteredData).length;

  return (
    <>
      <div className="inat-curated-species-filter">
        <label>Filter:</label>
        <input type="text" value={filter} onChange={updateFilter} />
        <span className="inat-curated-species-filter-counts">
          <b>
            {numFilteredItems} / {Object.keys(data).length}
          </b>
        </span>
      </div>

      {!numFilteredItems && !!debouncedFilter && <p>No species found.</p>}

      {numFilteredItems > 0 && (
        <DataTable
          data={filteredData}
          taxons={taxons}
          curatorUsernames={curatorUsernames}
          placeId={placeId}
          hideControls={true}
          showCount={false}
          allowDownload={false}
        />
      )}
    </>
  );
};
