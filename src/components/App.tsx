import * as React from 'react';
import { Home } from './Home';
import { Explore } from './Explore';
import { Submit } from './Submit';
import { BooghNavBar } from './BooghNavBar';
import { LogIn } from './LogIn';
import { Footer } from './Footer';
import { Profile } from "./Profile";
import { ReportView } from "./ReportView";
import { SignUp } from "./SignUp";
import { UpdateReport } from './UpdateReport';
import BooghApi from "../api/BooghApi";
import { UpdateConfirmation } from "./UpdateConfirmation";
import { SubmitConfirmation } from "./SubmitConfirmation";
import { ReporterProfile } from "./ReporterProfile";
import { Help } from "./Help";
import { Route, Switch, withRouter } from "react-router-dom";
import { ResetPassword } from "./Reset";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { About } from "./About";
import { TermsOfUse } from "./TermsOfUse";
import * as styles from "../css-modules/App.module.css";
import { FinishReset } from "./FinishReset";

type AppProps = {
    history: any
}

type AppState = {
    navBarView: string,
    footerView: string,
    refreshHome: boolean
}

class AppWithoutRouter extends React.Component<AppProps,AppState> {

  constructor(props: any) {
      super(props);
      this.state = {
          navBarView: 'notLoggedIn',
          footerView: 'default',
          refreshHome: false,
      };
      this.saveState = this.saveState.bind(this);
      this.restoreState = this.restoreState.bind(this);
      this.brandOnClick = this.brandOnClick.bind(this);
      this.checkForGoogleAuth = this.checkForGoogleAuth.bind(this);
      this.checkForTwitterAuth = this.checkForTwitterAuth.bind(this);
      this.setNavbarView = this.setNavbarView.bind(this);
      this.setFooterView = this.setFooterView.bind(this);
      this.transferSessionStorage = this.transferSessionStorage.bind(this);
  }

  componentDidMount(): void {
      this.setStorageListener();
      this.restoreState();
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<AppState>, snapshot?: any): void {
      this.saveState();
  }

  transferSessionStorage(event: any) {
      if (!event) {
          event = window.event;
      }
      if (!event.newValue) {
          return;
      }
      if (event.key === 'getSessionStorage') {
          localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
          localStorage.removeItem('sessionStorage');

      } else if (event.key === 'sessionStorage' && !sessionStorage.length) {
          let data = JSON.parse(event.newValue);
          for (let key in data) {
              sessionStorage.setItem(key, data[key]);
              if (key === 'navBarView') {
                  this.setState({navBarView: data[key]});
              }
          }
      }
  }

  setStorageListener() {
      // listen for changes to localStorage
      if(window.addEventListener) {
          window.addEventListener("storage", this.transferSessionStorage, false);
      }
      // Ask other tabs for session storage (this is ONLY to trigger event)
      if (!sessionStorage.length) {
          localStorage.setItem('getSessionStorage', 'foobar');
          localStorage.removeItem('getSessionStorage');
      }
  }

  saveState(): void {
      sessionStorage.setItem("navBarView", this.state.navBarView);
  }

  restoreState(): void {
      let navBarView: string | null = sessionStorage.getItem("navBarView");
      if ( navBarView != null ) {
          this.setState({navBarView: navBarView});
      }
  }

  /* Select method for navigation bar. */
  handleSelect = (eventKey: number): void => {
      switch (eventKey) {
          case 1:
              this.props.history.push("/signup");
              break;

          case 2:
              this.props.history.push("/login");
              break;

          case 3:
              this.props.history.push("/profile");
              break;

          case 4:
              this.props.history.push("/help");
              break;

          case 5:
              this.props.history.push("/explore");
              break;

          case 6:
              this.props.history.push("/submit");
              break;

          case 7:
              this.handleSignOut();
              this.props.history.push("/");
              break;

          default:
              this.props.history.push("/login");
      }
  };

  setNavbarView(navBarView: string): void {
      this.setState({navBarView: navBarView, footerView: navBarView});
  }

  setFooterView(footerView: string): void {
      this.setState({footerView: footerView});
  }

  brandOnClick(): void {
      this.props.history.push("/")
  }

  handleLogin = (email, password) =>{
      return BooghApi.loginUser(email, password).then(data => {
          sessionStorage.setItem("userId", data['userId'] || "");
          data['body'].then(data => {
              if(data['id_token'] !== undefined){
                  sessionStorage.setItem("token", data['id_token']);
                  this.props.history.push("/explore");
                  this.setState({navBarView: 'loggedIn'});
              }
          })
      })
  };

