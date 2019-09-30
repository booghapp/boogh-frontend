import * as React from 'react';
import { Report } from "../types";
import { Row, Col } from 'react-bootstrap';
import config from "../config";
import * as reportOptionStyles from "../css-modules/ReportOptions.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import * as styles from "../css-modules/ReportUpdateView.module.css";
import {Trans} from "react-i18next";
import BooghApi from "../api/BooghApi";
import {gregorianDateToJalaaliDate} from "../utils";


type ReportUpdateViewProps = {
    update: Report,
    boldTitle: boolean,
    showImages: Function,
    groupUpdateImages: Function,
}

type ReportUpdateViewState = {
    focusedMobileImage: JSX.Element,
    currentIndex: number,
    srcSets: Array<Array<string>>
}

class ReportUpdateView extends React.Component<ReportUpdateViewProps, ReportUpdateViewState> {

    constructor(props: ReportUpdateViewProps){
        super(props);
        this.state = {
            focusedMobileImage: <div></div>,
            currentIndex: 0,
            srcSets: []
        };
        this.handlePhotoChangeForMobile = this.handlePhotoChangeForMobile.bind(this);
    }

    componentDidMount(): void {
        this.setState({
            srcSets: this.props.groupUpdateImages(this.props.update.images)
        });

        if (this.props.update.images.length > 0) {
            this.setState({
                focusedMobileImage: (
                    <img
                        alt=""
                        key={"report-update-photo"}
                        style={{height: 180, maxWidth: '100%'}}
                        src={`${config.cloudFrontUrl}` + this.props.update.images[0]}
                    />
                )
            })
        }
    }

    handlePhotoChangeForMobile() {
        let currentIndex = this.state.currentIndex;
        if (currentIndex != this.state.srcSets.length - 1) {
            currentIndex ++;
        } else {
            currentIndex = 0;
        }
        let focusedMobileImage = (
            <img
                alt=""
                key={"report-update-photo"}
                style={{height: 180, maxWidth: '100%'}}
                srcSet={this.state.srcSets[currentIndex].join()}
                src={`${config.cloudFrontUrl}` + this.state.srcSets[currentIndex][2]}
                sizes="(max-width: 320px) 280px,
                      (max-width: 1024px) 440px,
                       800px"
            />
        );
        this.setState({
            currentIndex: currentIndex,
            focusedMobileImage: focusedMobileImage
        });
    }

    render(){
        let update : Report = this.props.update;
        let reportDateStyle;
        if (this.props.boldTitle){
            reportDateStyle = styles.boldTitle;
        }else{
            reportDateStyle = styles.title;
        }

        let updateJalaliDate = gregorianDateToJalaaliDate(update.date);


        let updateStatus;
        if (update.state == 'APPROVED') {
            updateStatus = generalStyles.approved;
        } else if (update.state == 'PENDING') {
            updateStatus = generalStyles.pending;
        } else {
            updateStatus = generalStyles.rejected;
        }

        let img = <div style={{height:180, backgroundColor: '#e0e2e5'}}></div>
        if (this.props.update.images.length != 0){
            img = (
                <button className={generalStyles.borderNone} onClick={() => this.props.showImages(this.state.srcSets)}>
                    {this.state.focusedMobileImage}
                </button>
            )
        }
        let reportState: string = update.state.substr(0, 1) + update.state.substr(1).toLocaleLowerCase();

        return (
            <div key={update.id}>
                <hr className={generalStyles.titleHr}/>
                <div style={{padding: 5, display: 'inline', position: 'relative'}}>
                    <div className={reportOptionStyles.option} style={{marginRight: 5}}>
                        <Trans>{reportState}</Trans>
                    </div>
                    <div className={`${reportOptionStyles.statusCircle} ${updateStatus}`}></div>
                    <div className={`${generalStyles.booghText} ${reportDateStyle}`}>
                        <Trans>Updated</Trans>
                        {" " + updateJalaliDate}</div>
                    <Row style={{position: 'relative', margin: 0}}>
                        <Col style={{paddingRight:0, paddingLeft: 0}} md={6} xs={12}>

                        </Col>
                        <Col style={{paddingRight:0, paddingLeft: 0}} md={6} xs={12}>
                            {img}
                        </Col>
                        <div className={styles.reportViewCover} onClick={this.handlePhotoChangeForMobile}>
                            <PhotoBar numPhotos={this.state.srcSets.length} currentIndex={this.state.currentIndex}/>
                        </div>
                    </Row>
                    <div className={generalStyles.booghText} style={{marginTop: 20}}>
                        {BooghApi.decodeHtml(update.description)}
                    </div>
                </div>
            </div>
        );
    }
}

type PhotoBarProps = {
    numPhotos: number,
    currentIndex: number
}

class PhotoBar extends React.Component<PhotoBarProps>{
    constructor(props: PhotoBarProps){
        super(props);
    }

    render(){
        const circleNonActive = {marginRight:5, marginLeft:5, border: '1px solid white', backgroundColor:'white', display:'inline-block'};
        const circleActive = {marginRight:5, marginLeft:5, border: '1px solid #FDCB40', backgroundColor:'#FDCB40', display:'inline-block'};


        let dots = Array<JSX.Element>();
        for (let i = 0; i < this.props.numPhotos; i++){
            let circle :JSX.Element;
            if(i == this.props.currentIndex){
                circle = (<div key={i} className={generalStyles.statusCircle} style={circleActive}></div>)
            }else{
                circle = (<div key={i} className={generalStyles.statusCircle} style={circleNonActive}></div>)
            }
            dots.push(circle)
        }
        return(
            <div className={styles.photobar}>
                {dots}
            </div>
        )
    }
}

export default ReportUpdateView;
