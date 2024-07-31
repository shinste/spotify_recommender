export const handleDrag = (e: React.DragEvent, id: string, title: string, type: string, image: string, uri: string) => {
    e.dataTransfer.setData('title', title);
    e.dataTransfer.setData('image', image);
    e.dataTransfer.setData('id', id);
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('uri', uri);
}