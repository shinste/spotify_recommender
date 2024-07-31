
const useDisplayInteractions = (positions: { [key: string]: { [key: string]: string } }, allIds: string[], setAllIds: React.Dispatch<React.SetStateAction<string[]>>, setPositions: React.Dispatch<React.SetStateAction<{ [key: string]: { [key: string]: string } }>>, order: string[], setOrder: React.Dispatch<React.SetStateAction<string[]>>) => {

    const handleDrop = (e: React.DragEvent, spot: string) => {
        const seedTitle = e.dataTransfer.getData('title') as string;
        const seedId = e.dataTransfer.getData('id') as string;
        const imageUrl = e.dataTransfer.getData('image') as string;
        const type = e.dataTransfer.getData('type') as string;
        const imageSpot = document.getElementById(spot) as HTMLImageElement;
        let newPositions = { ...positions };
        let newIds = [...allIds];
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
                        key === spot ? [key, { url: imageUrl, seedId: seedId, type: type, title: seedTitle }] : [key, value]
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
        ));
        setAllIds(allIds.filter((value) => value !== positions[position].seedId));
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
    return { handleLeft, handleRight, handleHover, handleRemove, handleDrop, handleDragOver }
}

export default useDisplayInteractions