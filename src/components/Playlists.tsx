interface PlaylistsProps {
    name: string,
    playlistDivRef: React.RefObject<HTMLDivElement>,
    playlists: any[],
    personal: string,
    handleSendPlaylist: (id: string, name: string, index: number, uri?: string) => void
}

const Playlists: React.FC<PlaylistsProps> = ({name, playlistDivRef, playlists, personal, handleSendPlaylist}) => {
    return (
        <div className="Playlist-div hidden" id="Add-playlist-div" ref={playlistDivRef}>
        {playlists.length > 0 ? 
            <h2 style={{color: 'whitesmoke'}}>Add <span style={{fontWeight: 'bold'}}>{name}</span> to which playlist?</h2>
            :
            <h2 style={{color: 'whitesmoke'}}>It looks like you have no playlists. Go to Spotify and create some!</h2>
        }
        <div>
            {playlists.map((item, index) => {
                if (item.owner.id === personal || item.collaborative) {
                    return (
                        <div key={"playlists" + index} className="Playlist-content">
                            <img className="Playlist-img" src={item.images[0].url} alt=""/>
                            <button className="Playlist-button" onClick={() => {handleSendPlaylist(item.id, item.name, index)}}>
                                <h2 className="Playlist-name">
                                    {item.name}
                                </h2>  
                                <p style={{color: 'gray'}}>{item.owner.display_name}</p>
                            </button>
                        </div>
                    );
                }
            })}
        </div>
    </div>
    );
}

export default Playlists;