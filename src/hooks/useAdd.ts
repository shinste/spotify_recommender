import { useCallback, useState } from "react";
const useAdd = (setError: React.Dispatch<React.SetStateAction<string>>) => {
    const [order, setOrder] = useState<string[]>(["imageDrop1", "imageDrop2", "imageDrop3", "imageDrop4", "imageDrop5"])
    const [positions, setPositions] = useState<{ [key: string]: { [key: string]: string } }>({ "imageDrop1": {}, "imageDrop2": {}, "imageDrop3": {}, "imageDrop4": {}, "imageDrop5": {} });
    const [allIds, setAllIds] = useState<string[]>([]);
    const handleAdd = useCallback((id: string, title: string, type: string, url: string, uri: string) => {
        const middleSlot = order[2];
        const openSlots = order.filter((value) =>
            Object.keys(positions[value]).length === 0
        );
        if (allIds.includes(id)) {
            setError('This track/artist is already added!');
        } else if (!openSlots[0]) {
            setError('You have reached your max number of tracks/artists!');
        } else {
            let insertSlot = openSlots[0];
            if (openSlots.includes(middleSlot)) {
                insertSlot = middleSlot;
            }
            setPositions(Object.fromEntries(
                Object.entries(positions).map(([key, value]) =>
                    key === insertSlot ? [key, { url: url, seedId: id, type: type, title: title, uri: uri }] : [key, value]
                )
            ));
            setAllIds([...allIds, id]);
        }
    }, [order, positions, allIds])
    return { handleAdd, order, setOrder, allIds, setAllIds, positions, setPositions }
}

export default useAdd;