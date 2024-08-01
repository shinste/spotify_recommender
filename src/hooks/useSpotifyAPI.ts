import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type UseSpotifyAPIResponse<T> = {
  statusCode: number;
  data?: T;
  error?: string;
};

const useSpotifyAPI = <T,>(authToken: string, query: string, params: object, setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>) => {
  const [response, setResponse] = useState<UseSpotifyAPIResponse<T>>({
    statusCode: 0,
    data: undefined,
    error: undefined,
  });


  const fetchData = useCallback(async () => {
    if (query.length === 0) {
      return response;
    }

    try {
      const apiResponse = await axios.get(`https://api.spotify.com/v1/${query}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: params,
      });
      if (query !== 'search') {
        setResponse({
          statusCode: apiResponse.status,
          data: query === 'search' ? apiResponse.data.tracks : apiResponse.data,
        });
      } else {
        setResponse({
          statusCode: apiResponse.status,
          data: apiResponse.data.tracks ? apiResponse.data.tracks : apiResponse.data.artists,
        });
      }


    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          setAuthToken('');
          window.localStorage.removeItem('token');
        }
      }
      setResponse({
        statusCode: 500,
        data: undefined,
        error: 'An error occurred.',
      });
    }
  }, [authToken, query, params]);

  useEffect(() => {
    fetchData();
  }, []);

  return response;
};

export default useSpotifyAPI;
