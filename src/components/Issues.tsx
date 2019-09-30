import * as React from 'react';
import {Nav, Navbar, NavItem} from "react-bootstrap";
import { ApprovedReports } from './ApprovedReports';
import { PendingReports } from './PendingReports';
import {Trans} from "react-i18next";
import { AllReports } from "./AllReports";
import { Redirect, RouteComponentProps, Route, Switch } from "react-router-dom";
import * as styles from "../css-modules/Issues.module.css";
import * as generalStyles from "../css-modules/General.module.css";

interface IssuesProps extends RouteComponentProps {
    match: any;
}

export class Issues extends React.Component<IssuesProps>{
    constructor(props: IssuesProps){
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(eventKey): void {
        const { path } = this.props.match;
        switch (eventKey) {
            case 1:
                this.props.history.push(`${path}/pending`);
                break;

            case 2:
                this.props.history.push(`${path}/approved`);
                break;

            default:
                this.props.history.push(`${path}/all`);
        }
    }

    render(){
        const navBar = (
            <Navbar style={{backgroundColor:'white', margin:'0px', border:0}}>
                <div className={styles.issuesNavbar}>
                    <Nav onSelect={this.handleSelect.bind(this)} style={{width:'100%', textAlign: 'center', marginLeft: 0, marginRight: 0}}>
                        <NavItem eventKey={1} className={`${generalStyles.booghText} ${styles.navItemStyle}`}>
                            <Trans>Pending</Trans>
                        </NavItem>
                        <NavItem eventKey={2} className={`${generalStyles.booghText} ${styles.navItemStyle}`}>
                            <Trans>Approved</Trans>
                        </NavItem>
                        <NavItem eventKey={3} className={`${generalStyles.booghText} ${styles.navItemStyle}`}>
                            <Trans>All</Trans>
                        </NavItem>
                    </Nav>
                </div>
            </Navbar>
        );

        const { path } = this.props.match;

        return(
            <div>
                {navBar}
                <hr className={generalStyles.subNavbarHr}/>
                <Switch>
                    <Route exact={true} path={`${path}/all`} component={AllReports} />
                    <Route path={`${path}/approved`} component={ApprovedReports} />
                    <Route path={`${path}/pending`} component={PendingReports} />
                    <Redirect from={`${path}`} to={{pathname:`${path}/all`}} />
                </Switch>
            </div>
        )
    }
}
