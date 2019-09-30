import * as React from "react";
import * as styles from "../css-modules/FarsiPagination.module.css";
import {englishNumeralToPersianNumeral} from "../utils";

interface FarsiPaginateProps {
    pageCount: number;
    previousLabel: string;
    nextLabel: string;
    onPageChange: any;
}

interface FarsiPaginateState {
    currentPage: number;
}

export class FarsiPaginate extends React.Component<FarsiPaginateProps, FarsiPaginateState> {

    constructor(props: FarsiPaginateProps) {
        super(props);
        this.state = {currentPage: 1};
        this.constructPaginateValues = this.constructPaginateValues.bind(this);
        this.pageNumberClick = this.pageNumberClick.bind(this);
        this.nextClick = this.nextClick.bind(this);
        this.prevClick = this.prevClick.bind(this);
    }

    constructPaginateValues() : Array<any>{
        let start = 1;
        let end = this.props.pageCount;
        let current = this.state.currentPage;
        let paginateValues = new Array();
        let startDiff = current - start;
        let endDiff = end - current;
        if (startDiff <= 2 && endDiff <= 2) {
            //Case 1
            let valueToAdd = 1;
            while (valueToAdd < end + 1) {
                paginateValues.push(valueToAdd);
                valueToAdd ++;
            }
            return paginateValues;
        }
        if (startDiff > 2 && endDiff > 2) {
            //Case 2
            paginateValues.push(start);
            paginateValues.push("...");
            paginateValues.push(current - 1);
            paginateValues.push(current);
            paginateValues.push(current + 1);
            paginateValues.push("...");
            paginateValues.push(end);
            return paginateValues;
        }
        if (startDiff > 2) {
            //Case 3
            paginateValues.push(start);
            paginateValues.push("...");
            paginateValues.push(current - 1);
            paginateValues.push(current);
            if (current !== end) {
                paginateValues.push(current + 1);
            }
            if (current + 1 !== end && current !== end) {
                paginateValues.push(end);
            }
        }
        if (endDiff > 2) {
            //Case 4
            if (start !== current) {
                paginateValues.push(start);
            }
            if (start !== current - 1 && start !== current) {
                paginateValues.push(current - 1);
            }
            paginateValues.push(current);
            paginateValues.push(current + 1);
            paginateValues.push("...");
            paginateValues.push(end);
            return paginateValues;
        }
        return paginateValues;
    }

    pageNumberClick(value) {
        if (value !== "...") {
            this.setState({currentPage: value});
            this.props.onPageChange(value - 1);
        }
    }

    nextClick() {
        if (this.state.currentPage !== this.props.pageCount) {
            let pageNumber = this.state.currentPage + 1;
            this.setState({currentPage: pageNumber}, this.props.onPageChange(pageNumber - 1));

        }
    }

    prevClick() {
        if (this.state.currentPage !== 1) {
            let pageNumber = this.state.currentPage - 1;
            this.setState({currentPage: pageNumber}, this.props.onPageChange(pageNumber - 1));
        }
    }

    render() {
        let paginateValues = this.constructPaginateValues();
        let paginateJSX = (
            paginateValues.map(value => {
                let farsiValue = value;
                if (value !== "...") {
                    farsiValue = englishNumeralToPersianNumeral(value);
                }
                let valueStyleClass = styles.paginationElement;
                if (value === this.state.currentPage) {
                    valueStyleClass = styles.pageNumberActive;
                }
                return <a className={valueStyleClass} onClick={() => this.pageNumberClick(value)}>{farsiValue}</a>
            })
        );
        return (
            <div style={{direction: 'rtl', marginBottom: 10}}>
                <div className={styles.paginationElement} onClick={this.prevClick}>{this.props.previousLabel}</div>
                {paginateJSX}
                <div className={styles.paginationElement} onClick={this.nextClick}>{this.props.nextLabel}</div>
            </div>
        )
    }
}