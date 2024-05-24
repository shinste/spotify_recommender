import axios from "axios";

const search = async (token: string, purpose: string, searchKey: string) => {
        console.log('click');
        const {data} = await axios.get(`https://api.spotify.com/v1/${search}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                q: searchKey,
                limit: 5,
                type: "artist"
            }
        })
        console.log(data.artists.items)
    
    return data.artists.items
}

export default search;