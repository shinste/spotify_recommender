import { useEffect, useState } from "react";

import Home from "../components/Home";
import Login from "../components/Login";

const HomePage = () => {
    const [authToken, setAuthToken] = useState<string | undefined | null>('');

    useEffect(() => {
        const hash = window.location.hash;
        let token: string | undefined | null
        if (!token && hash) {
            token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'))?.split('=')[1];
            window.location.hash = ""
            if (!token) {
                throw new Error("Token not found in localStorage");
            }
            window.localStorage.setItem("token", token)
        }
        token = window.localStorage.getItem("token");
        setAuthToken(token);
    }, []);

    return (
        <div>
            {!authToken ?
                <Login />
                :
                <Home authToken={authToken} setAuthToken={setAuthToken} />
            }
        </div>
    );
};

export default HomePage;