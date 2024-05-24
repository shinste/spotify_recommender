import { useState } from "react"
interface DisplayProps {
    spotifyAPI: (query: string, params: object, set: React.Dispatch<React.SetStateAction<any[]>>, temp?: string) => void
    setSearchSongs: React.Dispatch<React.SetStateAction<any[]>>
    setSearchArtists: React.Dispatch<React.SetStateAction<any[]>>
}   

const Search: React.FC<DisplayProps> = ({spotifyAPI, setSearchSongs, setSearchArtists}) => {
    const [searchKey, setSearchKey] = useState('');
    return (
        <div className="Flex" style={{marginBottom: '10px'}}>
            <input type="text" className="py-2 px-3 mr-3 border block h-100 rounded-lg text-sm focus:ring-blue-500 dark:text-neutral-400" placeholder="Search for a Song or Artist"onChange={(e) => setSearchKey(e.target.value)} />
            <div className="inline-flex rounded-lg shadow-sm">
                <button type="button" onClick={() => spotifyAPI('search', {q: searchKey,limit: 10,type: "track"}, setSearchSongs)} className="py-2 px-3 h-100 inline-flex items-center gap-x-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:text-black dark:hover:bg-neutral-100">
                    Song
                </button>
                <button type="button" onClick={() => spotifyAPI('search', {q: searchKey,limit: 10,type: "artist"}, setSearchArtists)} className="py-2 px-3 h-100 inline-flex items-center gap-x-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:text-black dark:hover:bg-neutral-100">
                    Artist
                </button>
            </div>
        </div> 
    );
}

export default Search;