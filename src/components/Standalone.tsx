import { useCallback, useEffect, useState } from 'react';
import Loader from './Loader';
import * as C from '../constants';
import DataTable from './DataTable';
import { unminifySpeciesData } from '../shared';
import { debounce } from 'debounce';

const Standalone = () => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('');
    const [debouncedFilter, setDebouncedFilter] = useState('');
    const [filteredData, setFilteredData] = useState({});

    const updateFilter = (e) => {
        setFilter(e.target.value);
        debounceVal(e.target.value);
    }

    const debounceVal = useCallback(
        debounce((val) => {
            setDebouncedFilter(val);
        }, 200),
        []
    );

    useEffect(() => {
        fetch(C.DATA_URL, {
            headers : {
                'Accept': 'application/json'
            },
        })
            .then((resp) => resp.json())
            .then((json) => {
                setLoaded(true);
                setData(unminifySpeciesData(json, C.VISIBLE_TAXONS));
            })
            .catch(() => setError(true));
    }, []);

    useEffect(() => {
        if (!debouncedFilter) {
            setFilteredData(data);
            return;
        }

        const newObj = {};
        const re = new RegExp(debouncedFilter, 'i');
        Object.keys(data).forEach((id) => {
            let found = false;
            Object.keys(data[id].data).forEach((taxon) => {
                if (re.test(data[id].data[taxon])) {
                    found = true;
                }
            });

            if (found) {
                newObj[id] = data[id];
            }
        });

        setFilteredData(newObj);
    }, [data, debouncedFilter]);

    if (!loaded) {
        return (
            <div className="inat-curated-species-standalone-loader">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <p>
                Sorry, there was an error loading the data.
            </p>
        );
    }

    const numFilteredItems = Object.keys(filteredData).length;

    return (
        <>
            <div className="inat-curated-species-filter">
                <label>Filter:</label>
                <input type="text" value={filter} onChange={updateFilter} />
                <span className="inat-curated-species-filter-counts"><b>{numFilteredItems} / {Object.keys(data).length}</b></span>
            </div>

            {!numFilteredItems && !!debouncedFilter && (
                <p>
                    No species found.
                </p>
            )}

            {numFilteredItems > 0 && (
                <DataTable
                    data={filteredData}
                    usernames={C.USERS}
                    placeId={C.PLACE_ID}
                    defaultVisibleCols={['superfamily', 'family', 'subfamily', 'tribe', 'species']}
                    hideControls={true}
                    showCount={false}
                    allowDownload={false}
                />
            )}
        </>
    );
}

export default Standalone;