  handleTelegramResponse = response => {
        BooghApi.verifyTelegramUser(response['id'],
            response['first_name'] || "",
            response['last_name'] || "",
            response['username'] || "",
            response['photo_url'] || "",
                     response['auth_date'],
                     response['hash']).then(data => {
            sessionStorage.setItem("userId", data['userId'] || "");
            let memCache = data['memCache'] || "";
            data['body'].then(data => {
                if(data['id_token'] !== undefined){
                    sessionStorage.setItem("token", data['id_token']);
                    this.props.history.push("/explore");
                    this.setState({navBarView: 'loggedIn'});
                    BooghApi.displayTelegramStartButton(memCache);
                }
            })
        }).catch(err => {
            console.log(err);
        });
  };

  checkForGoogleAuth(url: string) {
    if (url.includes("code")) {

        let scopeParam: string = "&scope";
        let scopeIndex: number = url.indexOf(scopeParam);

        //Get the one time auth code
        let codeParam: string = "code=";
        let codeIndex = url.indexOf(codeParam);
        let code = url.substr(codeIndex + codeParam.length, scopeIndex - codeIndex - codeParam.length);

        //authenticate the code in the backend
        BooghApi.verifyGoogleUser(code).then(data => {
            sessionStorage.setItem("userId", data['userId'] || "");
            data['body'].then(data => {
                if(data['id_token'] !== undefined){
                    sessionStorage.setItem("token", data['id_token']);
                    this.props.history.push("/explore");
                    this.setState({navBarView: 'loggedIn'});
                }
            })
        }).catch(err => {
            console.log(err);
        });
    }
  }

  checkForTwitterAuth(url : string) {

        if (url.includes("oauth_verifier")) {
            //Get the oauth verifier
            let verifierIndex = url.indexOf("oauth_verifier");
            let verifier : string = url.substr(verifierIndex + 15);

            //Get the oauth token
            let oauthTokenIndex = url.indexOf("oauth_token");
            let oauthToken = url.substr(oauthTokenIndex + 12, verifierIndex - oauthTokenIndex - 12);

            //Make request to backend to verify the user
            BooghApi.sendVerificationCode(verifier, oauthToken).then(data => {
                sessionStorage.setItem("userId", data['userId'] || "");
                data['body'].then(data => {
                    if(data['id_token'] !== undefined){
                        sessionStorage.setItem("token", data['id_token']);
                        this.props.history.push("/explore");
                        this.setState({navBarView: 'loggedIn'});
                    }
                })
            }).catch(err => {
                console.log(err);
            });
        }
    }

  handleSignUp = (displayName, email, password) =>{
      return BooghApi.signUpUser(displayName, email, password);
  };

  handleSignOut = (): void =>{
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userId");
      this.setState({
          navBarView: 'notLoggedIn',
          refreshHome: true
      });
  };

  render() {
      return (
          <div className={styles.app}>



              <div style={{minHeight:'100%',  position:'relative'}}>
                  <BooghNavBar onSelect={this.handleSelect} view={this.state.navBarView} brandOnClick={this.brandOnClick}/>
                    <Switch>
                        <div>
                            <Route
                                path="/signup"
                                render={ props => (<SignUp {...props} setNavbarView={this.setNavbarView} signUpMethod={this.handleSignUp} handleTelegramLogin={this.handleTelegramResponse}/>)}
                            />
                            <Route
                                path="/login"
                                render={props => (<LogIn setNavbarView={this.setNavbarView} checkForTwitterAuth={this.checkForTwitterAuth} checkForGoogleAuth={this.checkForGoogleAuth}
                                                    {...props} loginMethod={this.handleLogin} handleTelegramLogin={this.handleTelegramResponse}/>)}
                            />
                            <Route
                                path="/reset-password"
                                render={props => (<ResetPassword {...props} setNavbarView={this.setNavbarView}/>)}
                            />
                            <Route
                                path="/finish-reset"
                                render={props => (<FinishReset {...props} setNavbarView={this.setNavbarView}/>)}
                            />

                            <div className={styles.frameContainer}>
                                <Route exact path="/"
                                       render={ props => (<Home {...props} refresh={this.state.refreshHome}/>)}
                                />
                                <Route
                                    path="/explore"
                                    render={props => (<Explore {...props} setFooterView={this.setFooterView}/>)}
                                />
                                <Route path="/submit" component={Submit}/>
                                <Route path="/submit-confirmation" component={SubmitConfirmation}/>
                                <Route path="/profile" component={Profile}/>
                                <Route path="/reporter" component={ReporterProfile}/>
                                <Route path="/report" component={ReportView}/>
                                <Route path="/update" component={UpdateReport}/>
                                <Route path="/update-confirmation" component={UpdateConfirmation}/>
                                <Route path="/help" component={Help}/>
                                <Route path="/privacy-policy" component={PrivacyPolicy}/>
                                <Route path="/about" component={About}/>
                                <Route path="/terms-of-use" component={TermsOfUse}/>
                            </div>
                        </div>
                    </Switch>
                  <Footer history={this.props.history} view={this.state.footerView}/>
            </div>

          </div>
    );
  }
}

export const App = withRouter(AppWithoutRouter);
