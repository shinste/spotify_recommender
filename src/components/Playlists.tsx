interface PlaylistsProps {
    name: string,
    playlistDivRef: React.RefObject<HTMLDivElement>,
    playlists: any[],
    personal: {[key: string]: string}
    handleSendPlaylist: (id: string, name: string) => void
}

const Playlists: React.FC<PlaylistsProps> = ({name, playlistDivRef, playlists, personal, handleSendPlaylist}) => {
    return (
        <div className="Playlist-div hidden" id="Add-playlist-div" ref={playlistDivRef}>
        <h2>Add <span style={{fontWeight: 'bolder'}}>{name}</span> to which playlist?</h2>
        <div >
            {playlists.map((item, index) => {
                if (item.owner.id === personal.id || item.collaborative) {
                    return (
                        <div key={"playlists" + index} className="Playlist-content">
                            <img className="Playlist-img" src={item.images[0].url} alt=""/>
                            <button className="Playlist-button" onClick={() => {handleSendPlaylist(item.id, item.name)}}>
                                <h2 className="Playlist-name">
                                    {item.name}
                                </h2>  
                                {item.owner.display_name}
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