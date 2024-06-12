import { useEffect, useState } from "react"
import axios from 'axios';
import Homepage from "./Login";
import Display from "./Display";
import Select from "./Select";
import Search from "./Search";
import Playlist from '../icons/playlist.png'
import Remove from '../icons/remove.png'

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
    const [searchCategory, setSearchCategory] = useState('track');

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
            spotifyAPI('me/top/tracks', {limit: 10}, setTopSongs, token);
            spotifyAPI('me/top/artists', {limit: 10}, setTopArtists, token);
            spotifyAPI('me/tracks', {limit: 30}, setSavedSongs, token);
            spotifyAPI('me', {}, console.log , token);
        } 
    }, []);    

    const spotifyAPI = async (query: string, params: object, set: React.Dispatch<React.SetStateAction<any[]>>, temp?: string) => {
        let access: string = token;
        if (temp) {
            access = temp;
        }
        console.log(`spotify api call: ${query}`);
        try {
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
                getPlaylists(data.id, access);
            } else {
                if (query === "search") {
                    if (data.tracks) {
                        set(data.tracks.items);
                        console.log('hit', query);
                    } else {
                        set(data.artists.items); 
                        console.log('search artists', data.artists.items);
                    }
                    
                } else {
                    set(data.items);
                }
                
                if (query === 'me/tracks' || query === 'me/top/tracks') {
                    console.log(data.items, 'checking', query);
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    }

    const handleDrop = (e: React.DragEvent, spot: string) => {
        
        const seedTitle = e.dataTransfer.getData('title') as string;
        
        const seedId = e.dataTransfer.getData('id') as string;
        const imageUrl = e.dataTransfer.getData('image') as string;
        const type = e.dataTransfer.getData('type') as string;
        const imageSpot = document.getElementById(spot) as HTMLImageElement;
        console.log(seedTitle, imageSpot);
        let newPositions = {...positions};
        let newIds = [...allIds]
        if (!allIds.includes(seedId)) {
            console.log('not a dupe');
            if (imageSpot) {
                if (Object.keys(positions[spot]).length > 0) {
                    newIds = allIds.filter((value) => value !== positions[spot].url);
                    newPositions = Object.fromEntries(
                        Object.entries(positions).map(([key, value]) => 
                            key === spot ? [key, []] : [key, value]
                        )
                    );
                    
                }
                setPositions(Object.fromEntries(
                    Object.entries(newPositions).map(([key, value]) => 
                        key === spot ? [key, {url: imageUrl, seedId: seedId, type: type, title: seedTitle}] : [key, value]
                    )
                ));
            }
            setAllIds([...newIds, seedId]);
        }
        
    }

    const recommend = async () => {
        const seedSongs = Object.entries(positions).map(([key, value]) => 
            value.type === "track" && value.seedId).filter(Boolean);
        
        const seedArtists = Object.entries(positions).map(([key, value]) => 
            value.type === "artist" && value.seedId).filter(Boolean);
        console.log(positions, 'seed songs');
        try {
            const {data} = await axios.get('https://api.spotify.com/v1/recommendations', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    seed_tracks: seedSongs.join(','),
                    seed_artists: seedArtists.join(','),
                    limit: 10
                }
            })
            setRecommended(data.tracks);
            setSelected('All')
            console.log(data);  
        } catch (error) {
            console.log(error);
        }
    };

    const handleLeft = () => {
        setOrder((prevOrder) => {
            const newPositions = [...prevOrder];
            const first = newPositions.pop();
            newPositions.unshift(String(first));
            console.log(newPositions, 'rotatedpositions');
            return newPositions;
        });
        
    }

    const handleRight = () => {
        setOrder((prevOrder) => {
            const newPositions = [...prevOrder];
            const first = newPositions.shift();
            newPositions.push(String(first));
            console.log(newPositions, 'rotatedpositions');
            return newPositions;
        });
    }

    const handleHover = (index: number, status: boolean) => {
        const addRemoveButton = document.getElementById('Remove-Add-' + String(index));
        const playlistButton = document.getElementById('Playlist-' + String(index));
        if (addRemoveButton && playlistButton) {
            addRemoveButton.hidden = status;
            playlistButton.hidden = status;

        }
    }

    const handleRemove = (position: string) => {
        setPositions(Object.fromEntries(
            Object.entries(positions).map(([key, value]) =>
                key === position ? [key, {}] : [key, value]
            ) 
        ))
        setAllIds(allIds.filter((value) => value !== positions[position].seedId))
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
            <Homepage/>
        )
    }
    return (
        <body className="Body-main">
            {error && <div id="dismiss-alert" className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900" role="alert" style={{position: 'absolute', bottom: '3%', right: '3%', zIndex: 10}}>
                {error}
                <button className="ml-3" onClick={() => setError('')}>X</button>
            </div>}
            <h1>TITLE</h1>
            <div style={{width: '100%', height: 'auto', backgroundColor: '#D9D9D9', marginTop: '10px', marginBottom: '10px', boxShadow: '1px 1px gray', padding: '3px', borderRadius: '12px'}}>
                <h4>Recommendation Customizer</h4>
                <div className="Flex" style={{marginBottom: '80px'}}>
                    <div className="Vertical-flex" style={{overflowY: 'auto'}}>
                    </div>
                        <div id="Main-display">
                            {allIds.length > 0 &&
                                <button id="Left-button" onClick={handleLeft}>&lt;</button>
                            }
                            {order.map((position, index) => {
                                return (
                                    <div onMouseEnter={() => handleHover(index, false)} onMouseLeave={() => handleHover(index, true)} className={'display' + String(index) + " Vertical-center Hover-div"} onClick={() => console.log} onDrop={(e) => handleDrop(e, position)} onDragOver={handleDragOver}>
                                        <img id={position} style={{width: '100%'}} src={Object.keys(positions[position]).length > 0 ? positions[position].url : undefined}/>
                                        {allIds.length === 0 && index === 2 && 
                                                    <div>
                                                        Drag or manually add songs/tracks here!
                                                    </div>
                                                }
                                        {Object.keys(positions[position]).length > 0 && index === 2 &&
                                            <div className="Button-hover">
                                                <button id={'Remove-Add-' + String(index)}hidden style={{marginRight: '15px', backgroundColor: 'grey'}} onClick={() => handleRemove(position)}>
                                                    <img src={Remove} style={{width: '30px', height: '30px'}}/>
                                                </button>
                                                <div>
                                                    <button id={'Playlist-' + String(index)} className="hs-dropdown-toggle" hidden style={{marginLeft: '15px', backgroundColor: 'grey'}}>
                                                        <img src={Playlist} style={{width: '30px', height: '30px' }}/>
                                                    </button>
                                                </div>
                                                
                                            </div>
                                            
                                        }
                                        {positions[position].title}
                                    </div>
                                );
                            })}
                            {allIds.length > 0 &&
                                <button id="Right-button" onClick={handleRight}>&gt;</button>
                            }
                        </div>
                </div>
                {recommended.length === 0 && 
                    <button onClick={recommend} className="py-3 px-4 gap-x-2 mb-5 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700">
                        Create Recommendation
                    </button>
                }
                {recommended.length > 0 &&<Display showcase={recommended} title={'Recommended Songs'} reference={'recommended'} setMute={setMute} mute={mute} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {recommended.length > 0 && 
                    <button onClick={() => {setRecommended([]);
                                            setAllIds([]);
                                            setPositions({"imageDrop1": {}, "imageDrop2": {}, "imageDrop3": {}, "imageDrop4": {}, "imageDrop5": {}});}} className="py-3 px-4 gap-x-2 mb-5 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700">
                        Start New Recommendation
                    </button> }
            </div>
            <Select setSelected={setSelected} selected={selected}/>
            {selected === "Search" && 
                <Search spotifyAPI={spotifyAPI} setSearchSongs={setSearchSongs} setSearchArtists={setSearchArtists} searchCategory={searchCategory} setSearchCategory={setSearchCategory}/>         
            }
            <div className="Vertical-flex Main">
                {(searchSongs.length > 0 && searchCategory === "track" && (selected === "All" || selected === 'Search')) && <Display showcase={searchSongs} title={'Song Search Results'} setMute={setMute} mute={mute} reference={'songsearchresults'} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(searchArtists.length > 0  && searchCategory === "artist" && (selected === "All" || selected === 'Search')) && <Display showcase={searchArtists} title={'Artist Search Results'} setMute={setMute} mute={mute} reference={'artistsearchresults'} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(selected === "All" || selected === 'Most') && <Display showcase={topSongs} title={'Most Played Songs'} reference={'topsongs'} setMute={setMute} mute={mute} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(selected === "All" || selected === 'Top') && <Display showcase={topArtists} title={'Your Top Artists'} reference={'topartists'} setMute={setMute} mute={mute} handleDrag={handleDrag} handleAdd={handleAdd}/>}
                {(selected === "All" || selected === 'Saved') && <Display showcase={savedSongs} title={'Saved Songs'} reference={'savedsongs'} setMute={setMute} mute={mute} handleDrag={handleDrag} handleAdd={handleAdd}/>}
            </div>
        </body>
    );
};

export default Home;