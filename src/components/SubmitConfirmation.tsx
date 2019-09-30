import * as React from 'react';
import {Trans} from "react-i18next";
import BooghApi from "../api/BooghApi";
import { RouteComponentProps } from "react-router-dom";
import * as confirmationStyles from "../css-modules/Confirmation.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import * as styles from "../css-modules/SubmitConfirmation.module.css";

export class SubmitConfirmation extends React.Component<RouteComponentProps>{

    constructor(props: RouteComponentProps){
        super(props);
        this.viewReport = this.viewReport.bind(this);
        this.selectSubmit = this.selectSubmit.bind(this);
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    viewReport(reportId: number){
        this.props.history.push("/report?id=" + reportId)
    }

    selectSubmit(){
        this.props.history.push("/submit")
    }

    render(){

        let updateButton = <div></div>;
        let confirmationText = "Your issue is being reviewed by a moderator.  Check back to see if your issue was approved!";
        if (BooghApi.getToken() != "") {
            updateButton = (
                <div>
                    <a
                        className={styles.viewPendingIssueButton}
                        onClick={() => {
                            this.viewReport(this.props.history.location.state.reportId)
                        }}
                    >
                        <Trans>View pending issue</Trans>
                    </a>
                </div>
            )
            confirmationText = "Your issue is being reviewed by a moderator. You will receive an email when it goes live.";
        }

        return(
            <div className={generalStyles.componentContainer}>
                <div className={confirmationStyles.confirmation}>
                    <div className={`${generalStyles.booghText} ${confirmationStyles.confirmationHeader}`}>
                        <Trans>Your issue has been submitted</Trans>
                    </div>
                    <img className={confirmationStyles.confirmationImg} src={require('../assets/Boogh_submitted_issue.png')}/>
                    <div className={confirmationStyles.confirmationText}>
                        <Trans>{confirmationText}</Trans>
                    </div>
                    {updateButton}
                    <a className={styles.submitNewIssueButton} onClick={this.selectSubmit}>
                        <Trans>Submit a new issue</Trans>
                    </a>
                </div>
            </div>
        )
    }
}
