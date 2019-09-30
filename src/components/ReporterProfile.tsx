import * as React from "react";
import BooghApi from "../api/BooghApi";
import {Report} from "../types";
import { ReportDialog } from "./ReportDialog";
import {Trans} from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import * as generalStyles from "../css-modules/General.module.css";

type ReporterProfileState = {
    reports: Array<JSX.Element>
}

export class ReporterProfile extends React.Component<RouteComponentProps, ReporterProfileState> {

    constructor(props: RouteComponentProps){
        super(props);
        this.state = {
            reports: []
        }
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        BooghApi.getUserApprovedReports(this.props.history.location.state.reporterId).then(data => {
            let reports = data.map((data: Report) => {
                return(
                    <div key={data.id}>
                        <ReportDialog history={this.props.history} notify={() => {}} report={data}/>
                    </div>
                )
            });
            this.setState({reports:reports});
        }).catch(err =>{
            console.log(err);
        });
    }

    render(){
        return (
            <div className={`${generalStyles.componentContainer} ${generalStyles.page}`}>
                <div className={generalStyles.pageTitle}>
                    {this.props.history.location.state.reporterName} <Trans>Profile</Trans>
                </div>
                <hr className={generalStyles.titleHr}/>
                {this.state.reports}
            </div>
        )
    }
}
