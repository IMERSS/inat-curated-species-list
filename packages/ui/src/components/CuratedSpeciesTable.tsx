import { FC, useCallback, useEffect, useState } from 'react';
import { Loader } from './Loader';
import { DataTable } from './DataTable';
import debounce from 'debounce';
import {
  unminifySpeciesData,
  CuratedSpeciesData,
  CuratedSpeciesDataMinified,
  Taxon,
  TaxonomyMap,
} from '@imerss/inat-curated-species-list-common';

export interface CuratedSpeciesTableProps {
  readonly dataUrl: string;
  readonly curatorUsernames: string[];
  readonly placeId: number;
  readonly showRowNumbers?: boolean;
  readonly showReviewerCount?: boolean;
}

export const CuratedSpeciesTable: FC<CuratedSpeciesTableProps> = ({
  dataUrl,
  curatorUsernames,
  placeId,
  showRowNumbers,
  showReviewerCount,
}) => {
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
  }, [dataUrl]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (!debouncedFilter) {
      setFilteredData(data);
      return;
    }

    const newObj: CuratedSpeciesData = {};
    const re = new RegExp(debouncedFilter, 'i');
    Object.keys(data).forEach((id) => {
      let found = false;
      Object.keys(data[id]!.data).forEach((taxon) => {
        if (re.test(data[id]!.data[taxon as Taxon])) {
          found = true;
        }
      });

      if (found) {
        newObj[id] = data[id] as {
          data: TaxonomyMap;
          count: number;
        };
      }
    });

    setFilteredData(newObj);
  }, [data, debouncedFilter]);

  if ((!loaded || !data || !filteredData || !taxons) && !error) {
    return (
      <div className="inat-curated-species-standalone-loader">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <p>Sorry, there was an error loading the data.</p>;
  }

  const numFilteredItems = Object.keys(filteredData!).length;

  return (
    <>
      <div className="inat-curated-species-filter">
        <label>Filter:</label>
        <input type="text" value={filter} onChange={updateFilter} />
        <span className="inat-curated-species-filter-counts">
          <b>
            {numFilteredItems} / {Object.keys(data!).length}
          </b>
        </span>
      </div>

      {!numFilteredItems && !!debouncedFilter && <p>No species found.</p>}

      {numFilteredItems > 0 && (
        <DataTable
          data={filteredData!}
          taxons={taxons!}
          curatorUsernames={curatorUsernames}
          placeId={placeId}
          showRowNumbers={showRowNumbers}
          showReviewerCount={showReviewerCount}
          allowDownload={false}
        />
      )}
    </>
  );
};
