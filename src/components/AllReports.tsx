import * as React from 'react';
import { ReportDialog } from "./ReportDialog";
import {Report} from '../types';
import BooghApi from "../api/BooghApi";
import {Trans} from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import * as generalStyles from "../css-modules/General.module.css";

type AllReportsState = {
    reports: Array<JSX.Element>,
    refresh: boolean,
}

export class AllReports extends React.Component<RouteComponentProps, AllReportsState> {
    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            reports: [],
            refresh: false,
        };
        this.getAllUserReports = this.getAllUserReports.bind(this);
        this.notify = this.notify.bind(this);
    }

    public componentDidMount(): void {
        this.getAllUserReports();
    }

    public componentDidUpdate(
        prevProps: Readonly<RouteComponentProps>,
        prevState: Readonly<AllReportsState>,
    ): void {
        if (prevState.refresh !== this.state.refresh) {
            this.getAllUserReports();
        }
    }

    private notify() {
        this.setState({
            refresh: !this.state.refresh,
        });
    }

    private getAllUserReports() {
        BooghApi.getUserReports().then((data) => {
            const reports = data.map((report: Report) => {
                return (
                    <div key={report.id}>
                        <ReportDialog history={this.props.history} notify={() => this.notify()} report={report}/>
                    </div>
                );
            });
            this.setState({reports:reports});
        }).catch(err =>{
            console.log(err);
        });
    }

    public render() {
        return (
            <div className={generalStyles.page}>
                <div className={generalStyles.pageTitle}>
                    <Trans>All Reports</Trans>
                </div>
                <hr className={generalStyles.titleHr}/>
                {this.state.reports}
            </div>
        );
    }
}
