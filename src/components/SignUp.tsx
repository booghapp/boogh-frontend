import { Checkbox } from 'react-bootstrap';
import * as React from 'react';
import { Form } from './Form';
import {Trans} from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import { SocialLogin } from "./SocialLogin";
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import * as styles from "../css-modules/SignUp.module.css";

interface SignUpProps extends RouteComponentProps {
    signUpMethod: Function;
    setNavbarView: Function;
    handleTelegramLogin: Function;
}

type SignUpState = {
    displayName: string,
    isDisplayNameAvailable: boolean,
    email: string,
    isEmailAvailable: boolean,
    password: string,
    showPassword: boolean,
    showConfirmation: boolean
}

export class SignUp extends React.Component<SignUpProps, SignUpState> {

    constructor(props: SignUpProps){
        super(props);
        this.state = {displayName:'', isDisplayNameAvailable: true, email: '',
                    isEmailAvailable: true, password: '', showPassword: false, showConfirmation: false};
        this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleShowPasswordChange = this.handleShowPasswordChange.bind(this);
        this.viewLogin = this.viewLogin.bind(this);
        this.viewPrivacyPolicy = this.viewPrivacyPolicy.bind(this);
        this.viewTermsOfUse = this.viewTermsOfUse.bind(this);
        this.close = this.close.bind(this);
    }

    componentDidMount(): void {
        this.props.setNavbarView('gone');
    }

    componentWillUnmount(): void {
        this.props.setNavbarView('notLoggedIn');
    }

    handleDisplayNameChange(event: any) {
        this.setState({displayName: event.target.value});
    }

    handleEmailChange(event: any) {
        this.setState({email: event.target.value});
    }

    handlePasswordChange(event: any) {
        this.setState({password: event.target.value});
    }

    handleSubmit(event: any) {
        event.preventDefault();

        this.setState({isEmailAvailable: true, isDisplayNameAvailable: true, showConfirmation: false});

        this.props.signUpMethod(this.state.displayName, this.state.email, this.state.password).then(() =>{
            this.setState({showConfirmation: true})

        }).catch(err => {
            let error: string = err.toString();
            if (error.includes("Login")) {
                this.setState({isDisplayNameAvailable: false})
            }else if (error.includes("Email")) {
                this.setState({isEmailAvailable: false})
            }else {
                //Unknown error
            }
        });

        event.preventDefault();
    }

    handleShowPasswordChange(event: any){
        this.setState({
            showPassword: !this.state.showPassword
        });
    }

    viewLogin(event: any){
        this.props.history.push("/login");
        event.preventDefault();
    }

    viewPrivacyPolicy(event: any) {
        this.props.history.push("/privacy-policy");
        event.preventDefault();
    }

    viewTermsOfUse(event: any) {
        this.props.history.push("/terms-of-use");
        event.preventDefault();
    }

    close() {
        this.props.history.push("/");
    }

    render(){
        let passwordType: string = 'password';
        if (this.state.showPassword){
            passwordType = 'text';
        }

        let emailInputClass = formStyles.formInput;
        let emailErrorMsg = <div></div>;
        if (!this.state.isEmailAvailable) {
            emailInputClass = `${formStyles.formInput} ${formStyles.formInputError}`;
            emailErrorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>This email is already taken</Trans>
                </div>
            );
        }

