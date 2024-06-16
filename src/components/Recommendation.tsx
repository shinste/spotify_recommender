import axios from 'axios';
import Display from "./Display";
import Playlist from '../icons/playlist.png'
import Remove from '../icons/remove.png'

interface RecommendationProps {
    order: string[],
    setOrder: React.Dispatch<React.SetStateAction<string[]>>,
    token: string,
    allIds: string[],
    positions: {[key: string]: {[key: string]: string}},
    setPositions: React.Dispatch<React.SetStateAction<{[key: string]: {[key: string]: string}}>>,
    setAllIds: React.Dispatch<React.SetStateAction<string[]>>,
    recommended: any[],
    setRecommended: React.Dispatch<React.SetStateAction<any[]>>,
    setSelected: React.Dispatch<React.SetStateAction<string>>,
    mute: boolean,
    setMute: React.Dispatch<React.SetStateAction<boolean>>,
    handleButtonClick: (uri: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => void,
    handleDrag: (e: React.DragEvent, id: string, title: string, type: string, image: string) => void,
    handleAdd: (id: string, title: string, type: string, url: string) => void

}
const Recommendation: React.FC<RecommendationProps> = ({token, order, setOrder, allIds, positions, setPositions, setAllIds, recommended, setRecommended, setSelected, mute, setMute, handleButtonClick, handleDrag, handleAdd}) => {

    const recommend = async () => {
        const seedSongs = Object.entries(positions).map(([key, value]) => 
            value.type === "track" && value.seedId).filter(Boolean);
        
        const seedArtists = Object.entries(positions).map(([key, value]) => 
            value.type === "artist" && value.seedId).filter(Boolean);
        try {
            const {data} = await axios.get('https://api.spotify.com/v1/recommendations', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    seed_tracks: seedSongs.join(','),
                    seed_artists: seedArtists.join(','),
                    limit: 20
                }
            })
            setRecommended(data.tracks);
            setSelected('All')
        } catch (error) {
            console.log(error);
        }
    };

    const handleDrop = (e: React.DragEvent, spot: string) => {
        
        const seedTitle = e.dataTransfer.getData('title') as string;
        
        const seedId = e.dataTransfer.getData('id') as string;
        const imageUrl = e.dataTransfer.getData('image') as string;
        const type = e.dataTransfer.getData('type') as string;
        const imageSpot = document.getElementById(spot) as HTMLImageElement;
        let newPositions = {...positions};
        let newIds = [...allIds]
        if (!allIds.includes(seedId)) {
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


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    }

    const handleRemove = (position: string) => {
        setPositions(Object.fromEntries(
            Object.entries(positions).map(([key, value]) =>
                key === position ? [key, {}] : [key, value]
            ) 
        ))
        setAllIds(allIds.filter((value) => value !== positions[position].seedId))
    }

    const handleHover = (index: number, status: boolean) => {
        const addRemoveButton = document.getElementById('Remove-Add-' + String(index));
        const playlistButton = document.getElementById('Playlist-' + String(index));
        if (addRemoveButton && playlistButton) {
            addRemoveButton.hidden = status;
            playlistButton.hidden = status;

        }
    }

    const handleLeft = () => {
        setOrder((prevOrder) => {
            const newPositions = [...prevOrder];
            const first = newPositions.pop();
            newPositions.unshift(String(first));
            return newPositions;
        });
        
    }

    const handleRight = () => {
        setOrder((prevOrder) => {
            const newPositions = [...prevOrder];
            const first = newPositions.shift();
            newPositions.push(String(first));
            return newPositions;
        });
    }

    return (
        <div id='Recommendation-div'>
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
                            <div onMouseEnter={() => handleHover(index, false)} onMouseLeave={() => handleHover(index, true)} className={'display' + String(index) + " Vertical-center Hover-div"} onDrop={(e) => handleDrop(e, position)} onDragOver={handleDragOver}>
                                <img id={position} style={{width: '100%'}} src={Object.keys(positions[position]).length > 0 ? positions[position].url : undefined} alt=""/>
                                {allIds.length === 0 && index === 2 && 
                                            <div>
                                                Drag or manually add songs/tracks here!
                                            </div>
                                        }
                                {Object.keys(positions[position]).length > 0 && index === 2 &&
                                    <div className="Button-hover">
                                        <button id={'Remove-Add-' + String(index)}hidden style={{marginRight: '15px', backgroundColor: 'grey'}} onClick={() => handleRemove(position)}>
                                            <img src={Remove} className='Hover-button' alt=""/>
                                        </button>
                                        <button id={'Playlist-' + String(index)} className="hs-dropdown-toggle" hidden style={{marginLeft: '15px', backgroundColor: 'grey'}}>
                                            <img src={Playlist} className='Hover-button' alt=""/>
                                        </button>
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
        <button onClick={() => {setAllIds([]);
                                setPositions({"imageDrop1": {}, "imageDrop2": {}, "imageDrop3": {}, "imageDrop4": {}, "imageDrop5": {}})}}>Clear Seed Songs/Artists</button>
        {recommended.length === 0 && 
            <button onClick={recommend} className="py-3 px-4 gap-x-2 mb-5 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700">
                Create Recommendation
            </button>
        }
        {recommended.length > 0 &&<Display showcase={recommended} title={'Recommended Songs'} reference={'recommended'} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleDrag={handleDrag} handleAdd={handleAdd}/>}
        {recommended.length > 0 && 
            <button onClick={recommend} className="py-3 px-4 gap-x-2 mb-5 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700">
                Generate New Recommendations
            </button> }
    </div>
    );
}

export default Recommendation;