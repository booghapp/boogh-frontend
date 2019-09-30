import * as React from 'react';
import * as generalStyles from "../css-modules/General.module.css";
import BooghApi from "../api/BooghApi";
import {Document, Feedback} from '../types';
import {Trans} from "react-i18next";
import * as formStyles from "../css-modules/Form.module.css";
import * as styles from "../css-modules/Help.module.css";
const ReactMarkdown = require("react-markdown");

interface AboutState {
    feedbackContent: string,
    showContentMissing: boolean,
    showUnknownError: boolean,
    showSubmissionSuccess: boolean,
    document: Document,
}

export class About extends React.Component<any, AboutState>{

    constructor(props: any) {
        super(props);
        this.state = {
            feedbackContent: "",
            showContentMissing: false,
            showUnknownError: false,
            showSubmissionSuccess: false,
            document: {} as Document,
        };
        this.handleFeedbackChange = this.handleFeedbackChange.bind(this);
        this.submitFeedback = this.submitFeedback.bind(this);
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        BooghApi.getDocumentOfType("ABOUT").then(data  => {
            if (data.length != 0) {
                this.setState({document:data[0]});
            }
        }).catch(err => {
            console.log(err);
        })
    }

    private handleFeedbackChange(event: any) {
        this.setState({
            feedbackContent: event.target.value
        })
    }

    private submitFeedback() {
        let feedback = {} as Feedback;
        feedback.content = this.state.feedbackContent;
        feedback.date = "";
        BooghApi.submitFeedback(feedback).then(() => {
            this.setState({feedbackContent: "", showContentMissing: false, showUnknownError: false, showSubmissionSuccess: true})
        }).catch(err => {
            let error: string = err.toString();
            if (error.includes("Feedback")) {
                this.setState({showContentMissing: true})
            } else {
                this.setState({showUnknownError: true})
            }
            this.setState({showSubmissionSuccess: false});
        })
    }

    render() {

        let errorMsg = <div></div>
        if (this.state.showUnknownError) {
            errorMsg = (
                <div className={formStyles.formError}>
                    <div className={formStyles.formInputErrorText} style={{textAlign: 'center', transform: 'translate(-50%, -50%)', top: '50%', left: '50%', position:'absolute'}}>
                        <Trans>Your feedback could not be submitted</Trans>
                    </div>
                </div>
            );
        }

        let successMsg = <div></div>;
        if (this.state.showSubmissionSuccess) {
            successMsg = (
                <div className={formStyles.formConfirmation}>
                    <div className={formStyles.formConfirmationText} style={{textAlign: 'center'}}>
                        <Trans>Your feedback has been submitted!</Trans>
                    </div>
                </div>
            )
        }

        let feedbackContentClass :string = formStyles.formInput;
        let contentErrorMsg = <div></div>;
        if (this.state.showContentMissing) {
            feedbackContentClass = `${formStyles.formInput} ${formStyles.formInputError}`;
            contentErrorMsg = (
                <div className={formStyles.formInputErrorText} style={{marginBottom: 20}}>
                    <Trans>Description is required</Trans>
                </div>
            )
        }

        return (
            <div className={`${generalStyles.subContainer} ${generalStyles.infoPageStyle}`}>
                <div className={generalStyles.document}>
                    <ReactMarkdown source={this.state.document.content}/>

                    {successMsg}
                    {errorMsg}
                    <div className='form-group' style={{paddingTop:15}}>
                        <div className={generalStyles.booghText} style={{fontSize:16, marginRight:10, paddingBottom: 10}}>
                            <Trans>Send feedback</Trans>
                        </div>
                        <textarea value={this.state.feedbackContent} onChange={this.handleFeedbackChange}
                                  className={feedbackContentClass} id="usernameInput"
                                  style={{height:120, direction: 'rtl', borderRadius:8, padding: 10, border: '1px solid rgba(0,0,0,0.35)', fontSize: 15, resize: 'none'}}
                                  placeholder="انتقاد یا پیشنهادت را اینجا برای ما بنویس"/>
                    </div>


                    {contentErrorMsg}

                    <button
                        className={styles.helpButton}
                        type='submit'
                        onClick={this.submitFeedback}
                    >
                        <Trans>Submit feedback</Trans>
                    </button>
                </div>
            </div>
        )
    }

}
