import { useEffect, useState } from "react";

const useDisplayHover = (reference: string, previews: string[], mute: boolean, refState: React.RefObject<boolean>) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

    // Scrolls left and right on displays
    const scrollContent = (direction: string) => {
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

    // If song hasn't been previewed previously, will attach event listener to play preview
    const handlePreview = (url: string, divHover: HTMLElement | null) => {
        const audioPlayer = document.getElementById(url) as HTMLAudioElement;
        let hoverTimer: NodeJS.Timeout | null = null;
        if (audioPlayer === null) {
            setErrors([...errors, url]);
        } else if (!previews.includes(url)) {
            previews.unshift(url);
            // Will update the current audio, and play the preview of the track if not muted
            const handleMouseEnter = () => {
                hoverTimer = setTimeout(() => {
                    if (audioPlayer !== currentAudio) {
                        currentAudio?.pause();
                    }
                    audioPlayer.volume = refState.current ? 0 : 0.05;
                    setCurrentAudio(audioPlayer);
                    if (audioPlayer.currentTime === 0 || audioPlayer.paused) {
                        const playing = audioPlayer.play();
                        if (playing !== undefined) {
                            playing.catch(error => {
                                console.log(error);
                            });
                        }
                    }
                }, 1000);
            };

            // Pause audio if user leaves the track display
            const handleMouseLeave = () => {
                if (hoverTimer) {
                    clearTimeout(hoverTimer);
                    hoverTimer = null;
                }
                audioPlayer.pause();
            };

            divHover?.addEventListener('mouseenter', handleMouseEnter);
            divHover?.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                divHover?.removeEventListener('mouseenter', handleMouseEnter);
                divHover?.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    };

    // Handles hovering of display, appearance and disappearance of buttons
    const handleHover = (identifier: string, status: boolean) => {
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
    };
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

    return { scrollContent, handlePreview, handleHover, errors }
}

export default useDisplayHover;