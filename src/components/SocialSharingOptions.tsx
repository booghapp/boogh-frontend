import * as React from 'react';
import * as styles from "../css-modules/SocialSharing.module.css";
import {Trans} from "react-i18next";

interface SocialSharingOptionsProps {
    reportURL: string;
}

export function SocialSharingOptions(props: SocialSharingOptionsProps) {

    function shareWithEmail(event: any) {
        window.location.href = "mailto:?subject=Boogh report sharing&body=Check out this site " + props.reportURL + " .";
        event.preventDefault();
    }

    function shareWithFacebook(event: any) {
        window.open("https://www.facebook.com/dialog/share?" +
            "app_id=448407189234521" +
            "&display=popup" +
            "&href=" + encodeURI(props.reportURL),
            "The Facebook", "height=269,width=550,resizable=1")
        event.preventDefault();
    }

    function shareWithTwitter(event: any) {
        // You can add arguments to the url, like a sharable url, text and so on.
        window.open("https://twitter.com/intent/tweet?url=" + props.reportURL,"Twitter", "height=269,width=550,resizable=1");
        event.preventDefault();
    }

    function copyToClipBoard() {
        let pseudoHtmlElement = document.createElement('textarea');
        pseudoHtmlElement.value = props.reportURL;
        let socialSharingOptions = document.getElementById("socialSharingOptions");
        if (socialSharingOptions != null) {
            socialSharingOptions.appendChild(pseudoHtmlElement);
            pseudoHtmlElement.select();
            document.execCommand("copy");
            socialSharingOptions.removeChild(pseudoHtmlElement);
        }
    }

    return (
        <div id={"socialSharingOptions"}>
            <a className={styles.sharingInfoItem} onClick={shareWithTwitter} tabIndex={1} href={"https://twitter.com/intent/tweet?url=" + props.reportURL}>
                <Trans>Share to Twitter</Trans>
                <img className={styles.sharingInfoItemImg} src={require("../assets/twitter_share.png")}/>
            </a>
            <a className={styles.sharingInfoItem} href={"tg://msg_url?url=" + encodeURI(props.reportURL)} tabIndex={2}>
                <Trans>Share to Telegram</Trans>
                <img className={styles.sharingInfoItemImg}  src={require("../assets/telegram_share.png")}/>
            </a>
            <a className={styles.sharingInfoItem} onClick={shareWithFacebook} tabIndex={3} href={"https://www.facebook.com/dialog/share?" +
                "app_id=448407189234521" + "&display=popup" + "&href=" + encodeURI(props.reportURL)}>
                <Trans>Share to Facebook</Trans>
                <img className={styles.sharingInfoItemImg}  src={require("../assets/facebook_share.png")}/>
            </a>
            <a className={styles.sharingInfoItem} onClick={shareWithEmail} tabIndex={4} href={"mailto:?subject=Boogh report sharing&body=Check out this site \" + props.reportURL"}>
                <Trans>Email</Trans>
                <img className={styles.sharingInfoItemImg}  src={require("../assets/email_share.png")}/>
            </a>
            <div className={styles.sharingInfoItem} onClick={copyToClipBoard} tabIndex={5}>
                <Trans>Copy Link</Trans>
                <img className={styles.sharingInfoItemImg}  src={require("../assets/copylink_share.png")}/>
            </div>
        </div>
    )
}