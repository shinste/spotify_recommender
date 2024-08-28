import * as CONSTANTS from "../constants/loginConstants";

const Login = () => {
  const CLIENT_ID = CONSTANTS.CLIENT_ID;
  const REDIRECT_URI = CONSTANTS.REDIRECT_LOCAL;
  const AUTH_ENDPOINT = CONSTANTS.AUTH_ENDPOINT;
  const TYPE = CONSTANTS.TYPE;

  return (
    <div id="Login-body">
      <div id="Hold-login">
        <div className="Vertical-flex">
          <div id="Title-div">
            <h3 id="Login-title">Spotify Song Recommender</h3>
            <h3 id="Login-label">Customize your recommendations</h3>
          </div>
          <div id="Disclaimer">
            <h5 className="mt-0 mb-0" style={{ fontSize: "30px" }}>
              What is being authorized on my account?
            </h5>
            <p>
              To create the best possible experience with this application,
              certain permissions are required. These include access to your
              profile information, playlists, top songs and artists, and more.
              The primary use of Spotify's API in this application is to view
              your data. The only action that will modify your account is the
              ability to add selected songs to your existing playlists. The link
              on the left will direct you to Spotify's authorization disclaimer
              page, where you can see a detailed list of the information your
              account will share.
            </p>
          </div>
        </div>

        <div id="Gif-holder">
          <iframe
            className="No-hover"
            src="https://giphy.com/embed/mCyRzRJINnNUb62vLb"
            width="480"
            height="480"
            frameBorder="0"
            title="SpotifyGif"
          ></iframe>
          <p id="important">
            IMPORTANT: Use testing credentials:{" "}
            <span style={{ display: "block", fontWeight: "bolder" }}>
              [ username: stephenshin111@gmail.com | password: spotifytesting1!
              ]
            </span>{" "}
            if you have not added your email to this whitelist. email
            stephenshin1@hotmail.com for full access with your own account.
          </p>
          <div id="Description-div">
            <h3 id="Description">Let Spotify know you approve!</h3>
            <a
              href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${TYPE}&scope=user-top-read,user-library-read,user-read-private,user-read-email,playlist-read-private,playlist-modify-public,playlist-modify-private`}
            >
              <button id="Sign-in">Sign In</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
