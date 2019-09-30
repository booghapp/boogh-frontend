import * as React from 'react';
import BooghApi from "../api/BooghApi";
import {User, Vote, Comment} from "../types";
import * as generalStyles from "../css-modules/General.module.css";
import * as styles from "../css-modules/Vote.module.css";
import {RouteComponentProps} from "react-router";
import {englishNumeralToPersianNumeral} from "../utils";

interface VotesProps {
    history: RouteComponentProps['history'];
    commentId: number
}

interface VotesState {
    votes: number,
    previousVote: number
}

export class Votes extends React.Component<VotesProps, VotesState> {

    constructor(props: VotesProps) {
        super(props);
        this.state = {votes: 0, previousVote: 0};
        this.getCommentVotes = this.getCommentVotes.bind(this);
        this.getUserVote = this.getUserVote.bind(this);
        this.submitVote = this.submitVote.bind(this);
    }

    componentDidMount(): void {
        this.getCommentVotes();
        this.getUserVote();
    }

    private getCommentVotes() {

        BooghApi.getCommentVotes(this.props.commentId).then(data =>{
            let numVotes = isNaN(parseInt(data)) ? 0 : parseInt(data);
            this.setState({votes: numVotes})
        }).catch( err => {
            console.log(err);
        })
    }

    private getUserVote() {

        BooghApi.getUserVote(this.props.commentId).then( data => {
            if (data.length > 0) {
                let vote : Vote = data[0];
                this.setState({previousVote: vote.vote});
            }
        }).catch(err => {
            console.log(err);
        })
    }

    private submitVote(value: number) {
        if (BooghApi.getToken() !== "") {
            let vote: Vote = {} as Vote;
            vote.comment = {} as Comment;
            vote.comment.id = this.props.commentId;
            vote.vote = value;
            vote.voter = {} as User;

            BooghApi.submitVote(vote).then(data => {
                this.getCommentVotes();
                this.getUserVote();
            }).catch(err => {
                console.log(err);
            })
        } else {
            this.props.history.push('/login');
        }
    }

    render() {

        let upStyle = {};
        let downStyle = {};
        if (this.state.previousVote == 1) {
            upStyle = styles.active;
            downStyle = styles.inActive;

        } else if (this.state.previousVote == -1) {
            upStyle = styles.inActive;
            downStyle = styles.active;

        } else {
            upStyle = styles.inActive;
            downStyle = styles.inActive;
        }

        return (
            <div className={styles.container}>
                <button className={generalStyles.borderNone} onClick={() => this.submitVote(1)}>
                    <div className={`${styles.upArrow} ${upStyle}`} ></div>
                </button>
                <div style={{fontFamily: 'Vazir'}}>
                    {englishNumeralToPersianNumeral(this.state.votes)}
                </div>
                <button className={generalStyles.borderNone} onClick={() => this.submitVote(-1)}>
                    <div className={`${styles.downArrow} ${downStyle}`}></div>
                </button>
            </div>
        )
    }
}