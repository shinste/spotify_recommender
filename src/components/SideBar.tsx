import Home from '../icons/home.png'
import Search from '../icons/search.png'
import Logout from '../icons/logout.png'
interface SideBarComponents {
    sidebar: string,
    setSidebar: React.Dispatch<React.SetStateAction<string>>,
    username: string,
    playlist: any[],
    setPlaylistName: React.Dispatch<React.SetStateAction<string>>,
    handleSendPlaylist: (id: string, name: string, uri: string) => void
}
const SideBar: React.FC<SideBarComponents> = ({sidebar, setSidebar, username, playlist, setPlaylistName, handleSendPlaylist}) => {
    console.log(playlist);
    const handleDrop = (e: React.DragEvent, playlistId: string) => {
        const songTitle = e.dataTransfer.getData('title') as string;
        const songUri = e.dataTransfer.getData('uri') as string;
        handleSendPlaylist(playlistId, songTitle, songUri);
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
                <div className="sidebar-div"  onClick={() => setSidebar('home')}>
                    <img className="sidebar-img" src={Home} alt=''/>
                    <button className='sidebar-button'>
                        <h4 className='sidebar-button-p' style={{color: sidebar === 'home' ? 'white': undefined}}>Home</h4>
                    </button>
                </div>
                <div className="sidebar-div"  onClick={() => setSidebar('search')}>
                    <img className="sidebar-img" src={Search} alt=''/>
                        <button className='sidebar-button' style={{color: sidebar === 'search' ? 'white': undefined}}>
                            <h4 className='sidebar-button-p'>
                                Search
                            </h4>
                        </button>
                </div>
                <div className="sidebar-div"  onClick={() => setSidebar('logout')}>
                    <img className="sidebar-img" src={Logout} alt=''/>
                        <button className='sidebar-button' style={{color: sidebar === 'logout' ? 'white': undefined}}>
                            <h4 className='sidebar-button-p'>
                                Logout
                            </h4>
                        </button>
                </div> 
                <hr id="divider" />
                {playlist.map((value, index) => {
                    return(
                        <div key={index} className='sidebar-playlist-div' onDrop={(e) => handleDrop(e, value.id)} onDragOver={handleDragOver}>
                            <button className='sidebar-button' onClick={() => {setSidebar(value.id); setPlaylistName(value.name);}} style={{color: sidebar === value.id ? 'white': undefined}}>
                                <p className='sidebar-playlists'>{value.name}</p>
                            </button>
                        </div>
                    )
                })}
            </div>
            

        </div>
    );
}

export default SideBar;