import { useState } from "react";
import { getAPI } from "../functions/getAPI";

const useRecommend = (authToken: string, setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>, positions: { [key: string]: { [key: string]: string } }, setSelected: React.Dispatch<React.SetStateAction<string>>) => {
    const [recommended, setRecommended] = useState<any[]>([]);
    const recommend = async () => {
        const seedSongs = Object.entries(positions).map(([key, value]) =>
            value.type === "track" && value.seedId).filter(Boolean);

        const seedArtists = Object.entries(positions).map(([key, value]) =>
            value.type === "artist" && value.seedId).filter(Boolean);
        const seedParams = {
            seed_tracks: seedSongs.join(','),
            seed_artists: seedArtists.join(','),
            limit: 20
        }
        const data = await getAPI(authToken, 'recommendations', seedParams, setAuthToken)
        setRecommended(data.tracks);
        setSelected('All');
    };
    return { recommended, recommend, setRecommended }
}

export default useRecommend;