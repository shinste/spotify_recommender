import { useCallback, useState } from "react";
import { getAPI } from "../functions/getAPI";
import { postAPI } from "../functions/postAPI";

const usePlaylists = (authToken: string, playlists: any[], playlistDivRef: React.RefObject<HTMLDivElement>, setSelected: React.Dispatch<React.SetStateAction<string>>, setError: React.Dispatch<React.SetStateAction<string>>, setSuccess: React.Dispatch<React.SetStateAction<string>>, setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>) => {
    const [playlistDisplay, setPlaylistDisplay] = useState<{ [key: string]: any[] }>({});
    const [displayOrder, setDisplayOrder] = useState<number[]>([]);
    const [addPlaylistUri, setAddPlaylistUri] = useState('');
    const [addedTrackName, setAddedTrackName] = useState('');
    const [playlistIndex, setPlaylistIndex] = useState<number | null>(null);


    // Fetching the actual playlist items from the specified playlist
    const handlePlaylistFetch = async (update?: string, index?: number) => {
        try {
            // Will only execute if a playlist has been chosen and it hasn't been fetched yet, or it is a playlist that must be updated
            if ((playlistIndex !== null && !Object.keys(playlistDisplay).includes(String(playlistIndex))) || update) {
                const data = await getAPI(authToken, `playlists/${playlistIndex !== null && !update ? playlists[playlistIndex].id : update}`, { limit: 60 }, setAuthToken)
                // Update playlist because user added to this one
                if (update) {
                    setPlaylistDisplay(Object.fromEntries(
                        Object.entries(playlistDisplay).map(([key, value]) =>
                            key === String(index) ? [key, data.tracks.items] : [key, value]
                        )
                    ));
                    setDisplayOrder([...displayOrder]);
                } else if (playlistIndex !== null) {
                    setPlaylistDisplay((prevPlaylistDisplay) => ({
                        [playlistIndex]: data.tracks.items,
                        ...prevPlaylistDisplay,
                    }));
                    setDisplayOrder([playlistIndex, ...displayOrder]);
                }
            }
            if (!update) {
                scrollToPlaylist(String(playlistIndex));
            }
        } catch (error) {
            console.log(error);
        }
    };

    // when user presses button, sends to playlist or brings up playlist selection
    const handlePlaylistButtonClick = useCallback(async (uri: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
        if (playlistIndex) {
            handleSendPlaylist(playlists[playlistIndex].id, name, playlistIndex, uri)
        } else {
            e.stopPropagation();
            setAddPlaylistUri(uri);
            setAddedTrackName(name);
            if (playlistDivRef.current) {
                playlistDivRef.current.style.display = 'block';
            }
            if (playlistDivRef.current && playlistDivRef.current.style.display === 'block') {
                window.addEventListener('click', handleClickOutside);
            }
        }
    }, [playlistIndex, playlists])

    // sending to playlist through playlist component or dragging
    const handleSendPlaylist = useCallback(async (id: string, name: string, index: number, uri?: string) => {
        const responseCode = await postAPI(authToken, id, uri ? uri : addPlaylistUri);
        if (responseCode === 200 || responseCode === 201) {
            if (playlistIndex) {
                setSuccess(`Successfully added ${name} to ${playlists[playlistIndex].name}`);
            } else {
                setSuccess(`Successfully added ${addedTrackName} to ${playlists[index].name}`);
            }
        } else {
            setError(`Something went wrong with adding to this playlist, Error ${responseCode}`)
        }
        setTimeout(function () {
            handlePlaylistFetch(id, index);
        }, 1000);
        if (!uri) {
            setAddPlaylistUri('');
            if (playlistDivRef.current) {
                playlistDivRef.current.style.display = 'none';
            }
            window.removeEventListener('click', handleClickOutside);
        }
    }, [handlePlaylistFetch]);

    const handleSideBarClick = useCallback((index: number) => {
        setPlaylistIndex(index);
        setSelected('Playlists');
        scrollToPlaylist(String(index));
    }, []);

    const scrollToPlaylist = (index: string) => {
        document.querySelector(`#playlistDisplay${index}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    };

    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (playlistDivRef.current && playlistDivRef.current.contains(target)) {
        } else {
            if (playlistDivRef.current) {
                playlistDivRef.current.style.display = 'none';
            }
            window.removeEventListener('click', handleClickOutside);
        }
    };
    return { handlePlaylistButtonClick, handlePlaylistFetch, handleSendPlaylist, handleSideBarClick, playlistDisplay, displayOrder, addedTrackName, playlistIndex, setPlaylistIndex }
}

export default usePlaylists;