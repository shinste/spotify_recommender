import React, { useRef } from 'react';
import Playlist from '../icons/playlist.png'
import Add from '../icons/add.png'
import Audio from '../icons/audio.png'
import Mute from '../icons/mute.png'
import Tooltip from '@mui/material/Tooltip';
import useSpotifyAPI from '../hooks/useSpotifyAPI';
import { handleDrag } from '../functions/handleDrag';
import useDisplayHover from '../hooks/useDisplayHover';
import * as CONSTANTS from '../constants/displayConstants';

interface DisplayProps {
    authToken: string;
    query: string;
    params: {};
    showcase?: any[];
    title: string;
    reference: string;
    setMute: React.Dispatch<React.SetStateAction<boolean>>
    mute: boolean;
    handleButtonClick: (uris: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => void
    handleAdd: (id: string, title: string, type: string, url: string, uri: string) => void;
    playlist: string
    setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>
}

const Display: React.FC<DisplayProps> = ({ authToken, query, params, showcase, title, reference, setMute, mute, handleButtonClick, handleAdd, playlist, setAuthToken }) => {
    const refState = useRef(mute);
    const divRefs = useRef<(HTMLDivElement | null)[]>([]);
    const _setRefState = (data: boolean) => {
        refState.current = data;
        setMute(data);
    }
    let previews: string[] = [];
    let displayData: any[] = [];

    // Display hover actions and events
    const { scrollContent, handlePreview, handleHover, errors } = useDisplayHover(reference, previews, mute, refState);

    // Spotify API initial data fetch
    const { statusCode, data } = useSpotifyAPI<{ items: any[] }>(authToken, query, params, setAuthToken);

    if (showcase) {
        displayData = showcase;
    } else {
        if (data) {
            displayData = data.items;
        }
    }

    // In case the user doesn't have any recorded tracks/artists in the category or api goes wrong
    if ((displayData && displayData.length === 0) || (statusCode !== 201 && statusCode !== 200 && statusCode !== 0)) {
        return (
            <div />
        );
    }


    return (
        <div className="Most-played">
            <div style={{ position: 'relative', textAlign: 'left' }}>
                <button className='Scroll-left' onClick={() => scrollContent('left')}>&lt;</button>
                <h3 style={{ display: 'inline', color: 'whitesmoke' }}>{title}</h3>
                <button className='Scroll-right' onClick={() => scrollContent('right')}>&gt;</button>
            </div>
            <div id="scroll">
                <div id={reference} className="Display-container">
                    {displayData && displayData.map((item, index) => {
                        if (title === CONSTANTS.TITLE_SAVED || item.added_at) {
                            item = item.track;
                        }
                        let songTitle = "";
                        if (item.type === CONSTANTS.TYPE_TRACK) {
                            songTitle = item.name + ' by ' + item.artists[0].name;
                        }
                        if (item.type === CONSTANTS.TYPE_ARTIST && item.images.length === 0) {
                            return (<div></div>)
                        }
                        return (
                            <div key={index} className="Display-div">
                                {item.type === CONSTANTS.TYPE_TRACK ?
                                    <div
                                        style={{ position: 'relative', height: '70%' }}
                                        draggable
                                        onDragStart={(e) => handleDrag(e, item.id, songTitle, item.type, item.album.images[0].url, item.uri)}
                                        ref={el => divRefs.current[index] = el}
                                        onMouseEnter={() => { handlePreview(item.preview_url, divRefs.current[index]!); handleHover(title + String(index), false); }}
                                        onMouseLeave={() => { handleHover(title + String(index), true); }}
                                    >
                                        <img src={item.album.images[0].url} style={{ height: '200px', width: '200px' }} loading="lazy" alt="" />
                                        <div id={"Hover-" + title + String(index)} className="Button-hover">
                                            <Tooltip title="Add to Selection">
                                                <button id={'Add-' + title + String(index)} hidden className="hs-tooltip-toggle tool-button" onClick={() => handleAdd(item.id, item.name, item.type, item.album.images[0].url, item.uri)}>
                                                    <img src={Add} className="Hover-button" alt="" />
                                                    <span className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-neutral-700" role="tooltip">
                                                        Tooltip on top
                                                    </span>
                                                </button>
                                            </Tooltip>
                                            <Tooltip title="Toggle Preview">
                                                <button id={'Volume-' + title + String(index)} hidden onClick={() => _setRefState(!mute)} className='Volume-button'>
                                                    <img id="volume-button" src={mute ? Mute : Audio} alt="" />
                                                </button>
                                            </Tooltip>
                                            <Tooltip title={`Add Track to ${playlist ? playlist : 'Playlist'}`}>
                                                <button onClick={(e) => handleButtonClick(item.uri, e, item.name)} hidden id={'Playlist-below-' + title + String(index)} style={{ marginLeft: '15px', backgroundColor: 'grey', borderRadius: '12px' }} >
                                                    <img src={Playlist} className="Hover-button" alt="" />
                                                </button>
                                            </Tooltip>
                                        </div>

                                        <div className="Display-p">
                                            <p style={{ marginBottom: 0 }}>{songTitle}</p>
                                        </div>
                                        <audio id={item.preview_url}><source src={item.preview_url} type="audio/mpeg" /></audio>
                                        {errors.includes(item.preview_url) && <p id="Unavailable" >Unavailable Preview</p>}
                                    </div>
                                    :
                                    <div
                                        style={{ position: 'relative' }}
                                        draggable
                                        onDragStart={(e) => handleDrag(e, item.id, item.name, item.type, item.images[0].url, item.uri)}
                                        onMouseEnter={() => handleHover(title + String(index), false)}
                                        onMouseLeave={() => handleHover(title + String(index), true)}
                                    >
                                        <img src={item.images[0].url} className="Display-img" alt="" />
                                        <div id={"Hover-" + title + String(index)} className="Button-hover">
                                            <Tooltip title="Add to Selection">
                                                <button id={'Add-' + title + String(index)} hidden style={{ backgroundColor: 'grey', borderRadius: '12px' }} onClick={() => handleAdd(item.id, item.name, item.type, item.images[0].url, 'not available')}>
                                                    <img src={Add} className='Hover-button' alt="" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                        <div className="Display-p">
                                            <p>{item.name}</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        );
                    })}
                    <div style={{ minWidth: '520px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Display;