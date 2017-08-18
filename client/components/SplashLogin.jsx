import React from 'react';
import { render } from 'react-dom';
import {Grid, Col} from 'react-bootstrap';
import { Button } from 'react-bootstrap';

class SplashLogin extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="splash">
				<div className="logo">
					<img className="logoImage" src={"/images/logo.png"} />
				</div>
				<h1 className="appName">Concreet</h1>
				<h4 className="tagline">Never miss a meeting again</h4>
				<a href="/auth/google"><button className="signinButton">Sign in with Google</button></a>
        <div className="other-sign-in">
          <a href="/auth/google/other">Sign in with a different account</a>
        </div>
				<div>
					<img className="meetingImage" src={"/images/meeting1.jpg"} />
				</div>
				<div>
					<img className="meetingImage" src={"/images/meeting2.jpg"} />
				</div>
				<div>
					<img className="meetingImage" src={"/images/meeting3.jpg"} />
				</div>
				<div>
					<img className="meetingImage" src={"/images/meeting4.jpg"} />
				</div>
			</div>
		)
	}
}

export default SplashLogin;
