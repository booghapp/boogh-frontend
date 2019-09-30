import * as React from 'react';
import {Report, ReportStatus, ReportStatusState, User} from '../types';
import BooghApi from "../api/BooghApi";
import {Trans} from "react-i18next";
import {RouteComponentProps} from 'react-router-dom';
import {SocialSharing} from "./SocialSharing";
import * as styles from "../css-modules/ReportOptions.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import config from "../config";
import {Modal} from "react-bootstrap";
import {SocialSharingOptions} from "./SocialSharingOptions";
import OutsideClickHandler from 'react-outside-click-handler';
import {gregorianDateToJalaaliDate} from "../utils";

interface ReportOptionsProps {
    history: RouteComponentProps['history'];
    report: Report;
    isTopOptions: boolean;
    notify: Function;
}

type ReportOptionsState = {
    favoriteToggle: boolean,
    showSharingDialog: boolean,
    showCollapsedOptionsDialog: boolean,
    showDeleteConfirmationDialog: boolean,
    outSideClickDisabled: boolean,
    isReportFlagged: boolean,
}

export class ReportOptions extends React.Component<ReportOptionsProps, ReportOptionsState>{
    constructor(props){
        super(props);
        this.state = {
            favoriteToggle: (this.props.report.favoritedByCurrentUser != null) ? this.props.report.favoritedByCurrentUser : false,
            showSharingDialog: false,
            showCollapsedOptionsDialog: false,
            showDeleteConfirmationDialog: false,
            outSideClickDisabled: true,
            isReportFlagged: false,

        };
        this.favoriteReport = this.favoriteReport.bind(this);
        this.openDeleteConfirmationDialog = this.openDeleteConfirmationDialog.bind(this);
        this.openSharingDialog = this.openSharingDialog.bind(this);
        this.openCollapsedOptionsDialog = this.openCollapsedOptionsDialog.bind(this);
        this.checkIfReportFlagged = this.checkIfReportFlagged.bind(this);
        this.viewProfile = this.viewProfile.bind(this);
    }

    componentDidMount(): void {
        this.checkIfReportFlagged();
    }

    favoriteReport(): void {
        if (BooghApi.getToken() !== ""){
            let toggle = !this.state.favoriteToggle;
            this.setState({
                favoriteToggle: toggle
            });

            let report = {} as Report;
            report.id = this.props.report.id;
            let reportStatusState :ReportStatusState = ReportStatusState.FALSE;
            if(toggle == true){
                reportStatusState = ReportStatusState.TRUE;
            }

            const reportStatus: ReportStatus = {
                saved: reportStatusState,
                report: report,
                reporter: {} as User,
                flagged: ReportStatusState.UNSET
            };
            BooghApi.favoriteReport(reportStatus).then(data =>{
                this.props.notify(false);
            });
        } else {
            this.props.history.push("/login");
        }
    }

    flagReport(): void {
        if (BooghApi.getToken() != "") {
            let report = {} as Report;
            report.id = this.props.report.id;

            let flagValue = ReportStatusState.TRUE;
            if (this.state.isReportFlagged) {
                flagValue = ReportStatusState.FALSE;
            }

            const reportStatus: ReportStatus = {
                saved: ReportStatusState.UNSET,
                report: report,
                reporter: {} as User,
                flagged: flagValue
            };
            BooghApi.flagReport(reportStatus).then(data => {
                this.checkIfReportFlagged();
            });
        } else {
            this.props.history.push("/login");
        }
    }

    checkIfReportFlagged(): void {
        BooghApi.getUserFlagForReport(this.props.report.id || -1).then(data => {
            if(data.length !== 0){
                if (data[0].flagged === ReportStatusState.TRUE) {
                    this.setState({isReportFlagged: true});
                } else {
                    this.setState({isReportFlagged: false});
                }
            }
        }).catch(err => {
            console.log(err);
        })
    }

    deleteReport(reportId: number): void{
        BooghApi.deleteReport(reportId).then(data =>{
            this.props.notify(true);
        }).catch(err => {
            console.log(err);
        });
    }

    openDeleteConfirmationDialog(){
        this.setState({showDeleteConfirmationDialog: !this.state.showDeleteConfirmationDialog});
    }

    openSharingDialog() {
        this.setState({
            showSharingDialog: !this.state.showSharingDialog,
            outSideClickDisabled: !this.state.outSideClickDisabled,
        })
    }

