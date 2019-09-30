import * as React from 'react';
import {Nav, Navbar, NavItem} from "react-bootstrap";
import {NavLink} from "reactstrap";
import { Issues } from "./Issues";
import { FavoritedReports } from "./FavoritedReports";
import { Settings } from "./Settings";
import { Route, RouteComponentProps, Redirect, Switch } from "react-router-dom";
import {Trans} from "react-i18next";
import * as styles from "../css-modules/Profile.module.css";
import * as generalStyles from "../css-modules/General.module.css";

interface ProfileProps extends RouteComponentProps {
    match: any;
}

export class Profile extends React.Component<ProfileProps> {
    constructor(props: ProfileProps){
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(eventKey): void {
        const { path } = this.props.match;

        switch (eventKey) {
            case 1:
                this.props.history.push(`${path}/settings`);
                break;

            case 2:
                this.props.history.push(`${path}/favorites`);
                break;

            case 3:
                this.props.history.push(`${path}/issues`);
                break;

            default:
                this.props.history.push(`${path}/issues`);
        }
    }

    render(){
        const active = <div className={styles.itemHighlighted}></div>

        let navItem1, navItem2, navItem3;
        if(this.props.history.location.pathname == "/profile/settings") {
            navItem1 = active;
            navItem2 = <div></div>;
            navItem3 = <div></div>;
        }else if(this.props.history.location.pathname == "/profile/favorites"){
            navItem1 = <div></div>;
            navItem2 = active;
            navItem3 = <div></div>;
        }else{
            navItem1 = <div></div>;
            navItem2 = <div></div>;
            navItem3 = active;
        }


        const navBar = (
            <Navbar style={{backgroundColor:'white', margin:0, border:0, padding:0}}>
                <div className={styles.profileNavbar}>
                    <Nav onSelect={this.handleSelect.bind(this)} style={{width:'100%', textAlign: 'center', marginLeft: 0, marginRight: 0}}>
                        <NavItem eventKey={1} className={`${generalStyles.booghText} ${styles.navItemDefault}`}>
                            <Trans>SETTINGS</Trans>
                            {navItem1}
                        </NavItem>
                        <NavItem eventKey={2} className={`${generalStyles.booghText} ${styles.navItemDefault}`} style={{marginLeft: 'auto', marginRight: 'auto'}}>
                            <Trans>FAVORITED</Trans>
                            {navItem2}
                        </NavItem>
                        <NavItem eventKey={3} className={`${generalStyles.booghText} ${styles.navItemDefault}`}>
                            <Trans>ISSUES</Trans>
                            {navItem3}
                        </NavItem>
                    </Nav>
                </div>
            </Navbar>
        );

        const { path } = this.props.match;

        return(
            <div className={generalStyles.componentContainer} style={{width:'100%'}}>
                {navBar}
                <hr className={generalStyles.subNavbarHr}/>
                <Switch>
                    <Route path={`${path}/issues`}  component={Issues} />
                    <Route path={`${path}/favorites`} component={FavoritedReports} />
                    <Route path={`${path}/settings`} component={Settings} />
                    <Redirect from={`${path}`} to={{pathname:`${path}/issues`}} />
                </Switch>
            </div>
        )
    }
}
