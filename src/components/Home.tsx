import { useEffect, useState } from "react"
import axios from 'axios';
import Homepage from "./Login";
import Display from "./Display";
import Select from "./Select";
import Search from "./Search";

const Home: React.FC = () => {

    const [token, setToken] = useState('');
    const [topArtists, setTopArtists] = useState<any[]>([]);
    const [topSongs, setTopSongs] = useState<any[]>([]);
    const [savedSongs, setSavedSongs] = useState<any[]>([]);
    const [seedSongs, setSeedSongs] = useState<{[key: string]: string}>({});
    const [seedArtists, setSeedArtists] = useState<{[key: string]: string}>({});
    const [seedImages, setSeedImages] = useState<{[key: string]: [string, string]}>({});
    const [selected, setSelected] = useState('All');
    const [searchArtists, setSearchArtists] = useState<any[]>([]);
    const [searchSongs, setSearchSongs] = useState<any[]>([]);
    const [mute, setMute] = useState(false)
    
    const [recommended, setRecommended] = useState<any[]>([]);

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
        if (type === "artist") {
            e.dataTransfer.setData('artistId', id);
        } else if (type === "track") {
            e.dataTransfer.setData('songId', id);
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    }

    const handleDrop = (e: React.DragEvent, spot: string) => {
        
        const seedTitle = e.dataTransfer.getData('title') as string;
        
        if (seedTitle) {
            const seedSongId = e.dataTransfer.getData('songId') as string;
            const imageUrl = e.dataTransfer.getData('image') as string;
            const imageSpot = document.getElementById(spot) as HTMLImageElement;
            console.log(seedTitle, imageSpot);
            if (!seedSongId) {
                const seedArtistId = e.dataTransfer.getData('artistId') as string
                if (!Object.keys(seedArtists).includes(seedArtistId)) {
                    console.log('dupe');
                    if (imageSpot) {
                        if (imageSpot.src) {
                            const existingImageData = seedImages[imageSpot.src];
                            if (existingImageData) {
                                const [removingId, removingType] = existingImageData;
                                if (removingType === "artist") {
                                    const newArtists = Object.fromEntries(
                                        Object.entries(seedArtists).filter(([key, value]) => key !== removingId)
                                    );
                                    setSeedArtists({...newArtists, [seedArtistId]: seedTitle})
                                } else {
                                    const newSongs = Object.fromEntries(
                                        Object.entries(seedSongs).filter(([key, value]) => key !== removingId)
                                    );
                                    setSeedSongs(newSongs);
                                }
                                const { [imageSpot.src]: _, ...newObject } = seedImages;
                                setSeedImages(newObject);
                            } 
                        } else {
                            setSeedArtists({...seedArtists, [seedArtistId]: seedTitle})
                        }
                        imageSpot.src =  imageUrl;
                    }
                    if (!Object.keys(seedImages).includes(imageUrl)) {
                        setSeedImages((prevImages) => ({
                            ...prevImages,
                            [imageUrl]: [seedArtistId, 'artist'], // Ensure this is a tuple
                          }));
                    }
                    
                }
            } else {
                if (!Object.keys(seedSongs).includes(seedSongId)) {
                    console.log('yes its adding');
                    if (imageSpot) {
                        if (imageSpot.src) {
                            const source = imageSpot.src
                            const [removingId, removingType] = seedImages[source];
                            if (removingType === "artist") {
                                const newArtists = Object.fromEntries(
                                    Object.entries(seedArtists).filter(([key, value]) => key !== removingId)
                                );
                                setSeedArtists(newArtists);
                            } else {
                                const newSongs = Object.fromEntries(
                                    Object.entries(seedSongs).filter(([key, value]) => key !== removingId)
                                );
                                setSeedSongs({...newSongs, [seedSongId]: seedTitle})
                            }
                            const { [imageSpot.src]: _, ...newObject } = seedImages;
                            setSeedImages(newObject);
                        } else {
                            setSeedSongs({...seedSongs, [seedSongId]: seedTitle})
                        }
                        
                        imageSpot.src =  imageUrl;
                    }
                if (!Object.keys(seedImages).includes(imageUrl)) {
                    setSeedImages((prevImages) => ({
                        ...prevImages,
                        [imageUrl]: [seedSongId, 'track'], // Ensure this is a tuple
                        }));
                }
                }
            }
        }
        
    }

    const recommend = async () => {
        // topSongs.forEach((song, index) => {trackSeed.push(song.id)
        //     console.log(song.id);
        // })
        // topArtists.forEach((artist, index) => {artistSeed.push(artist.id)})
        // console.log(trackSeed, artistSeed, 'seeds');
        try {
            const {data} = await axios.get('https://api.spotify.com/v1/recommendations', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    seed_tracks: Object.keys(seedSongs).join(','),
                    seed_artists: Object.keys(seedArtists).join(','),
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
                        <div onDrop={(e) => handleDrop(e, "imageDrop1")} onDragOver={handleDragOver} style={{width: '100px', height: '100px', backgroundColor: 'white', border: 'black solid'}}>
                            <img id="imageDrop1" style={{width: '100%'}}/>
                        </div>
                        <div onDrop={(e) => handleDrop(e, "imageDrop2")} onDragOver={handleDragOver} style={{width: '100px', height: '100px', backgroundColor: 'white', border: 'black solid'}}>
                            <img id="imageDrop2" style={{width: '100%'}}/>
                        </div>
                        <div onDrop={(e) => handleDrop(e, "imageDrop3")} onDragOver={handleDragOver} style={{width: '100px', height: '100px', backgroundColor: 'white', border: 'black solid'}}>
                            <img id="imageDrop3" style={{width: '100%'}}/>
                        </div>
                        <div onDrop={(e) => handleDrop(e, "imageDrop4")} onDragOver={handleDragOver} style={{width: '100px', height: '100px', backgroundColor: 'white', border: 'black solid'}}>
                            <img id="imageDrop4" style={{width: '100%'}}/>  
                        </div>
                        <div onDrop={(e) => handleDrop(e, "imageDrop5")} onDragOver={handleDragOver} style={{width: '100px', height: '100px', backgroundColor: 'white', border: 'black solid'}}>
                            <img id="imageDrop5" style={{width: '100%', height: '100%'}}/>  
                        </div>
                    </div>
                    
                </div>
                <button onClick={recommend} className="py-3 px-4 gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700 ">
                    Create Recommendation
                </button>
                <button onClick={() => console.log(seedSongs)}></button>
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