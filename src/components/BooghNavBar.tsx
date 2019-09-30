import * as React from 'react';
import { Navbar, Nav, NavItem} from 'react-bootstrap';
import '../App.css';
import { Trans } from "react-i18next";
import * as styles from "../css-modules/Navbar.module.css";
import * as generalStyles from "../css-modules/General.module.css";


interface NavBarProps {
    view: string;
    onSelect: (eventKey: any) => void;
    brandOnClick: Function;
}

type NavBarState = {
    navExpanded: boolean
}

export class BooghNavBar extends React.Component<NavBarProps, NavBarState> {
    body; html;

    constructor(props: NavBarProps){
        super(props);
        this.state = {
            navExpanded: false
        };

        this.setNavExpanded = this.setNavExpanded.bind(this);
        this.closeNav = this.closeNav.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount(): void {
        this.body = document.getElementById('body');
        this.html = document.getElementById('html');
        window.addEventListener("resize", this.closeNav);
    }

    setNavExpanded() {
        this.setState({navExpanded: !this.state.navExpanded}, ()=>{
            if (this.state.navExpanded) {
                this.body.style.overflow =  'hidden';
                this.html.style.overflow = 'hidden';
            }
        })
    }

    closeNav() {
        this.setState({navExpanded: false});
        this.body.style.overflow = '';
        this.html.style.overflow = '';
    }

    onSelect(e : any) {
        this.closeNav();
        this.props.onSelect(e);
    }

    render(){

        let collapsedBooghLogo = <div></div>
        let navCollapsedBackground = <div></div>
        let navbarCollapsedStyle = "";
        if (this.state.navExpanded){
            navCollapsedBackground = (
                <div id={"navCollapedBackground"} className={styles.navbarCollapseBackground} onClick={this.closeNav}>
                </div>
            );
            collapsedBooghLogo = (

                <div className={styles.collapsedBooghLogoContainer}>
                    <img className={styles.collapsedBooghLogo} src={require("../assets/Boogh_logo.png")}></img>
                    <hr/>
                </div>
            )
            navbarCollapsedStyle = styles.navbarCollapse;
        }

        const navBrandandToggle = (
            <div className={generalStyles.container}>
                <Navbar.Brand className={styles.navBrand}>
                    <img src={require("../assets/Boogh_logo.png")} className={styles.navBrandImg}
                         onClick={() => {this.props.brandOnClick()}}/>
                </Navbar.Brand>
                <Navbar.Toggle className={styles.navToggle}>
                    <img style={{height: 32, width:32}} src={require("../assets/hamburger_icon.png")}/>
                </Navbar.Toggle>
            </div>
        );

        const commonNavItems = (
                <Nav onSelect={this.onSelect} className={styles.navbarCommonItems}>
                    <NavItem eventKey={4} href="#">
                        <div className={styles.navbarItem}>
                            <Trans>Help</Trans>
                            <img src={require("../assets/help_icon.png")} className={styles.navbarItemIcon}/>
                        </div>
                    </NavItem>
                    <NavItem eventKey={5} href="#">
                        <div className={styles.navbarItem}>
                            <Trans>Explore</Trans>
                            <img src={require("../assets/search_icon.png")} className={styles.navbarItemIcon}/>
                        </div>
                    </NavItem>
                    <NavItem eventKey={6} href="#">
                        <div className={styles.navbarItem}>
                            <Trans>Submit</Trans>
                            <img src={require("../assets/submit_icon.png")} className={styles.navbarItemIcon}/>
                        </div>
                    </NavItem>
                </Nav>
        );

        const navbarNotLoggedIn = (
            <div>
                <Navbar onToggle={this.setNavExpanded} expanded={this.state.navExpanded} fixedTop={false} className={styles.navbar}>
                    {navBrandandToggle}
                    {navCollapsedBackground}
                    <Navbar.Collapse className={navbarCollapsedStyle}>
                        {collapsedBooghLogo}
                        <Nav onSelect={this.onSelect} className={styles.navGroupStyle}>
                            <NavItem eventKey={1}>
                                <button className={styles.navbarButton}>
                                    <Trans>Sign up</Trans>
                                </button>
                            </NavItem>
                            <NavItem eventKey={2}>
                                <button className={styles.navbarButton}>
                                    <Trans>Log in</Trans>
                                </button>
                            </NavItem>
                        </Nav>
                        {commonNavItems}
                    </Navbar.Collapse>
                </Navbar>
                <hr className={styles.navbarHr}/>
            </div>
        );

        if (this.props.view === 'notLoggedIn') {
            return navbarNotLoggedIn;

        }else if (this.props.view === 'loggedIn') {

            return (
                <div>
                    <Navbar onToggle={this.setNavExpanded} expanded={this.state.navExpanded} fixedTop={false} className={styles.navbar}>
                        {navBrandandToggle}
                        {navCollapsedBackground}
                        <Navbar.Collapse className={navbarCollapsedStyle}>
                            {collapsedBooghLogo}
                            <Nav onSelect={this.onSelect} className={styles.navGroupStyle}>
                                <NavItem eventKey={7}>
                                    <button className={styles.navBarLogoutButton}>
                                        <Trans>Log out</Trans>
                                    </button>
                                </NavItem>
                                <NavItem eventKey={3}>
                                    <div className={styles.navbarItem}>
                                        <Trans>Profile</Trans>
                                        <img src={require('../assets/profile_icon.png')} className={styles.navbarItemIcon} style={{display:'inline'}}/>
                                    </div>
                                </NavItem>
                            </Nav>
                            {commonNavItems}
                        </Navbar.Collapse>
                    </Navbar>
                    <hr className={styles.navbarHr}/>
                </div>
            )
        } else{

            return (
                <div className={styles.navbarDisplay}>
                    {navbarNotLoggedIn}
                </div>
            )
        }
    }
}
