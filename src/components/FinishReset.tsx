import * as React from 'react';
import { Form } from './Form';
import {Trans} from "react-i18next";
import {RouteComponentProps} from 'react-router-dom';
import BooghApi from "../api/BooghApi";
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";

interface FinishResetProps extends RouteComponentProps {
    setNavbarView: Function,
}

type FinishResetState = {
    key: string,
    newPassword: string,
    newPasswordConfirmation: string,
    showResetSuccess: boolean,
    showResetError: boolean,
    showPasswordMatchError: boolean,
    showPasswordLengthError: boolean
}

export class FinishReset extends React.Component<FinishResetProps, FinishResetState> {

    constructor(props: FinishResetProps) {
        super(props);
        this.state = {key: "", newPassword: "", newPasswordConfirmation: "", showResetSuccess: false,
            showResetError: false, showPasswordMatchError: false, showPasswordLengthError: false};
        this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this);
        this.handleNewPasswordConfirmationChange = this.handleNewPasswordConfirmationChange.bind(this);
        this.viewLogin = this.viewLogin.bind(this);
        this.close = this.close.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
    }

    componentDidMount(): void {
        let url = window.location.href;
        let keyParam = "key=";
        if (url.includes(keyParam)) {
            let keyParamIndex = url.indexOf(keyParam);
            let key = url.substr(keyParamIndex + keyParam.length);
            this.setState({key: key});
        }
    }

    handleNewPasswordChange(event: any) {
        this.setState({newPassword: event.target.value});
    }

    handleNewPasswordConfirmationChange(event: any) {
        this.setState({newPasswordConfirmation: event.target.value})
    }

    resetPassword(event: any) {
        event.preventDefault();

        this.setState({showResetSuccess: false, showResetError: false, showPasswordMatchError: false, showPasswordLengthError: false})
        if ((this.state.newPassword === this.state.newPasswordConfirmation) && this.state.newPassword.length > 3) {
            BooghApi.resetPassword(this.state.key, this.state.newPassword).then(() => {
                this.setState({showResetSuccess: true})
            }).catch(err =>{
                this.setState({showResetError: true})
            });
        }else{
            if (this.state.newPassword !== this.state.newPasswordConfirmation) {
                this.setState({showPasswordMatchError: true})
            }
            if (this.state.newPassword.length < 4) {
                this.setState({showPasswordLengthError: true})
            }
        }

        event.preventDefault();
    }

    viewLogin() {
        this.props.history.push("/login");
    }

    close() {
        this.props.history.push("/");
    }

    render() {

        let resetSuccess = <div></div>;
        if (this.state.showResetSuccess) {
            resetSuccess = (
                <div className={formStyles.formConfirmation}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Your password has been reset!</Trans>
                    </div>
                </div>
            )
        }

        let resetError = <div></div>;
        if (this.state.showResetError) {
            resetError = (
                <div className={formStyles.formError}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Sorry, we could not reset your password.</Trans>
                    </div>
                </div>
            )
        }

        let passwordMatchError = <div></div>;
        if (this.state.showPasswordMatchError) {
            passwordMatchError = (
                <div className={formStyles.formError}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Passwords do not match.</Trans>
                    </div>
                </div>
            )
        }

        let passwordLengthError = <div></div>;
        if (this.state.showPasswordLengthError) {
            passwordLengthError = (
                <div className={formStyles.formError}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Password length must be 4 characters or more.</Trans>
                    </div>
                </div>
            )
        }

        const resetPasswordFields = (
            <div>
                <button
                    className={formStyles.closeButton}
                    onClick={this.close}
                    type='button'
                >
                    <img className={formStyles.closeButtonImg} src={require("../assets/close.png")} />
                </button>

                <div className={`${generalStyles.booghText} ${formStyles.formTitle}`} style={{marginBottom:20}}>
                    <Trans>Reset your password</Trans>
                </div>

                {resetSuccess}
                {resetError}
                {passwordMatchError}
                {passwordLengthError}

                <div className={`form-group ${formStyles.formPadding}`}>
                    <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`} style={{fontSize: 15}}>
                        <Trans>New Password</Trans>
                    </div>
                    <input type="password" value={this.state.newPassword} onChange={this.handleNewPasswordChange}
                           style={{direction: 'rtl', border: '1px solid rgba(0,0,0,0.35)', borderRadius: 8, height: 52}}
                           className="form-control" id="emailInput" placeholder="آدرس ایمیل" />
                </div>

                <div className={`form-group ${formStyles.formPadding}`}>
                    <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`} style={{fontSize: 15}}>
                        <Trans>New Password Confirmation</Trans>
                    </div>
                    <input type="password" value={this.state.newPasswordConfirmation} onChange={this.handleNewPasswordConfirmationChange}
                           style={{direction: 'rtl', border: '1px solid rgba(0,0,0,0.35)', borderRadius: 8, height: 52}}
                           className="form-control" id="emailInput" placeholder="آدرس ایمیل" />
                </div>

                <div className={formStyles.formPadding}>
                    <button type='submit' className={`${generalStyles.button} ${formStyles.formButton}`} value="Reset Password">
                        <div className={generalStyles.booghText} style={{fontSize: 16}}>
                            <Trans>Reset Password</Trans>
                        </div>
                    </button>
                </div>

                <div className={generalStyles.booghText} style={{padding:30}}>
                    <a className={formStyles.formTextUnderline} style={{fontSize:16}} onClick={this.viewLogin} href={"/login"}>
                        <Trans>Return to login</Trans>
                    </a>
                </div>
            </div>
        );
        return (
            <div>
                <Form
                    fields={resetPasswordFields}
                    onSubmit={this.resetPassword}
                />
            </div>
        )
    }
}
