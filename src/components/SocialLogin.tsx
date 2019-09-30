import * as React from 'react';
import {Col, Row} from "react-bootstrap";
import BooghApi from "../api/BooghApi";
import * as styles from "../css-modules/SocialLogin.module.css";
import config from '../config';
import TelegramLoginButton from 'react-telegram-login';

export function SocialLogin(props) {

    function redirectToTwitter(event: any) {
        BooghApi.askForRequestToken().then( oauth_token =>{
            //redirect the user to twitter log in page
            BooghApi.redirectToTwitter(oauth_token);
        });
        event.preventDefault();
    }

    return (
        <div>
            <Row>
                <Col md={12} xs={12} style={{margin: '10px auto 0 auto'}}>
                    <TelegramLoginButton dataOnauth={props.handleTelegramResponse} botName={config.telegramBotName}/>
                </Col>
            </Row>
            <Row>
                <Col md={6} xs={6} style={{paddingLeft: '20%'}}>
                    <a onClick={redirectToTwitter} href={`${config.apiURL}/social/twitter/request_token?redirectUri=${encodeURIComponent(config.socialLoginRedirect)}`}>
                        <img style={{height:72, width:72}} src={require('../assets/twitter.png')} />
                        <div className={styles.socialText}>Twitter</div>
                    </a>
                </Col>
                <Col md={6} xs={6} style={{paddingRight: '20%'}}>
                    <a onClick={BooghApi.redirectToGoogle}>
                        <img style={{height:72, width:72}} src={require('../assets/google.png')} />
                        <div className={styles.socialText}>Google</div>
                    </a>
                </Col>
            </Row>
        </div>
    )
}
