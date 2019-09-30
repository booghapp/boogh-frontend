import {Nav, Navbar, NavItem} from "react-bootstrap";
import * as React from 'react';
import { Feed } from './Feed';
import { Map } from './Map';
import {Trans} from "react-i18next";
import { Redirect, Route, Switch, RouteComponentProps } from "react-router-dom";
import * as styles from "../css-modules/Explore.module.css";
import * as generalStyles from "../css-modules/General.module.css";


interface ExploreProps extends RouteComponentProps {
    match: any;
    setFooterView: Function;
}

export class Explore extends React.Component<ExploreProps> {
    handleSelect(eventKey): void {
        const { path } = this.props.match;

        switch (eventKey) {
            case 1:
                this.props.history.push(`${path}/feed`);
                break;

            case 2:
                this.props.history.push(`${path}/map`);
                break;

            default:
                this.props.history.push(`${path}`);
        }
    }

    render() {
        const active = <div style={{borderBottom:'3px solid #FECA2D'}}></div>

        let mapIcon, feedIcon;
        let navItem1, navItem2;
        if(this.props.history.location.pathname == "/explore/feed") {
            navItem1 = active;
            navItem2 = <div></div>;
            mapIcon = require("../assets/map_inactive_icon.png");
            feedIcon = require("../assets/feed_icon.png");
        }else{
            navItem1 = <div></div>;
            navItem2 = active;
            mapIcon =  require("../assets/map_icon.png");
            feedIcon = require("../assets/feed_inactive.png");
        }

        const navBar = (
            <Navbar style={{backgroundColor:'white', margin:'0px', border:0}}>
                <div className={generalStyles.subNavbar}>
                    <Nav pullRight onSelect={this.handleSelect.bind(this)}>
                        <NavItem eventKey={1} href="#" className={styles.navItemStyle}>
                            <div className={generalStyles.booghText} style={{fontSize:15, fontWeight:'lighter'}}>
                                <Trans>Feed</Trans>
                                <img src={feedIcon} className={styles.exploreNavbarImage}/>
                            </div>
                            {navItem1}
                        </NavItem>
                        <NavItem eventKey={2} href="#" className={styles.navItemStyle}>
                            <div className={generalStyles.booghText} style={{fontSize:15, fontWeight:'lighter'}}>
                                <Trans>Map</Trans>
                                <img src={mapIcon} className={styles.exploreNavbarImage}/>
                            </div>
                            {navItem2}
                        </NavItem>
                    </Nav>
                </div>
            </Navbar>
        );

        const { path } = this.props.match;

        return(
            <div style={{width:'100%'}}>
                {navBar}
                <hr className={generalStyles.subNavbarHr}/>
                <Switch>
                    <Route exact path={`${path}/map`}
                           render={props => (<Map {...props} forHomePage={false} refresh={false} setFooterView={this.props.setFooterView}/>)}
                    />
                    <Route path={`${path}/feed`} component={Feed} />
                    <Redirect from={`${path}`} to={{pathname:`${path}/map`}} />
                </Switch>
            </div>
        )
    }
}
