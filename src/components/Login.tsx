
const Login = () => {
    const CLIENT_ID = "65fc2d5eaa7d475f8dd7bf2b7c98c515";
    const REDIRECT_URI = "http://localhost:3000"
    // const CLIENT_SECRET = "40bf45f1b9034f9880b372823d64cea4";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const TYPE = "token";
    return (
        <div>
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${TYPE}&scope=user-top-read,user-library-read,user-read-private,user-read-email,playlist-read-private,playlist-modify-public,playlist-modify-private`}>Login to Spotify</a>
        </div>
    );
};

export default Login;