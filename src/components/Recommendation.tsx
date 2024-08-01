import Display from "./Display";
import Playlist from '../icons/playlist.png';
import Remove from '../icons/remove.png';
import useRecommend from '../hooks/useRecommend';
import useDisplayInteractions from '../hooks/useDisplayInteractions';
import * as CONSTANTS from '../constants/homeConstants'

interface RecommendationProps {
    order: string[];
    setOrder: React.Dispatch<React.SetStateAction<string[]>>;
    token: string;
    allIds: string[];
    positions: { [key: string]: { [key: string]: string } };
    setPositions: React.Dispatch<React.SetStateAction<{ [key: string]: { [key: string]: string } }>>;
    setAllIds: React.Dispatch<React.SetStateAction<string[]>>;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
    mute: boolean;
    setMute: React.Dispatch<React.SetStateAction<boolean>>;
    handleButtonClick: (uri: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => void;
    handleAdd: (id: string, title: string, type: string, url: string, uri: string) => void;
    playlist: string
    setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>
    authToken: string;
}

const Recommendation: React.FC<RecommendationProps> = ({ token, order, setOrder, allIds, positions, setPositions, setAllIds, setSelected,
    mute, setMute, handleButtonClick, handleAdd, playlist, setAuthToken, authToken }) => {

    // Recommendation data and function
    const { recommended, recommend, setRecommended } = useRecommend(authToken, setAuthToken, positions, setSelected);

    // All the display interactions that have to do with this components
    const { handleLeft, handleRight, handleHover, handleRemove, handleDrop, handleDragOver } = useDisplayInteractions(positions, allIds, setAllIds, setPositions, order, setOrder)


    return (
        <div id='Recommendation-div' className='horizontal-center'>
            <h4 id='title-margins'>Recommendation Customizer</h4>
            <div className="Vertical-flex" style={{ marginBottom: '10px' }}>
                <div id="Main-display">
                    {allIds.length > 0 &&
                        <button id="Left-button" onClick={handleLeft}>&lt;</button>
                    }
                    {order.map((position, index) => {
                        return (
                            <div key={index} onMouseEnter={() => handleHover(index, false)} onMouseLeave={() => handleHover(index, true)} className={'display' + String(index) + " Vertical-center Hover-div"} onDrop={(e) => handleDrop(e, position)} onDragOver={handleDragOver}>
                                <img id={position} className='Recommend-img' src={Object.keys(positions[position]).length > 0 ? positions[position].url : undefined} alt="" />
                                {allIds.length === 0 && index === 2 &&
                                    <div>
                                        Drag or manually add songs/tracks here!
                                    </div>
                                }
                                {Object.keys(positions[position]).length > 0 && index === 2 &&
                                    <div className="Button-hover">
                                        <button id={'Remove-Add-' + String(index)} hidden style={{ backgroundColor: 'grey', borderRadius: '12px' }} onClick={() => handleRemove(position)}>
                                            <img src={Remove} className='Hover-button' alt="" />
                                        </button>
                                        <button id={'Playlist-' + String(index)} className="hs-dropdown-toggle" hidden style={{ backgroundColor: 'grey', borderRadius: '12px' }} onClick={(e) => handleButtonClick(positions[position].uri, e, positions[position].title)}>
                                            <img src={Playlist} className='Hover-button' alt="" />
                                        </button>
                                    </div>

                                }
                                <p style={{ color: 'whitesmoke', margin: 0 }}>{positions[position].title}</p>
                            </div>
                        );
                    })}
                    {allIds.length > 0 &&
                        <button id="Right-button" onClick={handleRight}>&gt;</button>
                    }
                </div>
                <div className='horizontal-center' style={{ marginTop: '60px' }}>
                    {recommended.length > 0 &&
                        <div>
                            <button className="recommend-button" onClick={() => {
                                setAllIds([]);
                                setPositions({ "imageDrop1": {}, "imageDrop2": {}, "imageDrop3": {}, "imageDrop4": {}, "imageDrop5": {} });
                            }}><h4 className='no-margin'>Clear Seed Songs/Artists</h4></button>
                            <button className="recommend-button" onClick={() => setRecommended([])}><h4 className='no-margin'>Clear Recommendations</h4></button>
                        </div>}
                    {recommended.length === 0 &&
                        <button onClick={recommend} className="py-3 px-4 gap-x-2 mb-5 mt-5 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700">
                            Create Recommendation
                        </button>
                    }
                    <div className='horizontal-center' style={{ width: '73vw' }}>
                        {recommended.length > 0 && <Display authToken={token} query={''} params={{}} showcase={recommended} title={CONSTANTS.TITLE_RECOMMEND} reference={CONSTANTS.REFERENCE_RECOMMEND} setMute={setMute} mute={mute} handleButtonClick={handleButtonClick} handleAdd={handleAdd} playlist={playlist} setAuthToken={setAuthToken} />}
                    </div>
                    {recommended.length > 0 &&
                        <button onClick={() => { setRecommended([]); recommend() }} className="py-3 px-4 gap-x-2 mb-5 text-sm font-semibold rounded-lg border border-transparent bg-purple-600 text-white hover:bg-purple-700">
                            Generate New Recommendations
                        </button>
                    }
                </div>
            </div>
        </div>
    );
}

export default Recommendation;
