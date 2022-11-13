import { useEffect, useState } from "react";
import * as C from './constants';
import DataTable from './DataTable.component';


const Standalone = () => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`./${C.GENERATED_FILENAME}`, {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then((resp) => resp.json())
            .then((json) => {
                setLoaded(true);
                setData(json);
            })
            .catch(() => setError(true));
    }, []);

    if (!loaded) {
        return null;
    }

    if (error) {
        return (
            <p>
                Sorry, there was an error loading the data.
            </p>
        );
    }

    return (
        <DataTable
            data={data}
            usernames={C.USERS}
            placeId={C.PLACE_ID}
            allowedCols={[
                'superfamily', 'family', 'subfamily', 'tribe', 'subtribe', 'genus', 'subgenus', 'species', 'subspecies'
            ]}
            showCount={false}
            allowDownload={false}
        />
    );
}

export default Standalone;
