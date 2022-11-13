import { useEffect, useState } from "react";
import * as C from '../constants';
import DataTable from './DataTable.component';


const Standalone = () => {
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`./${C.GENERATED_FILENAME}`)
            .then((a) => {
                console.log(a);
            });
    }, []);

    if (!loaded) {
        return null;
    }

    return (
        <DataTable data={data} usernames={C.USERS} placeId={C.PLACE_ID} />
    );
}

export default Standalone;
