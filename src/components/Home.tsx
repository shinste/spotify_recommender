import { useEffect, useState, useRef} from "react"
import axios from 'axios';
import Login from "./Login";
import Display from "./Display";
import Select from "./Select";
import Search from "./Search";
import Recommendation from "./Recommendation";
import Playlists from "./Playlists";


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
    const [playlistName, setPlaylistName] = useState('');

    const playlistDivRef = useRef<HTMLDivElement>(null);

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
            spotifyAPI('me/tracks', {limit: 30}, setSavedSongs, token);
            spotifyAPI('me/playlists', {limit: 30}, setPlaylists, token);
            spotifyAPI('me', {}, console.log , token);
        } 
    }, []);    

    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        console.log('click at all')
        if (playlistDivRef.current && playlistDivRef.current.contains(target)) {
            
        } else {
          console.log('im clicking outside and the thing should close');
          if (playlistDivRef.current) {
            playlistDivRef.current.style.display = 'none';
          }
          window.removeEventListener('click', handleClickOutside);
        }
    };
    
    const handleButtonClick = (uri: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => {
        e.stopPropagation();
        setAddPlaylist(uri);
        setName(name);
        if (playlistDivRef.current) {
            playlistDivRef.current.style.display = 'block';
        }
            if (playlistDivRef.current && playlistDivRef.current.style.display === 'block') {
                window.addEventListener('click', handleClickOutside);
            }
    };
    
    const handleSendPlaylist = (id: string, name: string) => {
        spotifyAPI(`playlists/${id}/tracks`,{uris: [addPlaylist], position: 0}, console.log);
        setAddPlaylist('');
        setPlaylistName(name);
        if (playlistDivRef.current) {
            playlistDivRef.current.style.display = 'none';
        }
        window.removeEventListener('click', handleClickOutside);
        console.log('should be removed');   
    }


    const spotifyAPI = async (query: string, params: object, set: React.Dispatch<React.SetStateAction<any[]>>, temp?: string) => {
        let access: string = token;
        if (temp) {
            access = temp;
        }
        console.log(`spotify api call: ${query}`);
        try {
            if (!query.includes('me') && !query.includes('search')) {
                console.log(params);
                const response = await axios.post(`https://api.spotify.com/v1/${query}`,
                    params,
                    {
                    headers: {
                        Authorization: `Bearer ${access}`,
                    },
                    }
                )
                if (response.status === 200) {
                    setSuccess(`Successfully added ${name} to ${playlistName}`);
                }
            } else {
                const {data} = await axios.get(`https://api.spotify.com/v1/${query}`, {
                headers: {
                    Authorization: `Bearer ${access}`
                },
                params: params
                })
                console.log(data, query + ' data')
                if (query === 'me') {
                    const personalData = Object.fromEntries(
                        Object.entries(personal).map(([key, value]) =>
                            key === 'username' ? [key, data.display_name] : [key, data.id]
                        )
                    )
                    setPersonal(personalData);
                    getPlaylists(data.id, access);
                } else {
                    if (query === "search") {
                        if (data.tracks) {
                            set(data.tracks.items);
                            console.log('hit', query);
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

    const getPlaylists = async (userId: string, token: string) => {
        console.log(token, 'bearertoken');
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

    function handleDrag(e: React.DragEvent, id: string, title: string, type: string, image: string) {
        e.dataTransfer.setData('title', title);
        e.dataTransfer.setData('image', image);
        e.dataTransfer.setData('id', id);
        e.dataTransfer.setData('type', type);
    }

    const handleAdd = (id: string, title: string, type: string, url: string) => {
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
                key === insertSlot ? [key, {url: url, seedId: id, type: type, title: title}] : [key, value]
            )))
            setAllIds([...allIds, id]);
        }
    }


    if (!token) {
        return (
            <Login/>
        )
    }
    return (
        <body className="Body-main">
            {error && 
                <div id="dismiss-alert" className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900" role="alert" >
                    {error}
                <button className="ml-3 dismissButton" onClick={() => setError('')}>X</button>
            </div>}
            {success && 
                <div id="dismiss-notification" className="border border-green-200 text-sm text-black-800 rounded-lg p-4 dark:bg-green-800  dark:border-green-900 opacity-90">
                    {success}
                    <button className="ml-3 dismissButton" onClick={() => setSuccess('')}>X</button>
                </div>}
            <Playlists name={name} playlistDivRef={playlistDivRef} playlists={playlists} personal={personal} handleSendPlaylist={handleSendPlaylist}/>
            <h1>SPOTIFY RECOMMENDER</h1>
            <Recommendation token={token} order={order} setOrder={setOrder} allIds={allIds} positions={positions} setPositions={setPositions} setAllIds={setAllIds} recommended={recommended} setRecommended={setRecommended} setSelected={setSelected} mute={mute} setMute={setMute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd} />
            <Select setSelected={setSelected} selected={selected}/>
            {selected === "Search" && 
                <Search spotifyAPI={spotifyAPI} setSearchSongs={setSearchSongs} setSearchArtists={setSearchArtists} searchCategory={searchCategory} setSearchCategory={setSearchCategory}/>         
            }
            <div className="Vertical-flex Main">
                {(searchSongs.length > 0 && searchCategory === "track" && (selected === "All" || selected === 'Search')) && <Display showcase={searchSongs} title={'Song Search Results'} setMute={setMute} mute={mute} reference={'songsearchresults'} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(searchArtists.length > 0  && searchCategory === "artist" && (selected === "All" || selected === 'Search')) && <Display showcase={searchArtists} title={'Artist Search Results'} setMute={setMute} mute={mute} reference={'artistsearchresults'} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(selected === "All" || selected === 'Most') && <Display showcase={topSongs} title={'Most Played Songs'} reference={'topsongs'} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(selected === "All" || selected === 'Top') && <Display showcase={topArtists} title={'Your Top Artists'} reference={'topartists'} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(selected === "All" || selected === 'Saved') && <Display showcase={savedSongs} title={'Saved Songs'} reference={'savedsongs'} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd}/>}
            </div>
        </body>
    );
};

export default Home;