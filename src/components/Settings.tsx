import * as React from 'react';
import { ToggleButtonGroup, ToggleButton, Row, Col } from 'react-bootstrap';
import { Reporter, User } from "../types";
import BooghApi from "../api/BooghApi";
import { Trans } from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import * as styles from "../css-modules/Settings.module.css";
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";

type SettingsState = {
    username: string,
    oldPassword: string,
    password: string,
    confirmPassword: string,
    notificationToggle: number,
    reporter: Reporter,
    isDisplayNameAvailable: boolean
}

export class Settings extends React.Component<RouteComponentProps, SettingsState> {
    constructor(props: RouteComponentProps){
        super(props);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handleOldPasswordChange = this.handleOldPasswordChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
        this.handleNotificationsChange = this.handleNotificationsChange.bind(this);
        this.submitPasswordChange = this.submitPasswordChange.bind(this);
        this.submitUsernameChange = this.submitUsernameChange.bind(this);
        let user = {} as User;
        this.state = {
            username: "",
            oldPassword: "",
            password: "",
            confirmPassword: "",
            notificationToggle: 1,
            reporter: {
                id: -1,
                about: "",
                karma: 0,
                location: "",
                user: user,
                notificationsOn:false,
            },
            isDisplayNameAvailable: true
        }
    }

    submitPasswordChange(): void {
        if(this.state.password == this.state.confirmPassword){
            BooghApi.changePassword(this.state.oldPassword, this.state.password).then(()=> {
                sessionStorage.setItem("token", "");
                this.props.history.push("/login");
            }).catch(err => {
                console.log(err);
            });
        }
    }

    submitUsernameChange(): void {
        let reporterCopy = Object.assign({}, this.state.reporter);
        reporterCopy.user.login = this.state.username;
        this.setState({
            reporter: reporterCopy
        });
        BooghApi.changeUserSettings(this.state.reporter).then(()=> {
            this.props.history.push("/login?settings-update");
        }).catch(err => {
            let error: string = err.toString();
            if (error.includes("Login")) {
                this.setState({isDisplayNameAvailable: false})
            }else {
                //Unknown error
            }
        });
    }

    handleUsernameChange(event: any): void {
        this.setState({username: event.target.value });
    }

    handleOldPasswordChange(event: any): void {
        this.setState({oldPassword: event.target.value})
    }

    handlePasswordChange(event: any): void {
        this.setState({password: event.target.value});
    }

    handleConfirmPasswordChange(event: any): void {
        this.setState({confirmPassword: event.target.value})
    }

    handleNotificationsChange(event: any): void {
        let notificationsOn: boolean;
        if (this.state.notificationToggle === 1) {
            this.setState({notificationToggle: 2});
            notificationsOn = false;
        } else {
            this.setState({notificationToggle: 1});
            notificationsOn = true;
        }
        let reporterCopy = Object.assign({}, this.state.reporter);
        reporterCopy.notificationsOn = notificationsOn;
        BooghApi.changeReporterSettings(reporterCopy)
             .catch(err => {
                 console.log(err)
             })
    }

    componentDidMount(): void {
        BooghApi.getReporterSettings().then(data => {
            let notificationsToggle = data.notificationsOn ? 1 : 2;
            this.setState({notificationToggle: notificationsToggle});
            this.setState({username: data.user.login});
            this.setState({reporter: data});
        }).catch(err => {
            console.log(err);
        })
    }

    render(){

        let displayNameClass = `${formStyles.formInput} ${styles.settingsInput}`;
        let displayNameErrorMsg = <div></div>;
        if (!this.state.isDisplayNameAvailable) {
            displayNameClass = `${formStyles.formInput} ${styles.settingsInput} ${formStyles.formInputError}`;
            displayNameErrorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>This username is already taken</Trans>
                </div>
            );
        }

