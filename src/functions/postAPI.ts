import axios from "axios"

export const postAPI = async (authToken: string, id: string, uri: string) => {
    const response = await axios.post(`https://api.spotify.com/v1/playlists/${id}/tracks`,
        {uris: [uri], position: 0},
        {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        }
    )
    
    const statusCode = response.status
    return statusCode;
}