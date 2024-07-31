import axios from "axios"

export const getAPI = async (authToken: string, url: string, params: object, setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>) => {
    try {
        const { data } = await axios.get(`https://api.spotify.com/v1/${url}`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            },
            params: params
        })
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 401) {
                setAuthToken('');
            }
        }
        console.log(error);
    }

}