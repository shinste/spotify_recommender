import { useEffect, useState, useRef } from "react"
import Display from "./Display";
import Select from "./Select";
import Search from "./Search";
import Recommendation from "./Recommendation";
import Playlists from "./Playlists";
import SideBar from "./SideBar";
import useSidebar from "../hooks/useSidebar";
import useInitialAPIs from "../hooks/useInitialAPIs";
import usePlaylists from "../hooks/usePlaylists";
import useAdd from "../hooks/useAdd";
import * as CONSTANTS from '../constants/homeConstants'

interface HomeProps {
    authToken: string
    setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>
}

// Home Component
const Home: React.FC<HomeProps> = ({ authToken, setAuthToken }) => {
    const [selected, setSelected] = useState(CONSTANTS.SELECTED_ALL);
    const [mute, setMute] = useState(false)
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [trackSearchKey, setTrackSearchKey] = useState<string>('');
    const [artistSearchKey, setArtistSearchKey] = useState<string>('');

    const playlistDivRef = useRef<HTMLDivElement>(null);

    // Custom Hook to use API to get profile and playlist data
    const { personal, playlists } = useInitialAPIs(authToken, setAuthToken)

    // Custom Hook to create essential playlist logic and functions for other components to use
    const {
        handlePlaylistButtonClick, handlePlaylistFetch, handleSendPlaylist,
        handleSideBarClick, playlistDisplay, displayOrder, addedTrackName, playlistIndex, setPlaylistIndex
    } = usePlaylists(authToken, playlists, playlistDivRef, setSelected, setError, setSuccess, setAuthToken)

    // Custom Hook to handle sidebar logic
    const { sidebar, setSidebar } = useSidebar(playlistIndex, setPlaylistIndex, setAuthToken, setSelected);

    // Custom Hook to add tracks and artists to the seed selection
    const { handleAdd, order, setOrder, allIds, setAllIds, positions, setPositions } = useAdd(setError);

    // Allows search feature
    const handleSearch = (searchCategory: string, searchKey: string) => {
        if (searchCategory === 'track') {
            setTrackSearchKey(searchKey);
        } else {
            setArtistSearchKey(searchKey);
        }
    }

    useEffect(() => {
        // Fetching playlist items to display upon choosing a playlist 
        if (sidebar === CONSTANTS.SIDEBAR_PLAYLIST && playlistIndex !== null) {
            handlePlaylistFetch();
        }
    }, [playlistIndex]);

    return (
        <div className="Body-main Flex">
            <SideBar sidebar={sidebar} setSidebar={setSidebar} username={personal.username} playlist={playlists} handleSideBarClick={handleSideBarClick} handleSendPlaylist={handleSendPlaylist} />
            <div id="Not-sidebar">
                {error &&
                    <div id="dismiss-alert" className="bg-red-50 border border-red-200 text-sm rounded-lg p-4 dark:bg-red-800/50 dark:border-red-900" role="alert" >
                        {error}
                        <button className="ml-3 dismissButton" onClick={() => setError('')}>X</button>
                    </div>
                }
                {success &&
                    <div id="dismiss-notification" className="border border-green-200 text-sm text-black-800 rounded-lg p-4 dark:bg-green-800  dark:border-green-900 opacity-90">
                        {success}
                        <button className="ml-3 dismissButton" onClick={() => setSuccess('')}>X</button>
                    </div>
                }
                <Playlists name={addedTrackName} playlistDivRef={playlistDivRef} playlists={playlists} personal={personal.id} handleSendPlaylist={handleSendPlaylist} />
                <Recommendation order={order} setOrder={setOrder} token={authToken} allIds={allIds} positions={positions} setPositions={setPositions} setAllIds={setAllIds} setSelected={setSelected} mute={mute} setMute={setMute} handleButtonClick={handlePlaylistButtonClick} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''} setAuthToken={setAuthToken} authToken={authToken} />

                <div id="scroll-main">
                    {sidebar !== CONSTANTS.SIDEBAR_SEARCH &&
                        <Select setSelected={setSelected} selected={selected} />
                    }
                    {sidebar === CONSTANTS.SIDEBAR_SEARCH &&
                        <Search handleSearch={handleSearch} setArtistSearchKey={setArtistSearchKey} setTrackSearchKey={setTrackSearchKey} />
                    }
                    <div className="Vertical-flex Main">
                        {selected === CONSTANTS.SELECTED_PLAYLIST && Object.keys(playlistDisplay).length > 0 && sidebar !== CONSTANTS.SIDEBAR_SEARCH &&
                            displayOrder.map((value) => {
                                return (
                                    <div key={playlists[Number(value)].id} id={'playlistDisplay' + value}>
                                        <Display authToken={authToken} query={''} params={{}} showcase={playlistDisplay[Number(value)]} title={playlists[Number(value)].name} reference={'playlistdisplay' + value} setMute={setMute} mute={mute} handleButtonClick={handlePlaylistButtonClick} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''} setAuthToken={setAuthToken} />
                                    </div>
                                )
                            })
                        }
                        {trackSearchKey && (selected === CONSTANTS.SELECTED_ALL || selected === CONSTANTS.SELECTED_SEARCH) &&
                            <Display authToken={authToken} query={CONSTANTS.QUERY_SEARCH} params={{ q: trackSearchKey, limit: 10, type: CONSTANTS.CATEGORY_TRACK }} title={CONSTANTS.TITLE_SONG_SEARCH} setMute={setMute} mute={mute} reference={CONSTANTS.REFERENCE_SONG_SEARCH} handleButtonClick={handlePlaylistButtonClick} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''} setAuthToken={setAuthToken} />
                        }
                        {artistSearchKey && sidebar === CONSTANTS.SIDEBAR_SEARCH &&
                            <Display authToken={authToken} query={CONSTANTS.QUERY_SEARCH} params={{ q: artistSearchKey, limit: 10, type: CONSTANTS.CATEGORY_ARTIST }} title={CONSTANTS.TITLE_ARTIST_SEARCH} setMute={setMute} mute={mute} reference={CONSTANTS.REFERENCE_ARTIST_SEARCH} handleButtonClick={handlePlaylistButtonClick} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''} setAuthToken={setAuthToken} />
                        }
                        {(selected === CONSTANTS.SELECTED_ALL || selected === CONSTANTS.SELECTED_MOST) && (sidebar !== CONSTANTS.SIDEBAR_SEARCH) &&
                            <Display authToken={authToken} query={CONSTANTS.QUERY_TRACKS} params={{ limit: 20 }} title={CONSTANTS.TITLE_TOP_TRACKS} setMute={setMute} mute={mute} reference={CONSTANTS.REFERENCE_TOP_TRACKS} handleButtonClick={handlePlaylistButtonClick} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''} setAuthToken={setAuthToken} />
                        }
                        {(selected === CONSTANTS.SELECTED_ALL || selected === CONSTANTS.SELECTED_TOP) && (sidebar !== CONSTANTS.SIDEBAR_SEARCH) &&
                            <Display authToken={authToken} query={CONSTANTS.QUERY_ARTISTS} params={{ limit: 20 }} title={CONSTANTS.TITLE_TOP_ARTISTS} reference={CONSTANTS.REFERENCE_TOP_ARTISTS} setMute={setMute} mute={mute} handleButtonClick={handlePlaylistButtonClick} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''} setAuthToken={setAuthToken} />
                        }
                        {(selected === CONSTANTS.SELECTED_ALL || selected === CONSTANTS.SELECTED_SAVED) && (sidebar !== CONSTANTS.SIDEBAR_SEARCH) &&
                            <Display authToken={authToken} query={CONSTANTS.QUERY_SAVED} params={{ limit: 40 }} title={CONSTANTS.TITLE_SAVED} reference={CONSTANTS.REFERENCE_SAVED} setMute={setMute} mute={mute} handleButtonClick={handlePlaylistButtonClick} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''} setAuthToken={setAuthToken} />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
