import {Row, Col} from "react-bootstrap";
import * as React from 'react';
import {Trans} from "react-i18next";
import * as styles from "../css-modules/Footer.module.css";

type FooterProps = {
    history: any,
    view: string;
}

export class Footer extends React.Component<FooterProps> {
    constructor(props: any){
        super(props);

        this.viewHelp = this.viewHelp.bind(this);
        this.viewAbout = this.viewAbout.bind(this);
        this.viewPrivacyPolicy = this.viewPrivacyPolicy.bind(this);
        this.viewTermsOfUse = this.viewTermsOfUse.bind(this);
    }

    viewHelp(event: any) {
        this.props.history.push("/help");
        event.preventDefault();
    }

    viewAbout(event: any) {
        this.props.history.push("/about");
        event.preventDefault();
    }

    viewTermsOfUse(event: any) {
        this.props.history.push("/terms-of-use");
        event.preventDefault();
    }

    viewPrivacyPolicy(event: any) {
        this.props.history.push("/privacy-policy");
        event.preventDefault();
    }

    render(){
        let footerStyle = '';
        if (this.props.view === 'gone') {
            footerStyle = styles.footerDisplay;
        }
        return (
            <footer className={footerStyle}>
                <hr className={styles.footerHr}/>
                <Row className={styles.footerContainer}>
                    <Col md={6}  mdPush={6}>
                        <img src={require("../assets/Boogh_logo.png")} className={styles.footerLogo}/>
                    </Col>
                    <Col md={6} className={styles.footerLinksContainer} mdPull={6}>
                        <a className={styles.footerLinks} onClick={this.viewAbout} href={"/about"}><Trans>About</Trans></a>
                        <a className={styles.footerLinks} onClick={this.viewHelp} href={"/help"}><Trans>Help</Trans></a>
                        <a className={styles.footerLinks} onClick={this.viewTermsOfUse} href={"/terms-of-use"}><Trans>Terms of Use</Trans></a>
                        <a className={styles.footerLinks} onClick={this.viewPrivacyPolicy} href={"/privacy-policy"}><Trans>Privacy Policy</Trans></a>
                    </Col>
                </Row>
            </footer>
        )
    }
}
