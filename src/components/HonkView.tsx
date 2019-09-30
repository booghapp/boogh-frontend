import * as React from 'react';
import BooghApi from "../api/BooghApi";
import { Report, Honk } from "../types";
import * as styles from "../css-modules/Honk.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import {RouteComponentProps} from "react-router";
import {Trans} from "react-i18next";
import {englishNumeralToPersianNumeral} from "../utils";

interface HonkViewProps {
    history: RouteComponentProps['history'];
    reportId: number
}

interface HonkViewState {
    previousHonk: boolean,
    numHonks: number
}

export class HonkView extends React.Component<HonkViewProps, HonkViewState> {

    constructor(props: HonkViewProps) {
        super(props);
        this.state = {previousHonk: false, numHonks: 0};

        this.getUserHonkForReport = this.getUserHonkForReport.bind(this);
        this.getNumHonksForReport = this.getNumHonksForReport.bind(this);
        this.addHonkForReport = this.addHonkForReport.bind(this);
    }

    componentDidMount(): void {
        this.getUserHonkForReport();
        this.getNumHonksForReport();
    }

    getNumHonksForReport() {
        BooghApi.getNumHonksForReport(this.props.reportId).then((data : number) => {
            this.setState({numHonks: data});
        }).catch(err => {
            console.log(err);
        })
    }

    getUserHonkForReport() {
        BooghApi.getUserHonkForReport(this.props.reportId).then( (data : boolean) => {
            this.setState({previousHonk: data});
        }).catch(err => {
            console.log(err);
        });
    }

    addHonkForReport() {
        if (BooghApi.getToken() !== "") {
            let report: Report = {} as Report;
            report.id = this.props.reportId;

            let honk: Honk = {} as Honk;
            honk.honked = !this.state.previousHonk;
            honk.report = report;

            BooghApi.addHonkForReport(honk).then(data => {
                this.getNumHonksForReport();
                this.getUserHonkForReport();
            }).catch(err => {
                console.log(err);
            });
        } else {
            this.props.history.push('/login');
        }
    }

    render() {
        let honkBackground;
        let honkSrc;
        if (this.state.previousHonk) {
            honkBackground = styles.honkActive;
            honkSrc = require('../assets/honk_active.png');
        } else {
            honkBackground = styles.honkInactive;
            honkSrc = require('../assets/honk.png');
        }

        return (
            <div style={{display: 'inline-block'}} className={generalStyles.tooltip}>

                <button className={`${honkBackground} ${generalStyles.borderNone}`}
                    onClick={() => {this.addHonkForReport()}}>
                    <img src={honkSrc} style={{height: 23, width: 23, margin: 3}}/>
                </button>

                <span className={generalStyles.tooltiptext}>
                    <Trans>To support this issue, honk!</Trans>
                </span>

                <div style={{textAlign: 'center', fontFamily: 'Vazir'}}>
                    {englishNumeralToPersianNumeral(this.state.numHonks)}
                </div>

            </div>
        )
    }
}