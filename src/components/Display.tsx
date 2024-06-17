import React, { useEffect, useCallback} from 'react';
import { useState, useRef } from 'react';
import Playlist from '../icons/playlist.png'
import Add from '../icons/add.png'
import Audio from '../icons/audio.png'
import Mute from '../icons/mute.png'


interface DisplayProps {
    showcase: any[];
    title: string;
    reference: string;
    setMute: React.Dispatch<React.SetStateAction<boolean>>
    mute: boolean;
    handleButtonClick: (uris: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>, name: string) => void
    handleDrag: (e: React.DragEvent, songId: string, title: string, type: string, image: string) => void;
    handleAdd: (id: string, title: string, type: string, url: string) => void;
}
    
const Display: React.FC<DisplayProps> = ({ showcase, title, reference, setMute, mute, handleButtonClick, handleDrag, handleAdd}) => {
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const divRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [errors, setError] = useState<string[]>([]);
    function scrollContent(direction: string) {
        const container = document.querySelector('#' + reference);
        if (container) {
            const scrollAmount = 400;
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
        } else {
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
                const playing = audioPlayer.play();
                if (playing !== undefined) {
                    playing.then(_ => {
                        console.log('yay it worked');
                      })
                      .catch(error => {
                        setError([...errors, error])
                        console.log(error);
                      });
                }
                
            }, 1000);
            });
        }
        

        divHover?.addEventListener('mouseleave', () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            if (audioPlayer) {
                audioPlayer.pause();
            }
        });
    }, [currentAudio, mute]);

    const handleHover = (identifier: string, status: boolean) => {
        const removeButton = document.getElementById('Add-' + identifier);
        const playlistButton = document.getElementById('Playlist-below-' + identifier);
        const volumeButton = document.getElementById('Volume-' + identifier);
        if (removeButton) {
            removeButton.hidden = status;
        }
        if (playlistButton) {
            playlistButton.hidden = status;
        }
        if (volumeButton) {
            volumeButton.hidden = status;
        }
    }

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
    }, [mute, currentAudio])

    return (
        <div className="Most-played">   
            <div style={{width: '100%'}}>
                <button className='Scroll-button' onClick={() => scrollContent('left')}>&lt;</button>
                <h3 style={{display: 'inline'}}>{title}</h3>
                <button className='Scroll-button' onClick={() => scrollContent('right')}>&gt;</button>
                
            </div>
            <div id={reference} className="Display-container" >
                {showcase && showcase.map((item, index) => {
                    if (title === "Saved Songs" || item.added_at) {
                        item = item.track; 
                    }
                    console.log(item, 'check display');
                    let songTitle = "";
                    if (item.type === "track") {
                        songTitle = item.name + ' by ' + item.artists[0].name;
                    }
                    if (item.type === "artist" && item.images.length === 0) {
                        return (<div></div>)
                    }
                    return (
                        <div className="Display-div" key={"Display-div" + index}>
                            {item.type === "track" ?
                                <div 
                                    draggable
                                    onDragStart={(e) => handleDrag(e, item.id, songTitle, item.type, item.album.images[0].url)}
                                    ref={el => divRefs.current[index] = el}
                                    onMouseEnter={() => {handlePreview(item.preview_url, divRefs.current[index]!); handleHover(title + String(index), false);}}
                                    onMouseLeave={() => {handleHover(title + String(index), true);}}
                                >
                                    <img src={item.album.images[0].url} className="Display-img" alt=""/>
                                    <div className="Button-hover" style={{flexDirection: 'column'}}>
                                        <div className='Flex'>
                                            <button id={'Add-' + title + String(index)}hidden style={{marginRight: '15px', backgroundColor: 'grey'}} onClick={() => handleAdd(item.id, item.name, item.type, item.album.images[0].url)}>
                                                <img src={Add} className="Hover-button" alt=""/>
                                            </button>
                                            <button onClick={(e) => handleButtonClick(item.uri, e, item.name)} id={'Playlist-below-' + title + String(index)} hidden style={{marginLeft: title !== 'Recommended Songs' ? '15px' : 0, backgroundColor: 'grey'}} >
                                                <img src={Playlist} className="Hover-button" alt=""/>
                                            </button>
                                            
                                        </div>
                                        <button id={'Volume-' + title + String(index)} onClick={() => setMute(!mute)} hidden className='Volume-button'>
                                            <img id="volume-button" src={mute ? Mute : Audio} alt=""/>
                                        </button>
                                    </div>
                                    <div className="Display-p">
                                        <p style={{marginBottom: 0}}>{songTitle}</p>
                                    </div>
                                    <audio id={item.preview_url} ><source src={item.preview_url} type="audio/mpeg"/></audio>
                                    {errors.includes(item.preview_url) && <p id="Unavailable" >Unavailable Preview</p>}
                                </div>
                                :
                                
                                <div
                                    draggable
                                    onDragStart={(e) => handleDrag(e, item.id, item.name, item.type, item.images[0].url)}
                                    onMouseEnter={() => handleHover(title + String(index), false)}
                                    onMouseLeave={() => handleHover(title + String(index), true)}
                                >
                                    <img src={item.images[0].url} className="Display-img" alt=""/>
                                    <div className="Button-hover">
                                        <button id={'Add-' + title + String(index)}hidden style={{backgroundColor: 'grey'}} onClick={() => handleAdd(item.id, item.name, item.type, item.images[0].url)}>
                                            <img src={Add} className='Hover-button' alt=""/>
                                        </button>
                                    </div>
                                    <div className="Display-p">
                                        <p>{item.name}</p>
                                    </div>
                                </div>
                            }
                        </div>
                        
                    );
                })}
            </div>
    </div>
    );
};

export default Display;