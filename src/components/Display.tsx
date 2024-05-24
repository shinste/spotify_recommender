import React from 'react';
import { useState, useRef } from 'react';

interface DisplayProps {
    showcase: any[];
    title: string;
    reference: string;
    mute?: boolean;
    handleDrag: (e: React.DragEvent, songId: string, title: string, type: string, image: string) => void;
}

const Display: React.FC<DisplayProps> = ({ showcase, title, reference, mute, handleDrag }) => {
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const divRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [error, setError] = useState<string[]>([]);
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

    const handlePreview = (url: string, divHover: HTMLElement | null) => {
        console.log(mute);
        const audioPlayer = document.getElementById(url) as HTMLAudioElement;
        let hoverTimer: NodeJS.Timeout | null = null;
        if (audioPlayer === null) {
            setError([...error, url]);
        } else {
            divHover?.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                if (audioPlayer !== currentAudio) {
                    currentAudio?.pause();
                }
                setCurrentAudio(audioPlayer);
                if (mute) {
                    audioPlayer.volume = 0;
                } else {
                    audioPlayer.volume = .1;
                }
                
                audioPlayer.load();
                audioPlayer.play().catch((error) => {
                    console.error("Error playing audio:", error);
                });
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
    }

    return (
        <div className="Most-played">   
            <div style={{width: '100%'}}>
                <button className='Scroll-button' onClick={() => scrollContent('left')}>&lt;</button>
                <h3 style={{display: 'inline'}}>{title}</h3>
                <button className='Scroll-button' onClick={() => scrollContent('right')}>&gt;</button>
                
            </div>
            <div id={reference} className="Display-container" >
                {showcase && showcase.map((item, index) => {
                    if (title === "Saved Songs") {
                        item = item.track;
                    }
                    let songTitle = "";
                    if (item.type === "track") {
                        songTitle = item.name + ' by ' + item.artists[0].name;
                    }
                    return (
                        <div className="Display-div">
                            {item.type === "track" ?
                                <div 
                                    draggable
                                    onDragStart={(e) => handleDrag(e, item.id, songTitle, item.type, item.album.images[0].url)}
                                    ref={el => divRefs.current[index] = el}
                                    onMouseEnter={() => handlePreview(item.preview_url, divRefs.current[index]!)}
                                >
                                    <img src={item.album.images[0].url} className="Display-img"/>
                                    <div className="Display-p">
                                        <p style={{marginBottom: 0}}>{songTitle}</p>
                                    </div>
                                    <audio id={item.preview_url} ><source src={item.preview_url} type="audio/mpeg"/></audio>
                                    {error.includes(item.preview_url) && <p style={{textAlign: 'center', color: 'red', margin: 0}}>Unavailable Preview</p>}
                                </div>
                                :
                                <div
                                    draggable
                                    onDragStart={(e) => handleDrag(e, item.id, item.name, item.type, item.images[0].url)}
                                >
                                    <img src={item.images[0].url} className="Display-img"/>
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
}

export default Display;