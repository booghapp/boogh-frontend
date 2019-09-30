import * as React from 'react';
import { ReportDialog } from "./ReportDialog";
import { SubmittedSideBar } from "./SubmittedSideBar";
import { FavoritedSideBar } from "./FavoritedSideBar";
import {Report} from '../types';
import BooghApi from "../api/BooghApi";
import { RouteComponentProps } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import * as styles from "../css-modules/Feed.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import {FarsiPaginate} from "./FarsiPagination";

type FeedState = {
    reports: Array<JSX.Element>,
    refresh: boolean,
    currentPage: number,
    pageCount: number,
}

export class Feed extends React.Component<RouteComponentProps, FeedState> {
    constructor(props: RouteComponentProps){
        super(props);
        this.state = {
            reports: [],
            refresh: false,
            currentPage: 0,
            pageCount: 1,
        };
        this.getAllReports = this.getAllReports.bind(this);
        this.getNumReportPages = this.getNumReportPages.bind(this);
        this.notify = this.notify.bind(this);
    }

    notify() {
        this.setState({refresh: !this.state.refresh});
    }

    componentDidUpdate(prevProps: Readonly<RouteComponentProps>, prevState: Readonly<FeedState>, snapshot?: any): void {
        if (prevState.refresh !== this.state.refresh) {
            this.getAllReports();
            this.getNumReportPages();
        }
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    componentDidMount() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        this.getNumReportPages();
        this.getAllReports();
    }

    getAllReports(){
        BooghApi.getAllReports(this.state.currentPage).then(data => {
            let reports = data.map((data: Report) => {
                return(
                    <div key={data.id} className={styles.feedReport}>
                        <ReportDialog history={this.props.history} notify={this.notify} report={data}/>
                    </div>
                )
            });
            this.setState({reports:reports});
        }).catch(err =>{
            console.log(err);
        })
    }

    getNumReportPages() {
        BooghApi.getNumReportPages().then(data => {
            this.setState({pageCount: data});
        }).catch(err => {
            console.log(err);
        })
    }

    handlePageClick = data => {
        this.setState({currentPage: data},
            this.getAllReports);
    }

    render() {
        let submittedSideBar = <div></div>;
        let favoritedSideBar = <div></div>;
        if (BooghApi.getToken() != "") {
            submittedSideBar = (
                <div>
                    <SubmittedSideBar history={this.props.history} refresh={this.state.refresh}/>
                </div>
            );
            favoritedSideBar = (
                <div>
                    <FavoritedSideBar history={this.props.history} refresh={this.state.refresh}/>
                </div>
            )
        }

        return (
            <div className={generalStyles.componentContainer} style={{overflow: 'hidden'}}>
                <div className={styles.sideSection}>
                    {submittedSideBar}
                    <div style={{padding: 10}}></div>
                    {favoritedSideBar}
                </div>

                {this.state.reports}

                <div className={styles.reactPaginationContainer}>
                    <FarsiPaginate pageCount={this.state.pageCount}
                                   previousLabel={"قبلی"} nextLabel={"بعدی"}
                                   onPageChange={this.handlePageClick}/>
                </div>
            </div>
        )
    }
}