import * as React from 'react';
import { Report } from '../types';
import { ReportOptions } from "./ReportOptions";
import { RouteComponentProps } from "react-router-dom";
import config from "../config";
import * as styles from "../css-modules/ReportDialog.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import BooghApi from "../api/BooghApi";
import {truncateReportTitle} from "../utils";

interface ReportDialogProps {
    history: RouteComponentProps['history'];
    report: Report;
    notify: Function;
}

export class ReportDialog extends React.Component<ReportDialogProps, any> {
    MAX_TITLE_LENGTH = 35;

    viewReport(reportId: number, event: any){
        this.props.history.push("/report?id=" + reportId);
        event.preventDefault();
    }

    render() {
        const reportId = this.props.report.id || -1;

        const reportImage = (() => {
            if (
                Array.isArray(this.props.report.images)
                && this.props.report.images.length >= 0
            ) {
                return this.props.report.images[0];
            }

            return null;
        })();

        let imgSrc : string = "";
        let imgStyle = {display: 'block', height:225, backgroundColor: '#e0e2e5'};

        if (typeof reportImage === 'string') {
            imgSrc = `${config.cloudFrontUrl}` + reportImage;
            imgStyle = {display: 'block', height:225, backgroundColor: 'transparent'}
        }

        let reportTitle = truncateReportTitle(BooghApi.decodeHtml(this.props.report.title), this.MAX_TITLE_LENGTH);

        return(
            <div id={reportId.toString()} className={`${generalStyles.rounded} ${styles.dialog}`}>
                <a onClick={(event) => this.viewReport(reportId, event)} href={"/report?id=" + reportId}>
                    <div style={{paddingRight: 21}}>
                        <div className={styles.dialogTitle}>
                            {reportTitle}
                        </div>
                        <ReportOptions history={this.props.history} notify={this.props.notify} report={this.props.report} isTopOptions={true}/>
                    </div>
                    <div style={imgStyle}>
                        <img style={{height: 225, maxWidth: '100%'}} src={imgSrc}/>
                    </div>
                </a>
                <ReportOptions history={this.props.history} notify={this.props.notify} report={this.props.report} isTopOptions={false}/>
            </div>
        );
    }
}
