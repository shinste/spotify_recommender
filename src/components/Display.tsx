import React, { useEffect, useCallback} from 'react';
import { useState, useRef } from 'react';
import Playlist from '../icons/playlist.png'
import Add from '../icons/add.png'
import Audio from '../icons/audio.png'
import Mute from '../icons/mute.png'
import Tooltip from '@mui/material/Tooltip';


interface DisplayProps {
    showcase: any[];
    title: string;
    reference: string;
    setMute: React.Dispatch<React.SetStateAction<boolean>>
    mute: boolean;
    handleButtonClick: (uris: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => void
    handleDrag: (e: React.DragEvent, songId: string, title: string, type: string, image: string, uri: string) => void;
    handleAdd: (id: string, title: string, type: string, url: string, uri: string) => void;
    playlist: string
}
    
const Display: React.FC<DisplayProps> = ({ showcase, title, reference, setMute, mute, handleButtonClick, handleDrag, handleAdd, playlist}) => {
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const divRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [errors, setError] = useState<string[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    function scrollContent(direction: string) {
        const container = document.querySelector('#' + reference);
        if (container) {
            const scrollAmount = 800;
            if (direction === 'right') {
                container.scrollTo({
                    left: container.scrollLeft + scrollAmount,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTo({
                    left: container.scrollLeft - scrollAmount,
                    behavior: 'smooth'
                });  
            }
        }   
    }
    const handlePreview = useCallback((url: string, divHover: HTMLElement | null) => {
        const audioPlayer = document.getElementById(url) as HTMLAudioElement;
        let hoverTimer: NodeJS.Timeout | null = null;
        if (audioPlayer === null) {
            setError([...errors, url]);
        } else if (!previews.includes(url)) {
            setPreviews([...previews, url])
            divHover?.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                if (audioPlayer !== currentAudio) {
                    currentAudio?.pause();
                }
                if (!mute) {
                    audioPlayer.volume = .05;
                } else {
                    audioPlayer.volume = 0;
                }
                setCurrentAudio(audioPlayer);
                var isPlaying = audioPlayer.currentTime > 0 && !audioPlayer.paused && !audioPlayer.ended && audioPlayer.readyState > audioPlayer.HAVE_CURRENT_DATA;
                if (!isPlaying) {
                    const playing = audioPlayer.play();
                    if (playing !== undefined) {
                        playing.then(_ => {
                        })
                        .catch(error => {
                            setError([...errors, error])
                            console.log(error);
                        });
                }
               
                }
               
            }, 1000);
            });
        }
       
        if (!previews.includes(url)) {
            divHover?.addEventListener('mouseleave', () => {
                if (hoverTimer) {
                    clearTimeout(hoverTimer);
                    hoverTimer = null;
                }
                if (audioPlayer) {
                    audioPlayer.pause();
                }
            });
        }
    }, [errors, currentAudio, mute]);


    const handleHover = useCallback((identifier: string, status: boolean) => {
        const removeButton = document.getElementById('Add-' + identifier);
        const playlistButton = document.getElementById('Playlist-below-' + identifier);
        const volumeButton = document.getElementById('Volume-' + identifier);
        const divButton = document.getElementById('Hover-' + identifier);
        if (divButton && !status) {
            divButton.style.padding = '3px';
        } else if (divButton) {
            divButton.style.padding = '0px';
        }
        if (removeButton) {
            removeButton.hidden = status;
        }
        if (playlistButton) {
            playlistButton.hidden = status;
        }
        if (volumeButton) {
            volumeButton.hidden = status;
        }
    }, []);

    const memoizedHandleAdd = useCallback((id: string, title: string, type: string, url: string, uri: string) => {
        handleAdd(id, title, type, url, uri);
    }, [handleAdd]);

    useEffect(() => {
        if (mute) {
            if (currentAudio) {
                currentAudio.volume = 0;
            }
            
        }
        else {
            if (currentAudio) {
                currentAudio.volume = .05;
            }
        }
    }, [mute])

    if (showcase.length === 0) {
        return (
            <div style={{width: '100%', textAlign: 'left'}}>
                <h3 style={{display: 'inline', color: 'whitesmoke'}}>{title}</h3>
                <p className='no-data'>Sorry, there is not enough data on Spotify for this account to display anything!</p>
            </div>
        );
    }

