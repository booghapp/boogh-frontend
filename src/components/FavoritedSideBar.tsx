import * as React from 'react';
import { ReportStatus } from "../types";
import { SideBar } from './SideBar';
import BooghApi from '../api/BooghApi';
import { RouteComponentProps } from 'react-router-dom';
import {Trans} from "react-i18next";
import * as sidebarStyles from '../css-modules/SideBar.module.css';
import * as generalStyles from "../css-modules/General.module.css";
import {gregorianDateToJalaaliDate, truncateReportTitle} from "../utils";

interface FavoritedSideBarProps {
    history: RouteComponentProps['history'];
    refresh: boolean;
}

type FavoritedSideBarState = {
    reports: Array<JSX.Element>
}

export class FavoritedSideBar extends React.Component<FavoritedSideBarProps, FavoritedSideBarState> {
    MAX_TITLE_LENGTH = 30;
    constructor(props: FavoritedSideBarProps){
        super(props);
        this.state = {
            reports:[]
        };
        this.getUserFavoritedReports = this.getUserFavoritedReports.bind(this);
        this.selectFavoriteProfileTab = this.selectFavoriteProfileTab.bind(this);
    }

   componentDidMount() {
       this.getUserFavoritedReports();
    }

    componentDidUpdate(prevProps: Readonly<FavoritedSideBarProps>, prevState: Readonly<FavoritedSideBarState>, snapshot?: any): void {
        if (this.props.refresh !== prevProps.refresh) {
            this.getUserFavoritedReports();
        }
    }

    getUserFavoritedReports(){
        BooghApi.getUserFavoritedReports().then(data => {
            //We only need the first 3 reports
            let numElementsToGet = Math.min(data.length, 3);
            data.splice(numElementsToGet, data.length - numElementsToGet);

            let reports = data.map((data: ReportStatus) => {
                let author: string = "anonymous";
                if (data.report.reporter != null) {
                    author = data.report.reporter.login;
                }
                let reportTitle: string = truncateReportTitle(BooghApi.decodeHtml(data.report.title), this.MAX_TITLE_LENGTH);
                let reportDate: string = gregorianDateToJalaaliDate(data.report.date);

                return (
                    <div key={data.id} style={{margin: '15px 0px', direction: 'rtl'}}>
                        <div className={`${sidebarStyles.sidebarContentTitle} ${generalStyles.booghText}`}>{reportTitle}</div>
                        <div className={`${sidebarStyles.sidebarContentText} ${generalStyles.booghText}`}>
                            <Trans>Submitted</Trans>: {reportDate}</div>
                        <div className={`${sidebarStyles.sidebarContentText} ${generalStyles.booghText}`}>
                            <Trans>By</Trans>
                            {author}
                        </div>
                    </div>
                )
            });
            this.setState({reports: reports});
        }).catch(err => {
            console.log(err);
        });
    }

    selectFavoriteProfileTab(){
        this.props.history.push("/profile/favorites");
    }

    render(){
        return(
            <div>
                <SideBar profileTab="Favorited" data={this.state.reports} selectProfileTab={this.selectFavoriteProfileTab}/>
            </div>
        )
    }
}
