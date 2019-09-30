import * as React from 'react';
import { Form } from './Form';
import {Trans} from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import BooghApi from "../api/BooghApi";
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import * as styles from '../css-modules/Reset.module.css';

interface ResetPasswordProps extends RouteComponentProps{
    setNavbarView: Function,
}

type ResetPasswordState = {
    email: string,
    showConfirmation: boolean
}

export class ResetPassword extends React.Component<ResetPasswordProps, ResetPasswordState> {

    constructor(props: ResetPasswordProps) {
        super(props);
        this.state = {email: '', showConfirmation: false};
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.viewLogin = this.viewLogin.bind(this);
        this.sendResetPasswordEmail = this.sendResetPasswordEmail.bind(this);
        this.close = this.close.bind(this);
    }

    componentDidMount(): void {
        this.props.setNavbarView('gone');
    }

    componentWillUnmount(): void {
        this.props.setNavbarView('notLoggedIn');
    }

    handleEmailChange(event: any) {
        this.setState({email: event.target.value});
    }

    viewLogin(event: any) {
        this.props.history.push("/login");
        event.preventDefault();
    }

    sendResetPasswordEmail(event: any) {
        event.preventDefault();

        this.setState({showConfirmation: false});
        BooghApi.sendResetPasswordEmail(this.state.email).then(() => {
            this.setState({showConfirmation: true});
        }).catch(err => {
            console.log(err);
        });

        event.preventDefault();
    }

    close() {
        this.props.history.push("/");
    }

    render() {

        let confirmationMsg = <div></div>;
        if (this.state.showConfirmation) {
            confirmationMsg = (
                <div className={formStyles.formConfirmation}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Email sent</Trans>
                    </div>
                </div>
            )
        }

        const resetPassword = (
            <div>
                <button
                    className={formStyles.closeButton}
                    onClick={this.close}
                    type='button'
                >
                    <img className={formStyles.closeButtonImg} src={require("../assets/close.png")}/>
                </button>

                <div className={generalStyles.booghText} style={{color:'#83817C', fontSize: 16, marginBottom:20}}>
                    <Trans>Enter your email address to reset your password</Trans>
                </div>

                {confirmationMsg}

                <div className={`form-group ${formStyles.formPadding}`}>
                    <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`} style={{fontSize: 15}}>
                        <Trans>Email Address</Trans>
                    </div>
                    <input type="text" value={this.state.email} onChange={this.handleEmailChange}
                           style={{direction: 'rtl', border: '1px solid rgba(0,0,0,0.35)', borderRadius: 8, height: 52}}
                           className="form-control" id="emailInput" placeholder="آدرس ایمیل" />
                </div>

                <div className={formStyles.formPadding}>
                    <button type='submit' className={styles.sendResetInstructionsButton} value="Sign up">
                        <Trans>Send reset instructions</Trans>
                    </button>
                </div>

                <div className={generalStyles.booghText} style={{padding:30}}>
                    <a className={formStyles.formTextUnderline} style={{fontSize:16}} onClick={this.viewLogin} href={"/login"}>
                        <Trans>Return to login</Trans>
                    </a>
                </div>
            </div>
        );

        return(
            <div>
                <Form
                    fields={resetPassword}
                    onSubmit={this.sendResetPasswordEmail}
                />
            </div>
        )
    }
}