    return (
        <div className="Most-played">   
            <div style={{position: 'relative', textAlign: 'left'}}>
                <button className='Scroll-left' onClick={() => scrollContent('left')}>&lt;</button>
                <h3 style={{display: 'inline', color: 'whitesmoke'}}>{title}</h3>
                <button className='Scroll-right' onClick={() => scrollContent('right')}>&gt;</button>
            </div>
            <div id="scroll">
                <div id={reference} className="Display-container">
                    {showcase && showcase.map((item, index) => {
                        if (title === "Saved Songs" || item.added_at) {
                            item = item.track; 
                        }
                        let songTitle = "";
                        if (item.type === "track") {
                            songTitle = item.name + ' by ' + item.artists[0].name;
                        }
                        if (item.type === "artist" && item.images.length === 0) {
                            return (<div></div>)
                        }

                        return (
                            <div key={index} className="Display-div">
                                {item.type === "track" ?
                                    <div 
                                        style={{position: 'relative', height: '70%'}}
                                        draggable
                                        onDragStart={(e) => handleDrag(e, item.id, songTitle, item.type, item.album.images[0].url, item.uri)}
                                        ref={el => divRefs.current[index] = el}
                                        onMouseEnter={() => {handlePreview(item.preview_url, divRefs.current[index]!); handleHover(title + String(index), false);}}
                                        onMouseLeave={() => {handleHover(title + String(index), true);}}
                                    >
                                        <img src={item.album.images[0].url} className="Display-img" loading="lazy" alt=""/>
                                        <div id={"Hover-" + title + String(index)} className="Button-hover">
                                            <Tooltip title="Add to Selection">
                                                <button id={'Add-' + title + String(index)} hidden className="hs-tooltip-toggle tool-button" onClick={() => memoizedHandleAdd(item.id, item.name, item.type, item.album.images[0].url, item.uri)}>
                                                    <img src={Add} className="Hover-button" alt=""/>
                                                    <span className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-neutral-700" role="tooltip">
                                                        Tooltip on top
                                                    </span>
                                                </button>
                                            </Tooltip>
                                            <Tooltip title="Toggle Preview">
                                                <button id={'Volume-' + title + String(index)} hidden onClick={() => setMute(!mute)} className='Volume-button'>
                                                    <img id="volume-button" src={mute ? Mute : Audio} alt=""/>
                                                </button>
                                            </Tooltip>
                                            <Tooltip title={`Add Track to ${ playlist ? playlist : 'Playlist'}`}>
                                                <button onClick={(e) => handleButtonClick(item.uri, e, item.name)} hidden id={'Playlist-below-' + title + String(index)} style={{marginLeft: '15px', backgroundColor: 'grey', borderRadius: '12px'}} >
                                                    <img src={Playlist} className="Hover-button" alt=""/>
                                                </button>
                                            </Tooltip>
                                        </div>
                                                                        
                                        <div className="Display-p">
                                            <p style={{marginBottom: 0}}>{songTitle}</p>
                                        </div>
                                        <audio id={item.preview_url}><source src={item.preview_url} type="audio/mpeg"/></audio>
                                        {errors.includes(item.preview_url) && <p id="Unavailable" >Unavailable Preview</p>}
                                    </div>
                                    :
                                    <div
                                        style={{position: 'relative'}}
                                        draggable
                                        onDragStart={(e) => handleDrag(e, item.id, item.name, item.type, item.images[0].url, item.uri)}
                                        onMouseEnter={() => handleHover(title + String(index), false)}
                                        onMouseLeave={() => handleHover(title + String(index), true)}
                                    >
                                        <img src={item.images[0].url} className="Display-img" alt=""/>
                                        <div id={"Hover-" + title + String(index)} className="Button-hover">
                                            <Tooltip title="Add to Selection">
                                                <button id={'Add-' + title + String(index)}hidden style={{backgroundColor: 'grey', borderRadius: '12px'}} onClick={() => memoizedHandleAdd(item.id, item.name, item.type, item.images[0].url, 'not available')}>
                                                    <img src={Add} className='Hover-button' alt=""/>
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
                    <div style={{minWidth: '520px'}}></div>
                </div>
            </div>
    </div>
    );
};

export default Display;