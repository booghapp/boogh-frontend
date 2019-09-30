import * as React from 'react';
import { Form } from './Form';
import {Trans} from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import { SocialLogin } from "./SocialLogin";
import * as styles from '../css-modules/LogIn.module.css';
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import BooghApi from "../api/BooghApi";

interface LogInProps extends RouteComponentProps {
    loginMethod: Function,
    checkForGoogleAuth: Function,
    checkForTwitterAuth: Function,
    setNavbarView: Function,
    handleTelegramLogin: Function,
}

type LogInState = {
    email: string,
    password: string,
    isCombinationValid: boolean,
    showAccountActivated: boolean,
    showActivationError: boolean,
    showSettingsChanged: boolean,
}

export class LogIn extends React.Component<LogInProps, LogInState> {
    public constructor(props: LogInProps) {
        super(props);
        this.state = {
            email: '',
            password: '',
            isCombinationValid: true,
            showAccountActivated: false,
            showActivationError: false,
            showSettingsChanged: false,
        };
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.viewSignup = this.viewSignup.bind(this);
        this.viewResetPassword = this.viewResetPassword.bind(this);
        this.close = this.close.bind(this);
    }

    public componentDidMount(): void {
        this.props.setNavbarView('gone');
        let url = window.location.href;
        this.props.checkForTwitterAuth(url);
        this.props.checkForGoogleAuth(url);
        this.checkForAccountActivation(url);
    }

    public componentWillUnmount(): void {
        this.props.setNavbarView('notLoggedIn')
    }

    private checkForAccountActivation(url: string) {
        let keyParam = "key=";
        if (url.includes(keyParam)) {
            let activationIndex = url.indexOf(keyParam);
            let activationCode = url.substr(activationIndex + keyParam.length);

            //Make api call to activate the account
            BooghApi.activateAccount(activationCode).then(() => {
                this.setState({showAccountActivated: true, showActivationError: false})
            }).catch(err =>{
                this.setState({showAccountActivated: false, showActivationError: true})
            });
        } else if (url.includes("settings-update")) {
            this.setState({showSettingsChanged: true})
        }
    }

    private handleEmailChange(event: any) {
        this.setState({email: event.target.value});
    }

    private handlePasswordChange(event: any) {
        this.setState({password: event.target.value});
    }

    private handleSubmit(event: any) {
        event.preventDefault();
        this.props.loginMethod(this.state.email, this.state.password).catch(() => {
            this.setState({isCombinationValid: false})
        });
    }

    private viewSignup(event: any) {
        event.preventDefault();
        this.props.history.push("/signup");
    }

    private viewResetPassword(event: any) {
        event.preventDefault();
        this.props.history.push("/reset-password");
    }

    private close() {
        this.props.history.push("/");
    }

    public render() {
        let errorMsg = <div></div>
        if (!this.state.isCombinationValid) {
            errorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>Email password combination is invalid</Trans>
                </div>
            );
        }

        let activationMsg = <div></div>;
        if (this.state.showAccountActivated) {
            activationMsg = (
                <div className={formStyles.formConfirmation}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Your account has been activated!</Trans>
                    </div>
                </div>
            )
        }

        let activationErr = <div></div>;
        if (this.state.showActivationError) {
            activationErr = (
                <div className={formStyles.formError}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Sorry, we could not activate your account.</Trans>
                    </div>
                </div>
            )
        }

        let settingsChangedMsg = <div></div>;
        if (this.state.showSettingsChanged) {
            settingsChangedMsg = (
                <div className={formStyles.formConfirmation}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Your account settings have been changed!</Trans>
                    </div>
                </div>
            )
        }

        const login = (
            <div>
                <button
                    className={formStyles.closeButton}
                    onClick={this.close}
                    type='button'
                >
                    <img className={formStyles.closeButtonImg} src={require("../assets/close.png")}/>
                </button>

                <div className={`${generalStyles.booghText} ${formStyles.formTitle}`}>
                    <Trans>Log in with</Trans>
                </div>

                <SocialLogin handleTelegramResponse={this.props.handleTelegramLogin}/>

                <div className={formStyles.divider}>
                    <span className={formStyles.dividerText}>
                        <Trans>OR</Trans>
                    </span>
                </div>

                {activationMsg}
                {activationErr}
                {settingsChangedMsg}

                <div className={`form-group ${formStyles.formPadding}`}>
                    <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`}>
                        <Trans>Email Address</Trans>
                    </div>

                    <input type="text" value={this.state.email} onChange={this.handleEmailChange}
                            className={formStyles.formInput} id="emailInput" placeholder="آدرس ایمیل" />
                </div>

                <div className={`form-group ${formStyles.formPadding}`}>
                    <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`}>
                        <Trans>Password</Trans>
                    </div>

                    <input type="password" value={this.state.password} onChange={this.handlePasswordChange}
                            className={formStyles.formInput}  id="passwordInput" placeholder="رمز عبور" />
                </div>

                {errorMsg}

                <div className={formStyles.formPadding}>
                    <button type='submit' className={styles.logInButton} value="Log in">
                        <div className={generalStyles.booghText} style={{fontSize: 16}}>
                            <Trans>Log in</Trans>
                        </div>
                    </button>
                </div>

                <div className={generalStyles.booghText} style={{padding:30}}>
                    <a className={formStyles.formTextUnderline} style={{fontSize:16}} onClick={this.viewResetPassword} href={"/reset-password"}>
                        <Trans>Forgot password?</Trans>
                    </a>
                </div>

                <div style={{padding:'20px 0px', fontSize:16}} className={generalStyles.booghText}>
                    <Trans>New to Boogh?</Trans>

                    <a className={formStyles.formTextUnderline} style={{fontSize:16}} onClick={this.viewSignup} href={"/signup"}>
                        <Trans> Create an account</Trans>
                    </a>
                </div>
            </div>
        );

        return (
            <div >
                <Form
                    fields={login}
                    onSubmit={this.handleSubmit}
                />
            </div>
        );
    }
}
