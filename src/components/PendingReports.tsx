import * as React from 'react';
import { ReportDialog } from "./ReportDialog";
import {Report} from '../types';
import BooghApi from "../api/BooghApi";
import { RouteComponentProps } from 'react-router-dom';
import {Trans} from "react-i18next";
import * as generalStyles from "../css-modules/General.module.css";

type PendingState = {
    reports: Array<JSX.Element>,
    refresh: boolean
}

export class PendingReports extends React.Component<RouteComponentProps, PendingState> {
    constructor(props: RouteComponentProps){
        super(props);
        this.state = {
            reports: [],
            refresh: false
        };
        this.getUserPendingReports = this.getUserPendingReports.bind(this);
        this.notify = this.notify.bind(this);
    }

    notify(){
        this.setState({
            refresh: !this.state.refresh
        })
    }

    componentDidUpdate(prevProps: Readonly<RouteComponentProps>, prevState: Readonly<PendingState>, snapshot?: any): void {
        if (prevState.refresh !== this.state.refresh) {
            this.getUserPendingReports();
        }
    }

    componentDidMount(): void {
        this.getUserPendingReports();
    }

    getUserPendingReports(){
        BooghApi.getUserPendingReports().then(data => {
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

    render(){
        return(
            <div className={generalStyles.page}>
                <div className={generalStyles.pageTitle}>
                    <Trans>Pending</Trans>
                </div>
                <hr className={generalStyles.titleHr}/>
                {this.state.reports}
            </div>
        )
    }
}