        let displayNameClass = formStyles.formInput;
        let displayNameErrorMsg = <div></div>;
        if (!this.state.isDisplayNameAvailable) {
            displayNameClass = `${formStyles.formInput} ${formStyles.formInputError}`;
            displayNameErrorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>This username is already taken</Trans>
                </div>
            );
        }

        let confirmationMsg = <div></div>;
        if (this.state.showConfirmation) {
            confirmationMsg = (
                <div className={formStyles.formConfirmation}>
                    <div className={formStyles.formConfirmationText}>
                        <Trans>Confirmation email sent</Trans>
                    </div>
                </div>
            )
        }

        const signUp = (
                    <div>
                        <button
                            className={formStyles.closeButton}
                            onClick={this.close}
                            type='button'
                        >
                            <img className={formStyles.closeButtonImg} src={require("../assets/close.png")} />
                        </button>
                        <div className={`${generalStyles.booghText} ${formStyles.formTitle}`}>
                            <Trans>Sign up with</Trans>
                        </div>

                        <SocialLogin handleTelegramResponse={this.props.handleTelegramLogin}/>

                        <div className={formStyles.divider}>
                            <span className={formStyles.dividerText}>
                                <Trans>OR</Trans>
                            </span>
                        </div>

                        {confirmationMsg}

                        <div className='form-group'>
                            <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`} style={{fontSize: 15}}>
                                <Trans>Email Address</Trans>
                            </div>
                            <input type="text" value={this.state.email} onChange={this.handleEmailChange}
                                   className={emailInputClass} id="emailInput" placeholder="آدرس ایمیل" />
                            {emailErrorMsg}
                        </div>

                        <div className='form-group'>
                            <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`} style={{fontSize: 15}}>
                                <Trans>Display Name</Trans>
                            </div>
                            <input type="text" value={this.state.displayName} onChange={this.handleDisplayNameChange}
                                   className={displayNameClass}  id="displayNameInput" placeholder="اسم را نمایش بده" />
                            {displayNameErrorMsg}
                        </div>

                        <div className='form-group'>
                            <div className={`${formStyles.loginLabel} ${generalStyles.booghText}`} style={{fontSize: 15}}>
                                <Trans>New Password</Trans>
                            </div>
                            <input type={passwordType} value={this.state.password} onChange={this.handlePasswordChange}
                                   className={formStyles.formInput} id="passwordInput" placeholder="رمز عبور"/>
                            <div className={`${generalStyles.booghText} ${formStyles.formTextFaint}`}>
                                <Trans>Must be 6 or more characters</Trans>
                            </div>
                        </div>

                        <Checkbox checked={this.state.showPassword} style={{direction:'rtl', textAlign:'right', marginTop: -10, marginBottom: 25}} onChange={this.handleShowPasswordChange}>
                            <div className={`${generalStyles.booghText} ${formStyles.formCheckboxLabel}`}>
                                <Trans>Show password</Trans>
                            </div>
                        </Checkbox>
                        <div>
                            <button type="submit" className={styles.submitButton} value="Sign up">
                                <Trans>Sign up</Trans>
                            </button>
                        </div>

                        <div className={generalStyles.booghText} style={{paddingTop:5, fontSize:15, marginTop: 15}}>
                            <Trans>Have an account?</Trans>
                            <a className={formStyles.formTextUnderline} style={{marginRight: 8}} onClick={this.viewLogin} href={"/login"}>
                                <Trans> Log in</Trans>
                            </a>
                        </div>
                        <div className={generalStyles.booghText} style={{fontSize:14, marginTop: 15}}>
                            <div style={{margin:0, color:'#83817C', fontWeight:'lighter'}}>
                                <Trans>By continuing you agree to WeChannel's</Trans>
                            </div>
                            <span>
                                <a className={formStyles.formTextUnderline} onClick={this.viewTermsOfUse} href={"/terms-of-use"}>
                                    <b><Trans>Terms of Use</Trans></b>
                                </a>
                                <div style={{color:'#999894', display:'inline'}}>
                                    <Trans> and </Trans>
                                </div>
                                <a className={formStyles.formTextUnderline} onClick={this.viewPrivacyPolicy} href={"/privacy-policy"}>
                                    <b><Trans>Privacy Policy</Trans></b>
                                </a>
                            </span>
                        </div>
                    </div>
        );

        return(
            <div>
                <Form
                    fields={signUp}
                    onSubmit={this.handleSubmit}
                />
            </div>
        )
    }
}