    openCollapsedOptionsDialog() {
        this.setState({showCollapsedOptionsDialog: !this.state.showCollapsedOptionsDialog});
    }

    viewProfile(event: any){
        this.props.history.push("/reporter", {reporterName: this.props.report.reporter.login, reporterId: this.props.report.reporter.id});
        event.preventDefault();
    }

    updateReport(report: Report){
        this.props.history.push("/update", {report: report})
    }

    render() {
        let jalaaliDate = gregorianDateToJalaaliDate(this.props.report.date);

        let author: string;
        let reporterId = this.props.report.id;

        let currentUserReport = this.props.report.currentUserReport || false;
        let optionsType: number;
        if (currentUserReport) {
            optionsType = 1;
        }else if (this.props.report.reporter == null){
            optionsType = 2;
        } else {
            optionsType = 3;
        }

        let src = require("../assets/favorite_inactive_icon.png");
        if (this.state.favoriteToggle) {
            src  = require("../assets/favorite_active_icon.png");
        }

        let dotsOption = <button onClick={this.openCollapsedOptionsDialog} className={`${styles.dotsVisibility} ${styles.option}`}>
                            ...
                        </button>

        let collapsedOptions: JSX.Element;
        let options: JSX.Element;
        if (!this.props.isTopOptions) {
            //Options that are positioned below Map or Pictures

            const sharingOption = (
                <button className={styles.option} onClick={() => {this.openSharingDialog()}}>
                    <Trans>Share</Trans>
                    <img src={require('../assets/share_icon.png')} className={styles.icon}/>
                </button>
            );

            const favoriteOption = (
                <button className={styles.option} style={{paddingRight:0, marginRight: 0}} onClick={() => this.favoriteReport()}>
                    <Trans>Favorite</Trans>
                    <img src={src} className={styles.icon}/>
                </button>
            );

            collapsedOptions = (
                <div>
                    <button className={`${styles.option} ${styles.collapsibleOption}`} onClick={this.openDeleteConfirmationDialog}>
                        <Trans>Delete</Trans>
                    </button>
                    <button className={`${styles.option} ${styles.collapsibleOption}`} onClick={() => this.updateReport(this.props.report)}>
                        <Trans>Add update</Trans>
                    </button>
                </div>
            );

            const optionsForYourReport = (
                <div style={{padding: 10, paddingRight: 21}}>
                    <div className={styles.collapsibleOptions}>
                        {collapsedOptions}
                    </div>
                    {dotsOption}
                    {sharingOption}
                    {favoriteOption}
                </div>
            );

            if (optionsType == 1) {
                //Valid from Approved Reports or Pending Reports.
                author = "you";
                options = optionsForYourReport;
            } else {

                let flaggedStyle = {};

                if (this.state.isReportFlagged) {
                    flaggedStyle = {color: '#DC143C'}
                }

                const reportOption = (
                    <div className={generalStyles.tooltip}>
                        <button className={`${styles.option} ${styles.collapsibleOption}`} style={flaggedStyle} onClick={() => this.flagReport()}>
                            <Trans>Report</Trans>
                            <img src={require("../assets/report_icon.png")} className={styles.icon}/>
                        </button>
                        <span className={generalStyles.tooltiptext}>
                            <Trans>Flag as inappropriate</Trans>
                        </span>
                    </div>
                );
                collapsedOptions = reportOption;
                if (optionsType == 2) {
                    author = "anonymous";
                    options = (
                        <div style={{padding: 10, paddingRight: 21}}>
                            <div className={styles.collapsibleOptions}>
                                {collapsedOptions}
                            </div>
                            {dotsOption}
                            {sharingOption}
                            {favoriteOption}
                        </div>
                    );
                } else {
                    author = this.props.report.reporter.login;
                    reporterId = this.props.report.reporter.id;
                    collapsedOptions = (
                        <div>
                            <a className={`${styles.option} ${styles.collapsibleOption}`} onClick={this.viewProfile} href={"/reporter"}>
                                <Trans>View profile</Trans>
                            </a>
                            {reportOption}
                        </div>
                    );
                    options = (
                        <div style={{padding: 10, paddingRight: 21}}>
                            <div className={styles.collapsibleOptions}>
                                {collapsedOptions}
                            </div>
                            {dotsOption}
                            {sharingOption}
                            {favoriteOption}
                        </div>
                    );
                }
            }
        }else{
            //Options that are positioned on top of map or pictures.
            collapsedOptions = <div></div>
            let reportStateStyle;
            let reportState: string = this.props.report.state.substr(0,1) + this.props.report.state.substr(1).toLocaleLowerCase();

            if (reportState == 'Approved') {
                reportStateStyle = generalStyles.approved;
            } else if (reportState == 'Pending') {
                reportStateStyle = generalStyles.pending;
            } else {
                reportStateStyle = generalStyles.rejected;
            }

            let reportStateContent = (<div></div>);
            let author;

            if (optionsType == 1) {
                reportStateContent = (
                    <div style={{display:'inline-block', marginRight: 15}}>
                        <div className={styles.option} style={{margin: '1px 5px 1px 1px'}}><Trans>{reportState}</Trans></div>
                        <div className={`${styles.statusCircle} ${reportStateStyle}`}></div>
                    </div>
                );
                author = 'you';
            }else if (optionsType == 2) {
                author = 'anonymous';
            }else{
                author = this.props.report.reporter.login;
            }
            let space = " ";

            options = (
                <div>
                    <div style={{padding:5, paddingRight: 0}}>
                        {reportStateContent}
                        <div className={styles.option} style={{direction: 'rtl'}}>
                            <Trans>posted by</Trans>
                            {space}
                            <Trans>{author}</Trans>
                        </div>
                        <div className={styles.option} style={{marginLeft:10, marginRight: 0}}>{jalaaliDate}</div>
                    </div>
                </div>
            );
        }

        let sharingDialog: JSX.Element;
        let domain = config.socialLoginRedirect.substr(0 , config.socialLoginRedirect.length - 6);
        let reportURL : string = domain + "/report?id=" + this.props.report.id;
        if (window.innerWidth < 770) {
            sharingDialog = <CollapsedOptionsDialog options={<SocialSharingOptions reportURL={reportURL}/>} show={this.state.showSharingDialog}
                                                    onHide={this.openSharingDialog}/>
        } else {
            sharingDialog = (
                <OutsideClickHandler disabled={this.state.outSideClickDisabled} onOutsideClick={() => {
                    this.setState({
                        outSideClickDisabled: true,
                        showSharingDialog: false
                    })

                }}>
                    <SocialSharing show={this.state.showSharingDialog} sharingOptions={<SocialSharingOptions reportURL={reportURL}/>}/>
                </OutsideClickHandler>
            );
        }

        let reportId = this.props.report.id || -1;

        let deleteConfirmation = (
            <div>
                <div className={styles.option}>
                    <Trans>Do you want to delete this report?</Trans>
                </div>
                <div>
                    <button className={styles.option} onClick={() => this.deleteReport(reportId)}>
                        <Trans>yes</Trans>
                    </button>
                    <button className={styles.option} onClick={() => this.openDeleteConfirmationDialog()}>
                        <Trans>no</Trans>
                    </button>
                </div>
            </div>
        );



        return(
            <div style={{position:'relative'}}>
                {options}
                {sharingDialog}

                <CollapsedOptionsDialog options={collapsedOptions} show={this.state.showCollapsedOptionsDialog}
                                        onHide={this.openCollapsedOptionsDialog} />
                <CollapsedOptionsDialog options={deleteConfirmation} show={this.state.showDeleteConfirmationDialog}
                                        onHide={this.openDeleteConfirmationDialog}/>
            </div>
        );
    }
}

type CollapsedOptionsDialogProps = {
    options: JSX.Element;
    show: boolean;
    onHide: Function;
}

function CollapsedOptionsDialog(props: CollapsedOptionsDialogProps) {


    return (
            <Modal
                show={props.show}
                onHide={props.onHide}
                dialogClassName="modal-options"
                aria-labelledby="example-custom-modal-styling-title">

                <Modal.Header>
                    <button className={generalStyles.borderNone} style={{textAlign: 'left', margin: 20, width: '100%', color: 'gray'}} onClick={() => props.onHide()}>
                        <img src={require("../assets/close.png")} style={{height: 14, width: 14}}/>
                    </button>
                    <Modal.Body style={{backgroundColor: 'white', textAlign: 'right'}}>
                        {props.options}
                    </Modal.Body>
                </Modal.Header>

            </Modal>
    )
}
