import * as React from 'react';
import { ReportDialog } from "./ReportDialog";
import { ReportStatus } from '../types';
import BooghApi from "../api/BooghApi";
import { Trans } from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import * as generalStyles from "../css-modules/General.module.css";

type FavoritedState = {
    reports: Array<JSX.Element>,
    refresh: boolean
}

export class FavoritedReports extends React.Component<RouteComponentProps, FavoritedState> {
    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            reports: [],
            refresh: false
        };
        this.notifyListener = this.notifyListener.bind(this);
    }

    componentDidMount(): void {
        BooghApi.getUserFavoritedReports().then(data => {

            let reports = data.map((data: ReportStatus) => {
                let reportId;
                if(data.report.id != null){
                    reportId = data.report.id;
                }else{
                    reportId = -1;
                }
                return(
                    <div key={reportId} >
                        <ReportDialog history={this.props.history} notify={this.notifyListener} report={data.report}/>
                    </div>
                )
            });
            this.setState({reports:reports});
        }).catch(err => {
            console.log(err);
        });
    }

    notifyListener(){
        this.setState({refresh: !this.state.refresh});
    }

    componentDidUpdate(prevProps: Readonly<RouteComponentProps>, prevState: Readonly<FavoritedState>, snapshot?: any): void {
        if (prevState.refresh !== this.state.refresh) {
            BooghApi.getUserFavoritedReports().then(data => {
                let reports = data.map((data: ReportStatus) => {
                    if (data.report.id == null){
                        data.report.id = -1;
                    }
                    return(
                        <div key={data.report.id.toString()}>
                            <ReportDialog history={this.props.history} notify={this.notifyListener} report={data.report}/>
                        </div>
                    )
                });
                this.setState({reports:reports});
            });
        }
    }

    render(){
        return(
            <div className={generalStyles.page}>
                <div className={generalStyles.pageTitle}>
                    <Trans>Favorited</Trans>
                </div>
                <hr className={generalStyles.titleHr}/>
                {this.state.reports}
            </div>
        );
    }
}
