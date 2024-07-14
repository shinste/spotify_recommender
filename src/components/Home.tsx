import { useEffect, useState, useRef} from "react"
import axios from 'axios';
import Login from "./Login";
import Display from "./Display";
import Select from "./Select";
import Search from "./Search";
import Recommendation from "./Recommendation";
import Playlists from "./Playlists";
import SideBar from "./SideBar";


// Home Component
const Home: React.FC = () => {
    const [token, setToken] = useState('');
    const [personal, setPersonal] = useState<{[key: string]: string}>({username: '', id: ''})
    const [topArtists, setTopArtists] = useState<any[]>([]);
    const [topSongs, setTopSongs] = useState<any[]>([]);
    const [savedSongs, setSavedSongs] = useState<any[]>([]);
    const [selected, setSelected] = useState('All');
    const [searchArtists, setSearchArtists] = useState<any[]>([]);
    const [searchSongs, setSearchSongs] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [mute, setMute] = useState(false)
    const [recommended, setRecommended] = useState<any[]>([]);
    const [positions, setPositions] = useState<{[key: string]: {[key: string]: string}}>({"imageDrop1": {}, "imageDrop2": {}, "imageDrop3": {}, "imageDrop4": {}, "imageDrop5": {}});
    const [allIds, setAllIds] = useState<string[]>([]);
    const [order, setOrder] = useState<string[]>(["imageDrop1", "imageDrop2", "imageDrop3", "imageDrop4", "imageDrop5"])
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchCategory, setSearchCategory] = useState('track');
    const [addPlaylist, setAddPlaylist] = useState('');
    const [name, setName] = useState('');
    const [sidebar, setSidebar] = useState('home');
    const [playlistIndex, setPlaylistIndex] = useState<number | null>(null);
    const [playlistDisplay , setPlaylistDisplay] = useState<{[key: string] : any[]}>({});
    const playlistDivRef = useRef<HTMLDivElement>(null);
    const [displayOrder, setDisplayOrder] = useState<number[]>([]);

    useEffect(() => {
        const hash = window.location.hash;
        // let token: string | undefined | null = window.localStorage.getItem("token");
        let token: string | undefined | null
        if (!token && hash) {
            token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'))?.split('=')[1];
            window.location.hash = ""
            if (!token) {
                throw new Error("Token not found in localStorage");
            }
            window.localStorage.setItem("token", token)
        }
        if (token) {
            setToken(token);
            spotifyAPI('me/top/tracks', {limit: 20}, setTopSongs, token);
            spotifyAPI('me/top/artists', {limit: 20}, setTopArtists, token);
            spotifyAPI('me/tracks', {limit: 40}, setSavedSongs, token);
            spotifyAPI('me/playlists', {limit: 30}, setPlaylists, token);
            spotifyAPI('me', {}, console.log , token);
        } 
    }, []);    

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
    
    // sending to playlist through direct playlist focus or bringing up the playlist component
    const handleButtonClick = (uri: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
        if (playlistIndex) {
            spotifyAPI(`playlists/${playlists[playlistIndex].id}/tracks`,{uris: [uri], position: 0}, setPlaylists, undefined, name, true);
            setTimeout(function() {
                handlePlaylistFetch(playlists[playlistIndex].id, playlistIndex);
                console.log(playlists[playlistIndex].id, playlistIndex, 'playlist select')
            }, 100);
        } else {
            e.stopPropagation();
            setAddPlaylist(uri);
            setName(name);
            if (playlistDivRef.current) {
                playlistDivRef.current.style.display = 'block';
            }
                if (playlistDivRef.current && playlistDivRef.current.style.display === 'block') {
                    window.addEventListener('click', handleClickOutside);
                }
        }
    };
    
    // sending to playlist through playlist component or dragging
    const handleSendPlaylist = (id: string, name: string, index: number, uri?: string) => {
        if (!uri) {
            spotifyAPI(`playlists/${id}/tracks`,{uris: [addPlaylist], position: 0}, setPlaylists, undefined, name, true);
            setTimeout(function() {
                handlePlaylistFetch(id, index);
            }, 100);
            setAddPlaylist('');
            if (playlistDivRef.current) {
                playlistDivRef.current.style.display = 'none';
            }
            window.removeEventListener('click', handleClickOutside);
        } else {
            spotifyAPI(`playlists/${id}/tracks`,{uris: [uri], position: 0}, setPlaylists, undefined, name, true);
        }
        setTimeout(function() {
            handlePlaylistFetch(id, index);
        }, 3000);
    }


    const spotifyAPI = async (query: string, params: object, set: React.Dispatch<React.SetStateAction<any[]>>, temp?: string, playlistName?: string, post?: boolean) => {
        let access: string = token;
        if (temp) {
            access = temp;
        }
        try {
            if (post) {
                const response = await axios.post(`https://api.spotify.com/v1/${query}`,
                    params,
                    {
                    headers: {
                        Authorization: `Bearer ${access}`,
                    },
                    }
                )
                if (response.status === 200 || response.status === 201) {
                    if (playlistIndex) {
                        setSuccess(`Successfully added ${playlistName} to ${playlists[playlistIndex].name}`);
                    } else {
                        setSuccess(`Successfully added ${name} to ${playlistName}`);
                    }
                    
                }
            } else {
                const {data} = await axios.get(`https://api.spotify.com/v1/${query}`, {
                headers: {
                    Authorization: `Bearer ${access}`
                },
                params: params
                })
                if (query === 'me') {
                    const personalData = Object.fromEntries(
                        Object.entries(personal).map(([key, value]) =>
                            key === 'username' ? [key, data.display_name] : [key, data.id]
                        )
                    )
                    setPersonal(personalData);
                    getPlaylists(access);
                } else {
                    if (query === "search") {
                        if (data.tracks) {
                            set(data.tracks.items);
                        } else {
                            set(data.artists.items); 
                        }
                        
                    } else {
                        set(data.items);
                    }
                }
            }
        } catch(error) {
            console.log(error);
        }
    }

    const getPlaylists = async (token: string) => {
        try {
            const {data} = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            })
            setPlaylists(data.items);
        } catch(error) {
            console.log(error);
        }
    }

    function handleDrag(e: React.DragEvent, id: string, title: string, type: string, image: string, uri: string) {
        e.dataTransfer.setData('title', title);
        e.dataTransfer.setData('image', image);
        e.dataTransfer.setData('id', id);
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('uri', uri);
    }

    const handleAdd = (id: string, title: string, type: string, url: string, uri: string) => {
        const middleSlot = order[2];
        const openSlots = order.filter((value) => 
            Object.keys(positions[value]).length === 0
        )
        if (allIds.includes(id)) {
            setError('This track/artist is already added!');
        } else if (!openSlots[0]) {
            setError('You have reached your max number of tracks/artists!');
        } else {
            let insertSlot = openSlots[0];
            if (openSlots.includes(middleSlot)) {
                insertSlot = middleSlot;
            }
            setPositions(Object.fromEntries(
                Object.entries(positions).map(([key, value]) => 
                key === insertSlot ? [key, {url: url, seedId: id, type: type, title: title, uri: uri}] : [key, value]
            )))
            setAllIds([...allIds, id]);
        }
    }

    const handleSideBarClick = (index: number) => {
        console.log(index, playlistIndex, 'add index');
        setPlaylistIndex(index);
        setSelected('Playlists');
        scrollToPlaylist(String(index));
    }

    const handlePlaylistFetch = async (update?: string, index?: number) => {
        console.log(playlistIndex, 'should fetch');
        try {
            if ((playlistIndex !== null && !Object.keys(playlistDisplay).includes(String(playlistIndex))) || update) {
                const {data} = await axios.get(`https://api.spotify.com/v1/playlists/${playlistIndex !== null && !update ? playlists[playlistIndex].id: update}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        limit: 60,                        
                    }
                })
                if (update) {
                    setPlaylistDisplay(Object.fromEntries(
                        Object.entries(playlistDisplay).map(([key, value]) =>
                            key === String(index) ? [key, data.tracks.items] : [key, value]
                        )
                    ));

                    setDisplayOrder([...displayOrder]);
                } else if (playlistIndex !== null) {
                    setPlaylistDisplay((prevPlaylistDisplay) => ({
                        [playlistIndex] : data.tracks.items,
                        ...prevPlaylistDisplay,
                    }));
                    setDisplayOrder([playlistIndex, ...displayOrder]);
                }
            }
            if (!update) {
                scrollToPlaylist(String(playlistIndex));
            }
        } catch(error) {
            console.log(error);
        }
    }

    const scrollToPlaylist = (index: string) => {
        document.querySelector(`#playlistDisplay${index}`)
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    useEffect(() => {
        if (sidebar === "logout") {
            setToken('');
        }
        if (sidebar !== "playlist" && playlistIndex) {
            setPlaylistIndex(null);
        }
        if (sidebar === "home") {
            setSelected('All');
        }
    }, [sidebar])

    useEffect(() => {
        if (sidebar === "playlist" && playlistIndex !== null) {
            handlePlaylistFetch();
        }
    }, [playlistIndex])

    if (!token) {
        return (
            <Login/>
        )
    }
    return (
        <body className="Body-main Flex">
            <SideBar sidebar={sidebar} setSidebar={setSidebar} username={personal.username} playlist={playlists} handleSideBarClick={handleSideBarClick} handleSendPlaylist={handleSendPlaylist}/>
            <div id="Not-sidebar">
                {error && 
                    <div id="dismiss-alert" className="bg-red-50 border border-red-200 text-sm text-black-800 rounded-lg p-4 dark:bg-red-800/50 dark:border-red-900" role="alert" >
                        {error}
                    <button className="ml-3 dismissButton" onClick={() => setError('')}>X</button>
                </div>}
                {success && 
                    <div id="dismiss-notification" className="border border-green-200 text-sm text-black-800 rounded-lg p-4 dark:bg-green-800  dark:border-green-900 opacity-90">
                        {success}
                        <button className="ml-3 dismissButton" onClick={() => setSuccess('')}>X</button>
                    </div>}
                <Playlists name={name} playlistDivRef={playlistDivRef} playlists={playlists} personal={personal} handleSendPlaylist={handleSendPlaylist}/>
                <Recommendation token={token} order={order} setOrder={setOrder} allIds={allIds} positions={positions} setPositions={setPositions} setAllIds={setAllIds} recommended={recommended} setRecommended={setRecommended} setSelected={setSelected} mute={mute} setMute={setMute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''}/>
                
                <div id="scroll-main">
                    {sidebar !== 'search' && <Select setSelected={setSelected} selected={selected} setSidebar={setSidebar}/>}
                    {sidebar === 'search' && 
                        <Search spotifyAPI={spotifyAPI} setSearchSongs={setSearchSongs} setSearchArtists={setSearchArtists} searchCategory={searchCategory} setSearchCategory={setSearchCategory}/>         
                    }
                    <div className="Vertical-flex Main">
                        {selected === "Playlists" && Object.keys(playlistDisplay).length > 0 && 
                        displayOrder.map((value)=>{
                            return (
                                <div key={playlists[Number(value)].id} id={'playlistDisplay' + value}>
                                    <Display showcase={playlistDisplay[Number(value)]} title={playlists[Number(value)].name} reference={'playlistdisplay' + value} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''}/>
                                </div>
                            )
                        }
                        )}
                        {(searchSongs.length > 0 && searchCategory === "track" && (selected === "All" || selected === 'Search')) && <Display showcase={searchSongs} title={'Song Search Results'} setMute={setMute} mute={mute} reference={'songsearchresults'} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''}/>}
                        {(selected === "All" || selected === 'Most') && (sidebar !== 'search') && <Display showcase={topSongs} title={'Most Played Songs'} reference={'topsongs'} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''}/>}
                        {(selected === "All" || selected === 'Top') && (sidebar !== 'search') && <Display showcase={topArtists} title={'Your Top Artists'} reference={'topartists'} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''}/>}
                        {(selected === "All" || selected === 'Saved') && (sidebar !== 'search') && <Display showcase={savedSongs} title={'Saved Songs'} reference={'savedsongs'} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''}/>}
                        {(searchArtists.length > 0 && searchCategory === "artist") && sidebar === "search" && <Display showcase={searchArtists} title={'Artist Search Results'} setMute={setMute} mute={mute} reference={'artistsearchresults'} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} playlist={playlistIndex ? playlists[playlistIndex].name : ''}/>}
                    </div>
                </div>
            </div>
        </body>
    );
};

export default Home;