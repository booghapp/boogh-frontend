import * as React from 'react';

export interface Report {
    id?: number;
    type: string;
    title: string;
    description: string;
    date: string;
    state: string;
    reporter: User;
    latitude: number;
    longitude: number;
    anonymous: boolean;
    parent?: Report;
    favoritedByCurrentUser?: boolean;
    currentUserReport?: boolean;
    images: Array<string>;
}

export interface User {
    activated: string;
    authorities: Array<string>;
    id: number;
    login: string;
    email: string;
}

export interface Reporter {
    id: number;
    about: string;
    karma: number;
    location: string;
    user: User;
    notificationsOn: boolean;
}

export interface ReportStatus {
    id?: number;
    saved: ReportStatusState;
    flagged?: ReportStatusState;
    report: Report;
    reporter: User;
}

export enum ReportStatusState {
    UNSET ='UNSET',
    TRUE = 'TRUE',
    FALSE ='FALSE'
}

export interface Comment {
    commenter: User;
    content: string;
    date?: string;
    report: Report;
    id?: number;
    parent?: Comment;
}

export interface Vote {
    vote: number,
    voter: User,
    comment: Comment
}

export interface Honk {
    honked: boolean,
    report: Report,
    user: User
}

export interface Document {
    type: string,
    content: string
}

export interface QA {
    id: number,
    question: string,
    answer: string,
    order: number
}

export interface Feedback {
    content: string,
    date: string,
}