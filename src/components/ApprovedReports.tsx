import * as React from 'react';
import { ReportDialog } from "./ReportDialog";
import {Report} from '../types';
import BooghApi from "../api/BooghApi";
import {Trans} from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import * as generalStyles from "../css-modules/General.module.css";

type ApprovedState = {
    reports: Array<JSX.Element>,
    refresh: boolean
}

export class ApprovedReports extends React.Component<RouteComponentProps, ApprovedState> {

    constructor(props: RouteComponentProps){
        super(props);
        this.state = {
            reports: [],
            refresh: false
        };
        this.getUserApprovedReports = this.getUserApprovedReports.bind(this);
        this.notify = this.notify.bind(this);
    }

    notify(){
        this.setState({
            refresh: !this.state.refresh
        })
    }

    componentDidUpdate(prevProps: Readonly<RouteComponentProps>, prevState: Readonly<ApprovedState>, snapshot?: any): void {
        if (prevState.refresh !== this.state.refresh) {
            this.getUserApprovedReports();
        }
    }

    componentDidMount(): void {
        this.getUserApprovedReports()
    }

    getUserApprovedReports() {
        BooghApi.getUserApprovedReports().then(data => {
            let reports = data.map((data: Report) => {
                return(
                    <div key={data.id}>
                        <ReportDialog history={this.props.history} notify={() => this.notify()} report={data}/>
                    </div>
                )
            });
            this.setState({reports:reports});
        }).catch(err =>{
            console.log(err);
        });
    }

    render() {
        return(
            <div className={generalStyles.page}>
                <div className={generalStyles.pageTitle}>
                    <Trans>Approved</Trans>
                </div>
                <hr className={generalStyles.titleHr}/>
                {this.state.reports}
            </div>
        );
    }
}
