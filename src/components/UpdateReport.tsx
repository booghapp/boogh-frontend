import * as React from 'react';
import {Report, User} from "../types";
import { Upload } from "./Upload";
import {Trans} from "react-i18next";
import BooghApi from "../api/BooghApi";
import { RouteComponentProps } from 'react-router-dom';
import * as styles from "../css-modules/UpdateReport.module.css";
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import LoadingOverlay from 'react-loading-overlay';
import {getNumBytesFromBase64StringArray} from "../utils";

type UpdateReportState = {
    updatedReport: Report,
    description: string,
    images: Array<string>,
    isUpdateDescriptionMissing: boolean,
    showLoadingBar: boolean,
    showConnectionTimeout: boolean,
    totalImageBytes: number;
}

export class UpdateReport extends React.Component<RouteComponentProps, UpdateReportState> {
    private MAX_REQUEST_SIZE = 65000000;

    constructor(props: RouteComponentProps) {
        super(props);
        let sudoProps = this.props.history.location.state;
        let reporter = {} as User;
        reporter.id = sudoProps.userId;
        let updatedReport = {} as Report;
        updatedReport.parent = this.props.history.location.state.report;
        updatedReport.title = sudoProps.report.title + ' update';
        updatedReport.latitude = sudoProps.report.latitude;
        updatedReport.longitude = sudoProps.report.longitude;
        if(updatedReport.parent !== undefined){
            updatedReport.parent.date = '';
        }
        updatedReport.state = "PENDING";
        updatedReport.type = sudoProps.report.type;
        updatedReport.reporter = reporter;
        updatedReport.date = '';
        updatedReport.anonymous = sudoProps.report.anonymous;
        updatedReport.description = "";
        this.state = {
            updatedReport: updatedReport,
            description: '',
            images: [],
            isUpdateDescriptionMissing: false,
            showLoadingBar: false,
            showConnectionTimeout: false,
            totalImageBytes: 0,
        };
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setImages = this.setImages.bind(this);
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    handleDescriptionChange(event: any): void {
        this.setState({description: event.target.value});
    }

    handleSubmit(): void {
        this.state.updatedReport.description = this.state.description;
        this.updateReport(this.state.updatedReport);
    }

    updateReport = (report: Report): void => {
        this.setState({showConnectionTimeout: false, showLoadingBar: true});

        if (this.state.totalImageBytes > this.MAX_REQUEST_SIZE) {
            this.setState({showConnectionTimeout: true, showLoadingBar: false});
            return;
        }

        report.images = this.state.images;
        BooghApi.submitReport(report).then(data => {
            if(report.parent != null && report.parent.id != null){
                this.setState({showLoadingBar: false});
                this.props.history.push("/update-confirmation", {parentId:report.parent.id});
            }
        }).catch(err => {
            let error: string = err.toString();
            if (error.includes("description")) {
                this.setState({isUpdateDescriptionMissing: true});
            }
            if (error.includes("connection")) {
                this.setState({showConnectionTimeout: true});
            }
            this.setState({showLoadingBar: false});
        });
    };

    setImages(images: Array<string>) {
        let totalImageBytes = getNumBytesFromBase64StringArray(images);
        this.setState({images: images, totalImageBytes: totalImageBytes});
    }

    render(){
        let updateDescriptionClass :string = formStyles.formInput;
        let descriptionErrorMsg = <div></div>;
        if (this.state.isUpdateDescriptionMissing) {
            updateDescriptionClass = `${formStyles.formInput} ${formStyles.formInputError}` ;
            descriptionErrorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>Description is required</Trans>
                </div>
            )
        }

        return(
            <LoadingOverlay
                active={this.state.showLoadingBar}
                spinner>
                <div className={generalStyles.subContainer}>
                    <div className={generalStyles.pageTitle}>
                        <Trans>Add an update</Trans>
                    </div>
                    <hr className={generalStyles.titleHr}/>

                    <div className='form-group'>
                        <div className={`${generalStyles.booghText} ${formStyles.fieldLabel}`}>
                            <Trans>Description</Trans>
                        </div>
                        <textarea value={this.state.description} onChange={this.handleDescriptionChange} className={updateDescriptionClass}
                                  id="usernameInput" placeholder="مشکل را توضیح بده و بگو این مشکل چه پیامدهایی برای شما و دیگران داشته."
                                  style={{height:142, fontSize: 15, paddingTop: 10}}/>
                    </div>
                    {descriptionErrorMsg}
                    <hr/>

                    <Upload setImages={this.setImages} showConnectionTimeout={this.state.showConnectionTimeout}/>

                    <a onClick={this.handleSubmit} className={styles.updateReportButton}>
                        <Trans>Submit update</Trans>
                    </a>
                </div>
            </LoadingOverlay>
        )
    }
}
