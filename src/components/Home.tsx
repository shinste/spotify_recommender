import { useEffect, useState } from "react"
import axios from 'axios';
import Homepage from "./Login";
import Display from "./Display";
import Select from "./Select";
import Search from "./Search";

// Home Component
const Home: React.FC = () => {

    const [token, setToken] = useState('');
    const [topArtists, setTopArtists] = useState<any[]>([]);
    const [topSongs, setTopSongs] = useState<any[]>([]);
    const [savedSongs, setSavedSongs] = useState<any[]>([]);
    const [selected, setSelected] = useState('All');
    const [searchArtists, setSearchArtists] = useState<any[]>([]);
    const [searchSongs, setSearchSongs] = useState<any[]>([]);
    const [mute, setMute] = useState(false)
    const [recommended, setRecommended] = useState<any[]>([]);
    const [positions, setPositions] = useState<{[key: string]: string[]}>({"imageDrop1": [], "imageDrop2": [], "imageDrop3": [], "imageDrop4": [], "imageDrop5": []});
    const [allIds, setAllIds] = useState<string[]>([]);
    const [order, setOrder] = useState<string[]>(["imageDrop1", "imageDrop2", "imageDrop3", "imageDrop4", "imageDrop5"])

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
            console.log(data);
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
                if (positions[spot].length > 0) {
                    newIds = allIds.filter((value) => value !== positions[spot][0]);
                    newPositions = Object.fromEntries(
                        Object.entries(positions).map(([key, value]) => 
                            key === spot ? [key, []] : [key, value]
                        )
                    );
                    
                }
                setPositions(Object.fromEntries(
                    Object.entries(newPositions).map(([key, value]) => 
                        key === spot ? [key, [imageUrl, seedId, type, seedTitle]] : [key, value]
                    )
                ));
            }
            setAllIds([...newIds, seedId]);
        }
        
    }

    const recommend = async () => {
        const seedSongs = Object.entries(positions).map(([key, value]) => 
            value[2] === "track" && value[1]).filter(Boolean);
        
        const seedArtists = Object.entries(positions).map(([key, value]) => 
            value[2] === "artist" && value[1]).filter(Boolean);
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
            setSelected('Recommended')
            console.log(data);  
        } catch (error) {
            console.log(error);
        }
    };

    const handleLeft = () => {
        setOrder((prevOrder) => {
            const newPositions = [...prevOrder];
            const first = newPositions.shift();
            newPositions.push(String(first));
            console.log(newPositions, 'rotatedpositions');
            return newPositions;
        });
    }

    if (!token) {
        return (
            <Homepage/>
        )
    }
    return (
        <body className="Body-main">
            <button className='Volume' onClick={() => setMute(!mute)}>volume</button>
            <h1>TITLE</h1>
            <div style={{width: '100%', height: '30%', backgroundColor: '#D9D9D9', marginTop: '10px', marginBottom: '10px', boxShadow: '3px 3px'}}>
                <h4>Give me Recommendations </h4>
                <div className="Flex">
                    <div className="Vertical-flex" style={{overflowY: 'auto'}}>
                    </div>
                    <div className="Flex">
                        <button onClick={handleLeft}>left</button>
                        {order.map((position, index) => {
                            return (
                                <div onClick={() => console.log}onDrop={(e) => handleDrop(e, position)} onDragOver={handleDragOver} style={{width: '100px', height: '100px', backgroundColor: 'white', border: 'black solid'}}>
                                    <img id={position} style={{width: '100%'}} src={positions[position].length > 0 ? positions[position][0] : undefined}/>
                                </div>
                            );
                        })}
                        <button>right</button>
                    </div>
                    
                </div>
                <button onClick={recommend} className="py-3 px-4 gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700 ">
                    Create Recommendation
                </button>
                <button onClick={() => console.log(positions)}></button>
            </div>
            <Select setSelected={setSelected} selected={selected}/>
            {selected === "Search" && 
                <Search spotifyAPI={spotifyAPI} setSearchSongs={setSearchSongs} setSearchArtists={setSearchArtists}/>         
            }
            <div className="Vertical-flex Main">
                {(recommended.length > 0 && (selected === "All" || selected === 'Recommended')) &&<Display showcase={recommended} title={'Recommended Songs'} reference={'recommended'} handleDrag={handleDrag}/>}
                {(searchSongs.length > 0 && (selected === "All" || selected === 'Search')) && <Display showcase={searchSongs} title={'Song Search Results'} mute={mute} reference={'songsearchresults'} handleDrag={handleDrag}/>}
                {(searchArtists.length > 0 && (selected === "All" || selected === 'Search')) && <Display showcase={searchArtists} title={'Artist Search Results'} reference={'artistsearchresults'} handleDrag={handleDrag}/>}
                {(selected === "All" || selected === 'Most') && <Display showcase={topSongs} title={'Most Played Songs'} reference={'topsongs'} mute={mute} handleDrag={handleDrag}/>}
                {(selected === "All" || selected === 'Top') && <Display showcase={topArtists} title={'Your Top Artists'} reference={'topartists'} handleDrag={handleDrag}/>}
                {(selected === "All" || selected === 'Saved') && <Display showcase={savedSongs} title={'Saved Songs'} reference={'savedsongs'} mute={mute} handleDrag={handleDrag}/>}
            </div>
        </body>
    );
};

export default Home;