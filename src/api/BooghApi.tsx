/* eslint-disable quote-props */

import {Report, Reporter, ReportStatus, User, Comment, Vote, Honk, Feedback} from '../types';

import config from '../config';

export default class BooghApi {

    public static decodeHtml(html :string) {
        let txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    public static getToken() : string {
        return sessionStorage.getItem("token") || "";
    }

    public static getUserId(): string {
        return sessionStorage.getItem("userId") || "";
    }

    public static handleApiErrors(response: Response) {
        if (response.ok) {
            return response.json();
        }else{
            let error = response.headers.get("X-booghApp-error");
            if (error != null){
                throw new Error(error);
            } else {
                throw new Error("connection interrupted");
            }
        }
    }

    public static async getUserFavoritedReports() {
        return fetch(
            `${config.apiURL}/report-statuses?reporterId.equals=${this.getUserId()}&saved.equals=TRUE`,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',
            },
        ).then(this.handleApiErrors);
    }

    public static async getUserApprovedReports(reporterId: string = this.getUserId()) {
        return fetch(
            `${config.apiURL}/reports?reporterId.equals=${reporterId}&state.equals=APPROVED`,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',
            },
        ).then(this.handleApiErrors);
    }

    public static async getUserPendingReports() {
        return fetch(
            `${config.apiURL}/reports?reporterId.equals=${this.getUserId()}&state.equals=PENDING`,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',
            },
        ).then(this.handleApiErrors);
    }

    public static async getUserReports() {
        return fetch(`${config.apiURL}/reports?reporterId.equals=${this.getUserId()}`, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async getReport(reportId: number) {
        return fetch(`${config.apiURL}/reports/${reportId}`, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async getAllReports(page: number) {
        return fetch(`${config.apiURL}/reports/sorted?page=` + page, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async getReportsWithinGeometry(
        bounds: {[key: string]: any}, // TODO: bounds object should be typed
    ) {
        return fetch(
            `${config.apiURL}/reports`
                + `?west=${bounds.sw.lng}`
                + `&south=${bounds.sw.lat}`
                + `&east=${bounds.ne.lng}`
                + `&north=${bounds.ne.lat}`,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',
            },
        ).then(this.handleApiErrors);
    }

    public static async getReportComments(reportId: number) {
        return fetch(`${config.apiURL}/comments?reportId.equals=`+reportId, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async getNumReportComments(reportId: number) {
        return fetch(`${config.apiURL}/comments/count?reportId.equals=`+reportId, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async getCommentVotes(commentId: number) {
        return fetch(`${config.apiURL}/votes?commentId=`+ commentId, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then((response) => {
            if (response.ok){
                return response.text();
            }
            throw new Error(response.statusText);
        });
    }

    public static async getUserVote(commentId: number){
        return fetch(`${config.apiURL}/votes?commentId.equals=`+commentId + '&voterId.equals=' + this.getUserId(), {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async submitVote(vote: Vote) {
        let user = {} as User;
        user.id = parseInt(this.getUserId());
        vote.voter.id = user.id;
        return fetch(
            `${config.apiURL}/votes`,
            {
                body: JSON.stringify(vote),
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            },
        ).then(this.handleApiErrors);
    }

    public static async submitComment(comment: Comment) {
        let user = {} as User;
        user.id = parseInt(this.getUserId());
        comment.commenter.id = user.id;
        return fetch(
            `${config.apiURL}/comments`,
            {
                body: JSON.stringify(comment),
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            },
        ).then(this.handleApiErrors);

    }

    public static async submitReport(report: Report) {
        let user = {} as User;
        user.id = parseInt(this.getUserId());
        report.reporter = user;
        return fetch(
            `${config.apiURL}/reports`,
            {
                body: JSON.stringify(report),
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            },
        ).then(this.handleApiErrors);
    }

    public static async favoriteReport(reportStatus: ReportStatus) {
        return this.submitReportStatus(reportStatus);
    }

    public static async flagReport(reportStatus: ReportStatus) {
        return this.submitReportStatus(reportStatus);
    }

    public static async submitReportStatus(reportStatus: ReportStatus) {
        let user = {} as User;
        user.id = parseInt(this.getUserId());
        reportStatus.reporter = user;
        return fetch(
            `${config.apiURL}/report-statuses`,
            {
                body: JSON.stringify(reportStatus),
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                }),
                method: 'POST',
            },
        )
            .then(this.handleApiErrors);
    }

    public static async getUserFlagForReport(reportId: number) {
        return fetch(`${config.apiURL}/report-statuses?reporterId.equals=${this.getUserId()}&reportId.equals=${reportId}`, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async getReporterSettings() {
        return fetch(`${config.apiURL}/reporters/${this.getUserId()}`, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'get',
        }).then(this.handleApiErrors);
    }

    public static async changeReporterSettings(reporter: Reporter){
        reporter.user = {} as User;
        reporter.user.id = parseInt(this.getUserId());
        fetch(`${config.apiURL}/reporters`, {
            body: JSON.stringify({
                about: reporter.about,
                id: reporter.id,
                karma: reporter.karma,
                location: reporter.location,
                moderator: false,
                notificationsOn: reporter.notificationsOn,
                user: reporter.user,
                visibility: false,
            }),
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
                'Content-Type': 'application/json',
            }),
            method: 'put',
        }).then(this.handleApiErrors);
    }

    public static async changeUserSettings(reporter: Reporter) {
        return fetch(`${config.apiURL}/users`, {
            body: JSON.stringify({
                activated: true,
                authorities: ['ROLE_USER'],
                email: reporter.user.email,
                id: this.getUserId(),
                login: reporter.user.login,
            }),
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
                'Content-Type': 'application/json',
            }),
            method: 'put',
        }).then(this.handleApiErrors);
    }

    public static async loginUser(email: string, password: string) {
        return fetch(`${config.apiURL}/authenticate`, {
            body: JSON.stringify({
                password,
                rememberMe: false,
                username: email,
            }),
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }).then((response) => {
            if (response.ok) {
                return {
                    'userId': response.headers.get('userId'),
                    'body': response.json(),
                };
            }
            throw new Error(response.statusText);
        });
    }

    public static async signUpUser(displayName: string, email: string, password: string) {
        return fetch(`${config.apiURL}/register`, {
            body: JSON.stringify({
                email: email,
                login: displayName,
                password: password,
            }),
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }).then((response) => {
            if (!response.ok) {
                let error = response.headers.get("X-booghApp-error");
                if (error != null){
                    throw new Error(error);
                }
            }
        });
    }

    public static async changePassword(currentPassword: string, newPassword: string) {
        return fetch(`${config.apiURL}/account/change-password`, {
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',

        })
    }

    public static async sendResetPasswordEmail(email: string) {
        return fetch(`${config.apiURL}/account/reset-password/init`, {
            body: JSON.stringify({
                email,
            }),
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'post',
        }).then((response) => {
            if (!response.ok) {
                throw new Error();
            }
        });
    }

    public static async resetPassword(key: string, newPassword: string) {
        return fetch(`${config.apiURL}/account/reset-password/finish`, {
            body: JSON.stringify({
                key,
                newPassword,
            }),
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'post',
        }).then((response) => {
            if (!response.ok) {
                throw new Error();
            }
        });
    }

    public static async activateAccount(activationCode: string) {
        return fetch(`${config.apiURL}/activate?key=` + activationCode, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'get',
        }).then((response) => {
            if (!response.ok) {
                throw new Error();
            }
        });
    }

    public static async deleteReport(reportId: number) {
        return fetch(`${config.apiURL}/reports/${reportId}`, {
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            }),
            method: 'delete',
        })
    }

    public static async getUserHonkForReport(reportId: number) {
        return fetch(
            `${config.apiURL}/honks?userId=${this.getUserId()}&reportId=` + reportId,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',

            },
        ).then(this.handleApiErrors);
    }

    public static async getNumHonksForReport(reportId: number) {
        return fetch(
            `${config.apiURL}/honks?reportId=` + reportId,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',

            },
        ).then(this.handleApiErrors);
    }

    public static async addHonkForReport(honk: Honk) {
        let user = {} as User;
        user.id = parseInt(this.getUserId());
        honk.user = user;
        return fetch(
            `${config.apiURL}/honks`,
            {
                body: JSON.stringify(honk),
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                }),
                method: 'POST',
            },
        )
            .then(this.handleApiErrors);
    }

    public static async getDocumentOfType(type: string) {
        return fetch(
            `${config.apiURL}/documents/` + type,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',

            },
        ).then(this.handleApiErrors);
    }

    public static async getQAs() {
        return fetch(
            `${config.apiURL}/qas`,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',

            },
        ).then(this.handleApiErrors);
    }

    public static async getNumReportPages() {
        return fetch(
            `${config.apiURL}/reports/pages`,
            {
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                }),
                method: 'get',

            },
        ).then(this.handleApiErrors);
    }

    public static async submitFeedback(feedback: Feedback) {
        return fetch(`${config.apiURL}/feedbacks`, {
            body: JSON.stringify(feedback),
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'post',
        }).then(this.handleApiErrors)
    }

    /* Twitter authentication methods */

    public static async askForRequestToken() {
        return fetch(`${config.apiURL}/social/twitter/request_token?redirectUri=${encodeURIComponent(config.socialLoginRedirect)}`, {
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'get',
        }).then(res => {
            return res.text();
        })
    }

    public static async redirectToTwitter(oauthToken : string) {
        window.location.assign("https://api.twitter.com/oauth/authorize?oauth_token="  +  oauthToken);
    }

    public static async sendVerificationCode(oauthVerifier: string, oauthToken: string) {
        return fetch(`${config.apiURL}/social/twitter?verifier=` + oauthVerifier + "&token=" + oauthToken +
            `&redirectUri=${encodeURIComponent(config.socialLoginRedirect)}`, {
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'post',
        }).then((response) => {
            if (response.ok) {
                return {
                    'userId': response.headers.get('userId'),
                    'body': response.json(),
                };
            }

            throw new Error(response.statusText);
        });
    }

    /* Google authentication methods */

    public static async redirectToGoogle(event: any) {
        event.preventDefault();
        let domain = config.socialLoginRedirect.substr(0 , config.socialLoginRedirect.length - 6);
        window.location.assign("https://accounts.google.com/o/oauth2/auth?redirect_uri=" + encodeURIComponent(config.socialLoginRedirect) +
            "&response_type=code&scope=email%20profile%20openid&openid.realm=&client_id=" + encodeURIComponent(config.googleClientId) +
            "&ss_domain=" + encodeURIComponent(domain) + "&prompt=&gsiwebsdk=2");

    }

    public static async verifyGoogleUser(code: string) {
        return fetch(`${config.apiURL}/social/google?code=` + code + `&redirectUri=${encodeURIComponent(config.socialLoginRedirect)}`, {
            headers : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'post',
        }).then((response) => {
            if (response.ok) {
                return {
                    'userId': response.headers.get('userId'),
                    'body': response.json(),
                };
            }

            throw new Error(response.statusText);
        });
    }

    /* Telegram authentication methods */

    public static async verifyTelegramUser(id: number, first_name: string, last_name: string, username: string, photo_url: string, auth_date: number, hash: string) {
        return fetch(`${config.apiURL}/social/telegram?id=` + id + `&first_name=` + first_name + `&last_name=` + last_name +  `&username=`
                                                                  + username + `&photo_url=` + photo_url +`&auth_date=` + auth_date + `&hash=` + hash, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'post',
        }).then((response) => {
            if (response.ok) {
                return {
                    'userId': response.headers.get('userId'),
                    'memCache': response.headers.get('telegram-hash'),
                    'body': response.json(),
                };
            }

            throw new Error(response.statusText);
        });
    }

    public static async displayTelegramStartButton(memCache: string) {
        window.open(`https://telegram.me/${config.telegramBotName}?start=` + memCache);
    }
}