        const toggleLeft = {fontFamily: 'Vazir', borderColor: '#DCDBD6',display:'inline', width:80, height:50, padding:15,borderTopLeftRadius:7, borderBottomLeftRadius:7, backgroundColor:'#FBFBFB'};
        const toggleRight = {fontFamily: 'Vazir', borderColor: '#DCDBD6',display:'inline', width:80, height:50, padding:15,borderTopRightRadius:7, borderBottomRightRadius:7, backgroundColor:'#FBFBFB'};
        return(
            <div className={generalStyles.page}>
                <div className={generalStyles.pageTitle}>
                    <Trans>Settings</Trans>
                </div>
                <hr className={generalStyles.titleHr}/>

                <div className={`${styles.settingsText} ${formStyles.fieldLabel}`}>
                    <Trans>Change username</Trans>
                </div>
                <Row className={styles.settingsRow}>
                    <Col md={8} xs={12} mdPush={4} className={styles.settingsCol}>
                        <div className='form-group' style={{textAlign:'right'}}>
                            <input type="text" value={this.state.username} onChange={this.handleUsernameChange} className={displayNameClass} id="usernameInput"
                                   placeholder={this.state.username} />
                        </div>
                        {displayNameErrorMsg}
                    </Col>
                    <Col md={4} xs={12} mdPull={8} className={styles.settingsCol}>
                        <button onClick={this.submitUsernameChange} className={styles.settingsButton}>
                            <div className={styles.settingsButtonText}>
                                <Trans>Change username</Trans>
                            </div>
                        </button>
                    </Col>
                </Row>
                <hr/>

                <div className={`${styles.settingsText} ${formStyles.fieldLabel}`}>
                    <Trans>Old password</Trans>
                </div>
                <Row className={styles.settingsRow}>
                    <Col md={4} xs={12} className={styles.settingsCol}>
                    </Col>
                    <Col md={8} xs={12} className={styles.settingsCol}>
                        <div className='form-group' style={{textAlign:'right'}}>
                            <input type="password" value={this.state.oldPassword} onChange={this.handleOldPasswordChange} className={`${formStyles.formInput} ${styles.settingsInput}`}
                                   placeholder={this.state.oldPassword}/>
                        </div>
                    </Col>
                </Row>
                <div className={`${styles.settingsText} ${formStyles.fieldLabel}`}>
                    <Trans>New password</Trans>
                </div>
                <Row className={styles.settingsRow}>
                    <Col md={4} xs={12} className={styles.settingsCol}>
                    </Col>
                    <Col md={8} xs={12} className={styles.settingsCol}>
                        <div className='form-group' style={{textAlign:'right'}}>
                            <input type="password" value={this.state.confirmPassword} onChange={this.handleConfirmPasswordChange} className={`${formStyles.formInput} ${styles.settingsInput}`}
                                   placeholder={this.state.confirmPassword} />
                        </div>
                    </Col>
                </Row>
                <div className={`${styles.settingsText} ${formStyles.fieldLabel}`}>
                    <Trans>Confirm new password</Trans>
                </div>
                <Row className={styles.settingsRow}>
                    <Col md={8} xs={12} mdPush={4} className={styles.settingsCol}>
                        <div className='form-group' style={{textAlign:'right'}}>
                            <input type="password" value={this.state.password} onChange={this.handlePasswordChange} className={`${formStyles.formInput} ${styles.settingsInput}`} id="passwordInput"
                                   placeholder={this.state.password} />
                        </div>
                    </Col>
                    <Col md={4} xs={12} mdPull={8} className={styles.settingsCol}>
                        <button onClick={this.submitPasswordChange} className={styles.settingsButton}>
                            <div className={styles.settingsButtonText}>
                                <Trans>Change password</Trans>
                            </div>
                        </button>
                    </Col>
                </Row>
                <hr/>

                <Row className={styles.settingsRow}>

                    <Col md={8} xs={12} mdPush={4} style={{textAlign:'right'}} className={styles.settingsCol}>
                        <div className={styles.settingsNotifyTitle}>
                            <Trans>Issue Notifications</Trans>
                        </div>
                        <div className={styles.settingsNotifyText}>
                            <Trans>We'll send you an email when your reports have been approved.</Trans>
                        </div>
                    </Col>
                    <Col md={4} xs={12} mdPull={8} style={{marginTop:20}} className={styles.settingsCol}>
                        <ToggleButtonGroup
                            type="checkbox"
                            value={this.state.notificationToggle}
                            onClick={this.handleNotificationsChange}
                            className={styles.toggleButtonGroup}>
                            <ToggleButton className={`${styles.toggleBackground} ${this.state.notificationToggle === 1 ? styles.active : null}`} value={1} style={toggleLeft}>
                                <Trans>On</Trans>
                            </ToggleButton>
                            <ToggleButton className={`${styles.toggleBackground} ${this.state.notificationToggle === 2 ? styles.active : null}`} value={2} style={toggleRight}>
                                <Trans>Off</Trans>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Col>
                </Row>
                <hr/>
            </div>
        );
    }
}
