import { useState } from "react"
interface DisplayProps {
    spotifyAPI: (query: string, params: object, set: React.Dispatch<React.SetStateAction<any[]>>, temp?: string) => void
    setSearchSongs: React.Dispatch<React.SetStateAction<any[]>>
    setSearchArtists: React.Dispatch<React.SetStateAction<any[]>>
    searchCategory: string;
    setSearchCategory: React.Dispatch<React.SetStateAction<string>>
}   

const Search: React.FC<DisplayProps> = ({spotifyAPI, setSearchSongs, setSearchArtists, searchCategory, setSearchCategory}) => {
    const [searchKey, setSearchKey] = useState('');

    const handleClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            spotifyAPI('search', {q: searchKey,limit: 10,type: searchCategory}, searchCategory === "track" ? setSearchSongs : setSearchArtists);
        }
    }
    return (
        <div className="Flex" style={{marginBottom: '10px'}}>
            <input type="text" onKeyDown={handleClick} className="py-2 px-3 mr-3 border block h-100 rounded-lg text-sm focus:ring-blue-500 dark:text-neutral-400" placeholder="Search for a Song or Artist"onChange={(e) => setSearchKey(e.target.value)} />
            <div className="inline-flex rounded-lg shadow-sm">
                <button type="button" onClick={() => setSearchCategory('track')} className={`py-2 px-3 h-100 inline-flex items-center gap-x-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:text-black dark:hover:bg-neutral-100 + ${searchCategory === "track" && 'pressed'}`}>
                    Song
                </button>
                <button type="button" onClick={() => setSearchCategory('artist')} className={`py-2 px-3 h-100 inline-flex items-center gap-x-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:text-black dark:hover:bg-neutral-100 + ${searchCategory === "artist" && 'pressed'}`}>
                    Artist
                </button>
            </div>
        </div> 
    );
}

export default Search;