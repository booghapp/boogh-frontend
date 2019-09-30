import * as React from 'react';
import {Trans} from "react-i18next";
import { RouteComponentProps } from "react-router-dom";
import * as confirmationStyles from "../css-modules/Confirmation.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import * as styles from '../css-modules/UpdateConfirmation.module.css';

export class UpdateConfirmation extends React.Component<RouteComponentProps>{
    constructor(props: RouteComponentProps){
        super(props);
        this.returnToMap = this.returnToMap.bind(this);
        this.viewReport = this.viewReport.bind(this);
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    returnToMap(){
        this.props.history.push("/explore");
    }

    viewReport(reportId: number){
        this.props.history.push("/report?id=" + reportId)
    }

    render(){
        return(
            <div className={generalStyles.componentContainer}>
                <div className={confirmationStyles.confirmation}>
                    <div className={`${generalStyles.booghText} ${confirmationStyles.confirmationHeader}`}>
                        <Trans>Your update has been submitted</Trans>
                    </div>
                    <img className={confirmationStyles.confirmationImg} src={require('../assets/Boogh_submitted_issue.png')}/>
                    <div className={confirmationStyles.confirmationText}>
                        <Trans>Your update is being reviewed by a moderator and pending approval. You will receive an email when it goes live.</Trans>
                    </div>
                    <a className={styles.viewUpdateButton} onClick={() => {this.viewReport(this.props.history.location.state.parentId)}}>
                        <Trans>View update</Trans>
                    </a>
                    <a className={styles.submitNewIssueButton} onClick={this.returnToMap}>
                        <Trans>Return to map</Trans>
                    </a>
                </div>
            </div>
        )
    }
}
