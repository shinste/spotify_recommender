import { useEffect, useState } from "react";
import { getAPI } from "../functions/getAPI";
const useInitialAPIs = (authToken: string, setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>) => {
    const [personal, setPersonal] = useState<{ [key: string]: string }>({ username: '', id: '' })
    const [playlists, setPlaylists] = useState<any[]>([]);

    const handleInitialAPIs = async () => {
        const playlistData = await getAPI(authToken, 'me/playlists', { limit: 30 }, setAuthToken);
        setPlaylists(playlistData.items);
        const profileData = await getAPI(authToken, 'me', {}, setAuthToken);
        const personalData = Object.fromEntries(
            Object.entries(personal).map(([key]) =>
                key === 'username' ? [key, profileData.display_name] : [key, profileData.id]
            )
        )
        setPersonal(personalData);
        getPlaylists();
    }

    const getPlaylists = async () => {
        try {
            const data = await getAPI(authToken, 'me/playlists', {}, setAuthToken)
            setPlaylists(data.items);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        handleInitialAPIs();
    }, []);

    return { personal, playlists }
}

export default useInitialAPIs;