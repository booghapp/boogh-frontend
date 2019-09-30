import * as React from 'react';
import {Trans} from "react-i18next";
import * as styles from "../css-modules/SideBar.module.css";
import * as generalStyles from "../css-modules/General.module.css";

type SideBarProps = {
    profileTab: string,
    selectProfileTab: Function,
    data: Array<JSX.Element>
}

export class SideBar extends React.Component<SideBarProps>{
    constructor(props: SideBarProps){
        super(props);
        this.viewAll = this.viewAll.bind(this);
    }

    viewAll(event: any): void{
        this.props.selectProfileTab(this.props.profileTab);
        event.preventDefault();
    }

    render(){

        let href = "/profile/"
        if (this.props.profileTab == "Favorited") {
            href += "favorites"
        } else {
            href += "issues"
        }
        return(
            <div className={`${styles.sidebar} ${generalStyles.rounded}`}>
                <div className={styles.sidebarTitle}>
                    <Trans>{this.props.profileTab.toLocaleUpperCase()} ISSUES</Trans>
                </div>
                {this.props.data}
                <div style={{width: '100%', textAlign: 'center', marginTop: 10}}>
                    <a className={styles.sidebarFooter} onClick={this.viewAll} href={href}>
                        <Trans>VIEW ALL</Trans>
                    </a>
                </div>
            </div>
        )
    }
}
