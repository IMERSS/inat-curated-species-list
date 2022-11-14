import React, { useEffect, useState } from 'react';
import styles from './DataTable.module.css';
import Box from '@mui/material/Box';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { firstBy } from 'thenby';
import { capitalizeFirstLetter } from './shared';

const baseSiteUrl = 'https://www.inaturalist.org/observations';

const ColControls = ({ cols, visibleCols, onChange, downloadData, allowDownload }) => (
    <Box className={`${styles.controls} inat-curated-species-table-controls`}>
        <div>
            <h4>Visible Ranks</h4>
            {cols.map((col) => (
                <div key={`col-${col}`} style={{ display: 'inline-block' }}>
                    <input
                        type="checkbox"
                        id={`control-${col}`}
                        checked={visibleCols.indexOf(col) !== -1}
                        onChange={(e) => {
                            if (e.target.checked) {
                                onChange([ ...visibleCols, col]);
                            } else {
                                onChange(visibleCols.filter((a) => a !== col));
                            }
                        }}
                    />
                    <label htmlFor={`control-${col}`}>{col}</label>
                </div>
            ))}
        </div>
        {allowDownload && (
            <a href="#" title="Download data" onClick={(e) => {
                e.preventDefault();
                getCsvContent(downloadData);
            }}>
                <DownloadForOfflineIcon fontSize="large" />
            </a>
        )}
    </Box>
);

const getCsvContent = (rows) => {
    let csvContent = "data:text/csv;charset=utf-8,"
        + rows.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "taxon-data.csv");
    document.body.appendChild(link);

    link.click();
};

const DataTable = ({
    data,
    usernames,
    placeId,
    allowedCols = [
        'kingdom', 'phylum', 'subphylum', 'class', 'subclass', 'order', 'superfamily', 'family', 'subfamily', 'tribe',
        'subtribe', 'genus', 'subgenus', 'species', 'subspecies'
    ],
    defaultVisibleCols= ['superfamily', 'family', 'subfamily', 'tribe', 'subtribe', 'genus', 'subgenus', 'species', 'subspecies'],
    showCount = true,
    allowDownload = true,
    hideControls = false
}) => {
    const [sortedData, setSortedData] = useState([]);
    const [downloadData, setDownloadData] = useState([]);
    const [visibleCols, setVisibleCols] = useState(defaultVisibleCols);

    useEffect(() => {
        if (!data) {
            return;
        }

        const arr = Object.keys(data).map((taxonId) => ({ ...data[taxonId], taxonId }));
        let sorted = null;
        const csvData = [];
        visibleCols.forEach((visibleCol) => {
            if (!sorted) {
                sorted = firstBy((a) => a.data[visibleCol] || 'Zzzzz', { direction: 'asc' });
            } else {
                sorted = sorted.thenBy((a) => a.data[visibleCol] || 'Zzzzz', { direction: 'asc' });
            }
        });

        if (sorted) {
            arr.sort(sorted);
            setSortedData(arr);

            const titleRow = [];
            visibleCols.forEach((col) => {
                titleRow.push(capitalizeFirstLetter(col));
            });
            csvData.push(titleRow);

            arr.forEach((a) => {
                const row = [];
                visibleCols.forEach((col) => {
                    row.push(a.data[col] ? a.data[col] : '');
                });
                csvData.push(row);
            });

            setDownloadData(csvData);
        }
    }, [data, visibleCols]);

    // this ensures correct sorting of the taxonomical levels in the table
    const onChange = (cols) => {
        setVisibleCols(orderedCols.filter((col) => cols.indexOf(col) !== -1));
    };

    if (!sortedData.length) {
        return null;
    }

    const orderedCols = allowedCols;

    return (
        <>
            {!hideControls && (
                <ColControls
                    cols={orderedCols}
                    visibleCols={visibleCols}
                    onChange={onChange}
                    downloadData={downloadData}
                    allowDownload={allowDownload}
                />
            )}
            <table className={`${styles.table} inat-curated-species-table`} cellSpacing={0} cellPadding={2}>
                <thead>
                <tr key="header">
                    <th></th>
                    {visibleCols.map((rank) => <th key={rank}>{rank}</th>)}
                    {showCount && <th></th>}
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map((row, index) => (
                    <tr key={row.taxonId}>
                        <td><b>{index+1}</b></td>
                        {visibleCols.map((currentRank) => (
                            <td key={`${row.taxonId}-${currentRank}`}>{row.data[currentRank] ? row.data[currentRank] : ''}</td>
                        ))}
                        {showCount && <td>({row.count})</td>}
                        <td style={{ display: 'flex'}}>
                            <a href={`${baseSiteUrl}?ident_user_id=${usernames}&place_id=${placeId}&taxon_id=${row.taxonId}&verifiable=any`} target="_blank" rel="noreferrer">
                                <VisibilityIcon />
                            </a>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
};

export default DataTable;
