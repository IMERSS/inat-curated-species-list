// import { useCallback, useEffect, useState } from 'react';
// import { Loader } from './Loader.js';
// // import * as C from '../constants.js';
// import { DataTable } from './DataTable.js';
// // import { unminifySpeciesData } from '../utils/generator';
// import debounce from 'debounce';

// /**
//  * This component is bundled separately and included as a separate self-contained javascript file in the build artifacts.
//  *
//  * See the documentation on how this component can use used. But the basic idea is that consumers would define a global object
//  * containing the data it needs.
//  */
// export const Standalone = () => {
//   const [loaded, setLoaded] = useState(false);
//   const [error, setError] = useState(false);
//   const [data] = useState([]);
//   const [filter, setFilter] = useState('');
//   const [debouncedFilter, setDebouncedFilter] = useState('');
//   const [filteredData, setFilteredData] = useState({});

//   const updateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFilter(e.target.value);
//     debounceVal(e.target.value);
//   };

//   const debounceVal = useCallback(
//     debounce((val) => {
//       setDebouncedFilter(val);
//     }, 200),
//     [],
//   );

//   // useEffect(() => {
//   //   fetch(C.DATA_URL, {
//   //     headers: {
//   //       Accept: 'application/json',
//   //     },
//   //   })
//   //     .then((resp) => resp.json())
//   //     .then(() => {
//   //       // json
//   //       setLoaded(true);
//   //       // setData(unminifySpeciesData(json, C.DEFAULT_VISIBLE_TAXONS));
//   //     })
//   //     .catch(() => setError(true));
//   // }, []);

//   useEffect(() => {
//     if (!debouncedFilter) {
//       setFilteredData(data);
//       return;
//     }

//     const newObj = {};
//     const re = new RegExp(debouncedFilter, 'i');
//     Object.keys(data).forEach((id) => {
//       let found = false;
//       // @ts-ignore-next-line
//       Object.keys(data[id].data).forEach((taxon) => {
//         // @ts-ignore-next-line
//         if (re.test(data[id].data[taxon])) {
//           found = true;
//         }
//       });

//       if (found) {
//         // @ts-ignore-next-line
//         newObj[id] = data[id];
//       }
//     });

//     setFilteredData(newObj);
//   }, [data, debouncedFilter]);

//   if (!loaded) {
//     return (
//       <div className="inat-curated-species-standalone-loader">
//         <Loader />
//       </div>
//     );
//   }

//   if (error) {
//     return <p>Sorry, there was an error loading the data.</p>;
//   }

//   const numFilteredItems = Object.keys(filteredData).length;

//   return (
//     <>
//       <div className="inat-curated-species-filter">
//         <label>Filter:</label>
//         <input type="text" value={filter} onChange={updateFilter} />
//         <span className="inat-curated-species-filter-counts">
//           <b>
//             {numFilteredItems} / {Object.keys(data).length}
//           </b>
//         </span>
//       </div>

//       {!numFilteredItems && !!debouncedFilter && <p>No species found.</p>}

//       {numFilteredItems > 0 && (
//         <DataTable
//           data={filteredData}
//           allowedCols={['family']}
//           curatorUsernames="123"
//           placeId={1234}
//           defaultVisibleCols={['superfamily', 'family', 'subfamily', 'tribe', 'species']}
//           hideControls={true}
//           showCount={false}
//           allowDownload={false}
//         />
//       )}
//     </>
//   );
// };

export const Standalone = () => null;
