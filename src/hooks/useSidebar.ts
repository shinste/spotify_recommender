import { useEffect, useState } from "react";

const useSidebar = (playlistIndex: number | null, setPlaylistIndex: React.Dispatch<React.SetStateAction<number | null>>, setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>, setSelected: React.Dispatch<React.SetStateAction<string>>) => {
    const [sidebar, setSidebar] = useState('home');
    useEffect(() => {
        // Wipes local access token sending user to login
        if (sidebar === "logout") {
            setAuthToken('');
            window.localStorage.removeItem('token');
        }
        // Takes user out of quick playlist add mode
        if (sidebar !== "playlist" && playlistIndex) {
            setPlaylistIndex(null);
        }
        // Takes user to Home
        if (sidebar === "home") {
            setSelected('All');
        }
    }, [sidebar, playlistIndex]);
    return { sidebar, setSidebar }
}

export default useSidebar;