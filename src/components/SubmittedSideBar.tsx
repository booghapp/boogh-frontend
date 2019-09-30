import * as React from 'react';
import {Report} from '../types';
import { SideBar } from "./SideBar";
import BooghApi from "../api/BooghApi";
import {Trans} from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import * as styles from "../css-modules/SubmittedSideBar.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import * as sidebarStyles from "../css-modules/SideBar.module.css";
import {gregorianDateToJalaaliDate, truncateReportTitle} from "../utils";

interface SubmittedDialogProps {
    history: RouteComponentProps['history'];
    refresh: boolean;
}

type SubmittedDialogState = {
    reports: Array<JSX.Element>
}

export class SubmittedSideBar extends React.Component<SubmittedDialogProps, SubmittedDialogState> {

    MAX_TITLE_LENGTH = 30;
    constructor(props){
        super(props);
        this.state = {
            reports:[]
        };
        this.getUserReports = this.getUserReports.bind(this);
        this.selectIssuesProfileTab = this.selectIssuesProfileTab.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<SubmittedDialogProps>, prevState: Readonly<SubmittedDialogState>, snapshot?: any): void {
        if (this.props.refresh !== prevProps.refresh) {
            this.getUserReports();
        }
    }

    componentDidMount() {
        this.getUserReports();
    }

    getUserReports(){
        BooghApi.getUserReports().then(data => {
            //We only need the first 3 reports
            let numElementsToGet = Math.min(data.length, 3);
            data.splice(numElementsToGet, data.length - numElementsToGet);

            let reports = data.map((data) => {
                let report: Report = data;
                let state: string = report.state.substr(0,1) + report.state.substr(1).toLocaleLowerCase();
                let reportStateStyle;
                if (state == 'Approved') {
                    reportStateStyle = generalStyles.approved;
                }else if (state == 'Pending') {
                    reportStateStyle = generalStyles.pending;
                }else{
                    reportStateStyle = generalStyles.rejected;
                }
                let reportTitle: string = truncateReportTitle(BooghApi.decodeHtml(report.title), this.MAX_TITLE_LENGTH);
                let reportDate: string = gregorianDateToJalaaliDate(report.date);

                return(
                    <div key={data.id} style={{margin: '15px 0px', direction: 'rtl'}}>
                        <div className={`${sidebarStyles.sidebarContentTitle} ${generalStyles.booghText}`}>
                            {reportTitle}
                        </div>
                        <div className={`${sidebarStyles.sidebarContentText} ${generalStyles.booghText}`}>
                            <Trans>Submitted</Trans>: {reportDate}
                        </div>
                        <div className={`${sidebarStyles.sidebarContentText} ${generalStyles.booghText}`}>
                            <div className={`${generalStyles.statusCircle} ${reportStateStyle}`}></div>
                            <div className={styles.submittedSbState}><Trans>{state}</Trans></div>
                        </div>
                    </div>
                )
            });
            this.setState({reports: reports});

        }).catch(err =>{
            console.log(err);
        });
    }

    selectIssuesProfileTab(){
        this.props.history.push("/profile");
    }

    render() {
        return(
            <div>
                <SideBar profileTab="Submitted" data={this.state.reports} selectProfileTab={this.selectIssuesProfileTab} />
            </div>

        )
    }
}
