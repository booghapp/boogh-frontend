import * as React from 'react';
import BooghApi from "../api/BooghApi";
import {Comment, Report, User} from "../types";
import {CommentView} from "./CommentView";
import * as formStyles from "../css-modules/Form.module.css";
import * as commentStyles from "../css-modules/Comment.module.css";
import {Trans} from "react-i18next";
import {RouteComponentProps} from "react-router";
import {englishNumeralToPersianNumeral} from "../utils";

interface CommentsProps {
    history: RouteComponentProps['history'];
    reportId: number
}

interface CommentsState {
    comments: Array<any>,
    comment: string,
    commentCount: number,
    isCommentEmpty: boolean
}

export class Comments extends React.Component<CommentsProps, CommentsState> {

    constructor(props: CommentsProps) {
        super(props);
        this.state = {comments: [], comment: '', commentCount: 0, isCommentEmpty: false};

        this.refreshComments = this.refreshComments.bind(this);
        this.getComments = this.getComments.bind(this);
        this.constructComments = this.constructComments.bind(this);
        this.addReply = this.addReply.bind(this);
        this.handleCommentChange = this.handleCommentChange.bind(this);
        this.getCommentCount = this.getCommentCount.bind(this);
    }

    componentDidMount(): void {
        this.refreshComments();
    }

    refreshComments() {
        this.getCommentCount();
        this.getComments();
    }

    private getCommentCount() {
        BooghApi.getNumReportComments(this.props.reportId).then(count =>{
            this.setState({commentCount: count})
        }).catch(err => {
            console.log(err);
        })
    }

    private getComments() {

        let reportId = this.props.reportId;

        BooghApi.getReportComments(reportId).then(data => {

            let commentsContainer : Array<any> = [];
            let index;
            for(index = 0 ; index < data.length; index ++) {
                this.constructComments(commentsContainer, data[index], 0 );
            }
            this.setState({comments: commentsContainer});

        }).catch(err => {
            console.log(err);
        })
    }

    private constructComments(elem, data, offset) {
        let comment: Comment = data['comment'];
        let contentJSX: any[] = [];
        if (offset === 0) {
            contentJSX.push(<CommentView history={this.props.history} key={comment.id} comment={comment} offset={false} refreshComments={this.refreshComments}/>);

        } else {
            contentJSX.push(<CommentView history={this.props.history} key={comment.id} comment={comment} offset={true} refreshComments={this.refreshComments}/>);

        }
        elem.push(contentJSX);
        let children = data['children'];
        let index;

        for (index = 0; index < children.length; index++) {
            this.constructComments(contentJSX, children[index], offset + 1);
        }
    }

    private addReply(){
        if (BooghApi.getToken() !== "") {
            let comment = {} as Comment;
            comment.commenter = {} as User;
            comment.content = this.state.comment;
            comment.report = {} as Report;
            comment.report.id = this.props.reportId;

            BooghApi.submitComment(comment).then(() => {
                this.refreshComments();
                this.setState({comment: ''})
            }).catch(err => {
                console.log(err);
                let error: string = err.toString();
                if (error.includes("empty")) {
                    this.setState({isCommentEmpty: true});
                }
            })
        } else {
            this.props.history.push('/login');
        }
    }

    private handleCommentChange(event) {
        this.setState({comment: event.target.value});
    }

    render() {
        let commentInputClass = formStyles.formInput;
        let commentInputErrorMsg = <div></div>;
        if (this.state.isCommentEmpty) {
            commentInputClass = `${formStyles.formInputError} ${formStyles.formInput}`;
            commentInputErrorMsg = (
                <div className={formStyles.formInputErrorText} style={{marginTop:5}}>
                    <Trans>Comment cannot be empty</Trans>
                </div>
            );
        }

        let commentCount;
        if (this.state.commentCount !== 0) {
            commentCount = (
                <div style={{fontWeight: 'bold', marginTop: 20, fontFamily: 'Vazir'}}>
                    {englishNumeralToPersianNumeral(this.state.commentCount)} <Trans>comments</Trans>
                </div>
            );
        } else {
            commentCount = <div></div>
        }

        let commentSection = (
            <div style={{marginTop: 30}}>
                <input placeholder="نظرت را اینجا بنویس!" type="text" value={this.state.comment} onChange={this.handleCommentChange} className={commentInputClass}/>
                {commentInputErrorMsg}
                <button className={`${commentStyles.button}`} onClick={() => this.addReply()}>
                    <Trans>Post comment</Trans>
                </button>
                {commentCount}
            </div>
        );

        return (
            <div>
                {commentSection}
                {this.state.comments}
            </div>
        )
    }
}