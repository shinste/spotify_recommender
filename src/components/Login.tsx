
const Login = () => {
    const CLIENT_ID = "65fc2d5eaa7d475f8dd7bf2b7c98c515";
    const REDIRECT_URI = "http://localhost:3000"
    // const CLIENT_SECRET = "40bf45f1b9034f9880b372823d64cea4";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const TYPE = "token";
    return (
        <body id="Login-body">
            <div style={{paddingTop: '140px'}} className="Flex">
                <div id="Title-div">
                    <h3 id="Login-title">Spotify Song Recommender</h3>
                    <h3 id="Login-label">Find Better Songs</h3>
                </div>
                <div id="Gif-holder">
                    <iframe className="No-hover" src="https://giphy.com/embed/mCyRzRJINnNUb62vLb" width="480" height="480" frameBorder="0"></iframe>
                    <div id="Description-div">
                        <h3 id="Description">Let Spotify know you approve!</h3>
                        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${TYPE}&scope=user-top-read,user-library-read,user-read-private,user-read-email,playlist-read-private,playlist-modify-public,playlist-modify-private`}>
                            <button  id="Sign-in">Sign In</button>
                        </a>    
                        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${TYPE}&scope=user-top-read,user-library-read,user-read-private,user-read-email,playlist-read-private,playlist-modify-public,playlist-modify-private`}>dsjfnks</a>
                    </div>
                </div>
                
            </div>
            <div className="Flex">
                <div id="Disclaimer">
                        <h5 className="mt-0"style={{fontSize: '25px'}}>What is being authorized on my account?</h5>
                        <p>There are a couple of permission that are essential to creating the optimal experience while using this application.
                        This includes permission to view data about your profile, playlists, most popular songs and artists, and etc. 
                        Most of the use of Spotify's API for your account is intended to strictly view data, and the only featur that would make
                        changes to your account would be the ability to add chosen songs to the playlists you have in your library. The link to 
                        the left will send you to Spotify's authorization disclaimer page that will go more into detail before you fully allow this 
                        application to access account data.
                        </p>
                    </div>

                </div>
            
        </body>
    );
};

export default Login;