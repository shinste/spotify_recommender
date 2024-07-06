interface ViewPlaylistComponents{
    playlists: any[]
}
const ViewPlaylist: React.FC<ViewPlaylistComponents>= ({playlists}) => {
    console.log(playlists, 'display')
    return(
        <div>
            {playlists.map((value, index) => {
                return (
                    <div key={index}>
                        {value.track.name}
                    </div>
                );
            })}
        </div>
    )
}

export default ViewPlaylist;