import * as React from 'react';
import {Comment, Report, Reporter, User} from '../types';
import BooghApi from "../api/BooghApi";
import * as commentStyles from "../css-modules/Comment.module.css";
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import {Votes} from "./Votes";
import {Trans} from "react-i18next";
import {RouteComponentProps} from "react-router";
import {gregorianDateToJalaaliDate} from "../utils";

interface CommentProps {
    history: RouteComponentProps['history'];
    comment: Comment,
    offset: boolean,
    refreshComments: Function;
}

interface CommentState {
    showReply: boolean,
    children: Array<any>,
    reply: string,
    height: number,
    isCommentEmpty: boolean,
}

export class CommentView extends React.Component<CommentProps,CommentState> {

    constructor(props: CommentProps) {
        super(props);

        this.state = {showReply: false, children: [], reply: '', height: 0, isCommentEmpty: false};
        this.toggleReply = this.toggleReply.bind(this);
        this.addReply = this.addReply.bind(this);
        this.handleReplyChange = this.handleReplyChange.bind(this);
        this.handleCommentClose = this.handleCommentClose.bind(this);
        this.viewProfile = this.viewProfile.bind(this);
    }

    componentDidMount(): void {
    }

    toggleReply() {
        this.setState({showReply: !this.state.showReply})
    }

    addReply(){
        if (BooghApi.getToken() !== "") {
            let comment = {} as Comment;
            comment.parent = {} as Comment;
            comment.parent.id = this.props.comment.id;
            comment.commenter = {} as User;
            comment.content = this.state.reply;
            comment.report = {} as Report;
            comment.report.id = this.props.comment.report.id;

            BooghApi.submitComment(comment).then(() => {
                this.props.refreshComments();
                this.setState({showReply: false, reply: ''})
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

    handleReplyChange(event) {
        this.setState({reply: event.target.value});
    }

    handleCommentClose(event) {
        this.setState({showReply: false})
    }

    viewProfile(){
        let commenter: User = this.props.comment.commenter;
        this.props.history.push("/reporter", {reporterName: commenter.login, reporterId: commenter.id})
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

        let reply = <div style={{display: 'none'}}></div>

        if (this.state.showReply) {
            reply = (
                <div className={generalStyles.rounded} style={{display: 'block', marginTop: 30,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.15)', padding : 15}}>
                    <button className={generalStyles.borderNone} onClick={this.handleCommentClose} style={{float: 'left', paddingBottom: 10, fontSize: 30, color: 'gray'}}>
                        <img src={require('../assets/close.png')} style={{width: 13, height: 13, marginBottom: 5}}/>
                    </button>
                    <div className={generalStyles.booghText} style={{float: 'right', padding:10, fontWeight: 'bold', fontFamily: 'Vazir'}}>
                        <div style={{marginRight: 10, display: 'inline'}}>
                            {this.props.comment.commenter.login}
                        </div>
                        <Trans>Replying to </Trans>
                    </div>
                    <input placeholder="نظرت را اینجا بنویس!" type="text" value={this.state.reply} onChange={this.handleReplyChange} className={commentInputClass}/>
                    {commentInputErrorMsg}
                    <button className={commentStyles.button} onClick={() => this.addReply()}>
                        <Trans>Post reply</Trans>
                    </button>
                </div>
            )
        }

        let commentIndentation;
        let parentCommenter = "";
        if (this.props.offset) {
            commentIndentation = 20;
            let parent = this.props.comment.parent;
            if (parent !== undefined) {
                parentCommenter = "@" + parent.commenter.login + " ";
            }
        }else {
            commentIndentation = 0;
        }

        let jalaaliDate = gregorianDateToJalaaliDate(this.props.comment.date || "");

        return (
            <div>
                <div style={{marginRight: commentIndentation, marginTop: 20}}>
                    <div className={commentStyles.container}>
                        <div className={commentStyles.commenter} onClick={this.viewProfile}>
                            {this.props.comment.commenter.login}
                        </div>
                        <div style={{overflow: 'wrap'}}>
                            <div className={commentStyles.content}>
                                {parentCommenter}
                                {BooghApi.decodeHtml(this.props.comment.content)}
                            </div>
                        </div>
                        <div style={{marginTop:8}}>
                            <div className={commentStyles.date}>
                                {jalaaliDate}
                            </div>
                            <button onClick={this.toggleReply} className= {commentStyles.reply}>
                                <Trans>Reply</Trans>
                            </button>
                        </div>
                    </div>
                    <div className={commentStyles.voteContainer}>
                        <Votes history={this.props.history} key={this.props.comment.id + "-v"} commentId={this.props.comment.id || -1}/>
                    </div>
                </div>
                {reply}
            </div>

        )
    }
}