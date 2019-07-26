import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { parse } from "query-string";

import { postAuthTicket } from "services/api";
import { SSO_UI_LOGIN_URL, SSO_UI_LOGOUT_URL } from "config";
import { persistAuth } from "utils/auth";
import { makeAtLeastMs } from "utils/promise";
import { setAuth } from "redux/modules/auth";

import Logoset from "assets/LogosetColored.png";
import Accent from "assets/Accent.png";
import Tagline from "assets/Tagline.png";
import "./styles.css";
import { setLoading } from "redux/modules/appState";

function getServiceUrl() {
  return window.location.href.split("?")[0];
}

function redirectToSSOLogin() {
  window.location.replace(SSO_UI_LOGIN_URL);
}

function redirectToSSOLogout() {
  window.location.replace(SSO_UI_LOGOUT_URL);
}

function Login({ history, location }) {
  const [error, setError] = useState(null);
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    async function authenticate(ticket, serviceUrl) {
      try {
        dispatch(setLoading(true));
        const {
          data: { major_id: majorId, user_id: userId, token, err }
        } = await makeAtLeastMs(postAuthTicket(ticket, serviceUrl), 1000);

        if (err) {
          dispatch(setLoading(false));
          setError(err);
        } else {
          dispatch(setAuth({ majorId, userId, token }));
          persistAuth({ majorId, userId, token });
        }
      } catch (e) {
        dispatch(setLoading(false));
        history.replace("/");
      }
    }

    const { ticket } = parse(location.search);
    if (ticket) {
      const serviceUrl = getServiceUrl();
      authenticate(ticket, serviceUrl);
    }
  }, [location, dispatch, history]);

  useEffect(() => {
    if (auth) {
      history.push("/susun");
    }
  }, [auth, history]);

  function renderBroughtToYouBy() {
    return (
      <div className="broughtToYou center">
        <p>
          <span>Brought to you by</span>
          <img src={Logoset} />
        </p>
      </div>
    );
  }
  return (
    <div className="landingPage">
      <div className="tagline">
        <img src={Tagline} />
      </div>
      <div className={"login"}>
        <div className={"center"}>
          <h1>
            Susun<span>Jadwal</span>
          </h1>
        </div>
        {renderBroughtToYouBy()}
        {error ? (
          <React.Fragment>
            <p className="center">{error}</p>
            <div className={"center loginButtonWrapper"}>
              <button className={"loginButton"} onClick={redirectToSSOLogout}>
                LOG OUT
              </button>
            </div>
          </React.Fragment>
        ) : (
          <div className={"center loginButtonWrapper"}>
            <button className={"loginButton"} onClick={redirectToSSOLogin}>
              LOGIN WITH SSO
            </button>
          </div>
        )}
      </div>
      <div className={"accent"}>
        <img src={Accent} />
        {renderBroughtToYouBy()}
      </div>
    </div>
  );
}

export default Login;