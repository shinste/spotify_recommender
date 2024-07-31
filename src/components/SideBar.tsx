import Home from '../icons/home.png';
import Search from '../icons/search.png';
import Logout from '../icons/logout.png';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
interface SideBarComponents {
    sidebar: string,
    setSidebar: React.Dispatch<React.SetStateAction<string>>,
    username: string,
    playlist: any[],
    handleSendPlaylist: (id: string, name: string, index: number, uri: string) => void,
    handleSideBarClick: (index: number) => void
}
const SideBar: React.FC<SideBarComponents> = ({ sidebar, setSidebar, username, playlist, handleSendPlaylist, handleSideBarClick }) => {
    const [focus, setFocus] = useState<number | null>(null)
    const handleDrop = (e: React.DragEvent, playlistId: string, playlistIndex: number) => {
        const songTitle = e.dataTransfer.getData('title') as string;
        const songUri = e.dataTransfer.getData('uri') as string;
        handleSendPlaylist(playlistId, songTitle, playlistIndex, songUri);
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    }

    return (
        <div id="side-bar">
            <div id='side-bar-margins'>
                <h2 className="side-bar-p">
                    Hello {username}
                </h2>
                <div className="sidebar-div" onClick={() => setSidebar('home')}>
                    <img className="sidebar-img" src={Home} alt='' />
                    <button className='sidebar-button'>
                        <h4 className='sidebar-button-p' style={{ color: sidebar === 'home' ? 'white' : undefined }}>Home</h4>
                    </button>
                </div>
                <div className="sidebar-div" onClick={() => setSidebar('search')}>
                    <img className="sidebar-img" src={Search} alt='' />
                    <button className='sidebar-button' style={{ color: sidebar === 'search' ? 'white' : undefined }}>
                        <h4 className='sidebar-button-p'>
                            Search
                        </h4>
                    </button>
                </div>
                <div className="sidebar-div" onClick={() => setSidebar('logout')}>
                    <img className="sidebar-img" src={Logout} alt='' />
                    <button className='sidebar-button' style={{ color: sidebar === 'logout' ? 'white' : undefined }}>
                        <h4 className='sidebar-button-p'>
                            Logout
                        </h4>
                    </button>
                </div>
                <hr id="divider" />
                <div id="playlist-holder">
                    {playlist.map((value, index) => {
                        return (
                            <Tooltip role='tooltip' key={index} title={`Quick Add to this ${value.name}`}>
                                <div className='sidebar-playlist-div' onDrop={(e) => handleDrop(e, value.id, index)} onDragOver={handleDragOver}>
                                    <button className='sidebar-button' onClick={() => { setSidebar('playlist'); handleSideBarClick(index); setFocus(index); }} style={{ color: focus === index && sidebar === "playlist" ? 'white' : undefined }}>
                                        <p className='sidebar-playlists'>{value.name.length > 22 ? value.name.slice(0, 22) + '...' : value.name}</p>
                                    </button>
                                </div>
                            </Tooltip>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default SideBar;