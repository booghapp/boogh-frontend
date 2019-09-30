import * as React from 'react';
import { Row, Col, Modal} from 'react-bootstrap';
import { Report } from '../types';
import BooghApi from "../api/BooghApi";
import { ReportOptions } from "./ReportOptions";
import GoogleMap from "google-map-react";
import { RouteComponentProps } from "react-router-dom";
import config from '../config';
import ReportUpdateView from "./ReportUpdateView";
import {Trans} from "react-i18next";
import * as styles from "../css-modules/ReportView.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import { Comments } from "./Comments";
import { HonkView } from "./HonkView";

interface ReportProps extends RouteComponentProps {
    reportId: number;
}

type ReportState = {
    report: Report,
    content: Array<JSX.Element>,
    focusedImage: Array<JSX.Element>,
    src: string,
    showModal: boolean,
    currentImages: Array<string>,
    currentIndex: number,
    focusedMobileImage: JSX.Element,
    updateSection: JSX.Element,
    googleMap: JSX.Element,
    srcSets: Array<Array<string>>,
    currentSrcSets: Array<Array<string>>
}

export class ReportView extends React.Component<ReportProps, ReportState> {
    public constructor(props: ReportProps) {
        super(props);
        this.state = {
            report: {} as Report,
            content: [],
            focusedImage: [],
            src: '',
            showModal: false,
            currentImages: [],
            currentIndex: 0,
            focusedMobileImage: <div></div>,
            updateSection: <div></div>,
            googleMap: <div></div>,
            srcSets: [],
            currentSrcSets: []
        };
        this.notify = this.notify.bind(this);
        this.getReport = this.getReport.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handlePhotoChange = this.handlePhotoChange.bind(this);
        this.handlePhotoChangeForMobile = this.handlePhotoChangeForMobile.bind(this);
    }

    public componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        this.getReport();
    }

    private updateReport(report: Report) {
        this.props.history.push("/update", {report: report})
    }

    // Triggers the image dialog
    private handleShow(srcSets: Array<Array<string>>) {
        const img = (
            <img
                alt=""
                key={"report-photo"}
                srcSet={srcSets[0].join()}
                src={`${config.cloudFrontUrl}` + srcSets[0][0]}
                sizes="(max-width: 320px) 280px,
                      (max-width: 1024px) 440px,
                       800px"
            />
        );

        this.setState({
            showModal: true,
            currentSrcSets: srcSets,
            focusedImage: Array.of(img),
        });
    }

    private handleHide() {
        this.setState({ showModal: false, currentIndex: 0 });
    }

    private handlePhotoChangeForMobile() {
        let currentIndex : number = this.state.currentIndex;
        if (currentIndex != this.state.srcSets.length){
            currentIndex ++;
        } else {
            currentIndex = 0;
        }
        this.setState({currentIndex: currentIndex});

        if (currentIndex !== 0) {
            const img = (<img
                alt=""
                key={"report-photo"}
                style={{height: 180, maxWidth: '100%'}}
                srcSet={this.state.srcSets[currentIndex - 1].join()}
                src={`${config.cloudFrontUrl}` + this.state.srcSets[currentIndex - 1][2]}
                sizes="(max-width: 320px) 280px,
                      (max-width: 1024px) 440px,
                       800px"
            />);

            this.setState({focusedMobileImage: img});
        } else {
            let googleMap = this.state.googleMap;
            this.setState({focusedMobileImage: googleMap});
        }
    }

    private handlePhotoChange(direction : string) {
        let currentIndex : number = this.state.currentIndex;
        if (direction == "left" && currentIndex != 0) {
            currentIndex = currentIndex - 1;
        }else if (direction == "right" && currentIndex != this.state.currentSrcSets.length - 1){
            currentIndex = currentIndex + 1;
        }

        const img = (
            <img
                alt=""
                key={"report-photo"}
                srcSet={this.state.currentSrcSets[currentIndex].join()}
                src={`${config.cloudFrontUrl}` + this.state.currentSrcSets[currentIndex][0]}
                sizes="(max-width: 320px) 280px,
                      (max-width: 1024px) 440px,
                       800px"
            />
        );

        this.setState({
            currentIndex: currentIndex,
            focusedImage: Array.of(img)
        })
    }

    //Groups report images into srcSets
    private groupReportImages(reportImages: Array<string>): Array<Array<string>> {
        let srcSets = Array<Array<string>>();
        //Report images are made in 3 qualities
        for (let i = 0; i < reportImages.length / 3 ; i ++) {
            let srcSet :Array<string> = [];
            srcSet.push(`${config.cloudFrontUrl}` + reportImages[3*i] + " 320w");
            srcSet.push(`${config.cloudFrontUrl}` + reportImages[3*i + 1] + " 480w");
            srcSet.push(`${config.cloudFrontUrl}` + reportImages[3*i + 2] + " 640w");
            srcSets.push(srcSet);
        }
        return srcSets;
    }

    private getReport() {
        // Get report id from url
        let url : string = window.location.href;
        let idParam : string = "id=";
        let idParamIndex : number = url.indexOf(idParam);
        let reportId : number = parseInt(url.substr(idParamIndex + idParam.length));

        BooghApi.getReport(reportId).then((data)  => {
            let report : Report = data[0];
            let myData: Array<Report> = data;
            myData.shift();

            let updates = myData.map((data) => {
                let reportUpdateView : JSX.Element;
                if (myData.indexOf(data) == myData.length - 1) {
                    reportUpdateView = <ReportUpdateView key={data.id} update={data} boldTitle={true} showImages={this.handleShow} groupUpdateImages={this.groupReportImages}/>
                }else{
                    reportUpdateView =  <ReportUpdateView key={data.id}  update={data} boldTitle={false} showImages={this.handleShow} groupUpdateImages={this.groupReportImages}/>
                }
                return reportUpdateView;
            });

            let marker = (<MyMarker lat={report.latitude} lng={report.longitude} report={report}/>);

            let center = {lat: report.latitude, lng: report.longitude};

            let updateButton = <div></div>;
            if (report.currentUserReport) {
                updateButton = (
                    <button
                        className={styles.updateButton}
                        onClick={() => this.updateReport(report)}
                        type='button'
                    >
                        <Trans>Add update</Trans>
                    </button>
                )
            }

            this.setState({googleMap: (
                <GoogleMap
                    bootstrapURLKeys={{
                        key: config.googleMapsApiKey,
                    }}
                    zoom={12}
                    center={center}
                    options={createMapOptions}>
                    {marker}
                </GoogleMap>
                )
            });

            let updateSection = (
                <div>
                    {updates}
                    {updateButton}
                </div>
            );

            this.setState({
                report: report,
                updateSection: updateSection,
                focusedMobileImage: this.state.googleMap,
                srcSets: this.groupReportImages(report.images)
            });
        }).catch(err => {
            console.log(err);
        });
    }

    private notify(reportDeleted: boolean) {
        if (reportDeleted) {
            this.props.history.push("/explore")
        }
    }

    public render() {

        let url : string = window.location.href;
        let idParam : string = "id=";
        let idParamIndex : number = url.indexOf(idParam);
        let reportId : number = parseInt(url.substr(idParamIndex + idParam.length));

        let content;
        if (this.state.report.images != undefined) {
            let img = <div style={{height:180, backgroundColor: '#e0e2e5'}}></div>
            if (this.state.report.images.length != 0){
                img = (
                    <button className={generalStyles.borderNone} style={{padding:0}} onClick={() => this.handleShow(this.state.srcSets)}>
                        <img style={{height: 180, maxWidth: '100%'}}  src={`${config.cloudFrontUrl}` + this.state.report.images[0]} />
                    </button>
                )
            }
            let numOriginalPhotosPlusMap = this.state.srcSets.length + 1;
            content = (
                <div key={this.state.report.id}>
                    <div className={`${styles.reportViewDialog} ${generalStyles.rounded}`}>
                        <div className={styles.titleAndOptionsContainer} style={{display: 'inline-block'}}>
                            <div className={`${generalStyles.booghText} ${styles.reportTitle}`}>
                                {BooghApi.decodeHtml(this.state.report.title)}</div>
                            <ReportOptions
                                history={this.props.history}
                                isTopOptions={true}
                                notify={() => {}}
                                report={this.state.report}
                            />
                        </div>

                        <HonkView history={this.props.history} reportId={reportId}/>

                        <Row className={styles.reportViewRow}>
                            <Col md={6} xs={12} style={{padding: 0}}>
                                <div style={{height: 180, width: '100%'}}>
                                    {this.state.focusedMobileImage}
                                </div>
                            </Col>
                            <Col md={6} sm={0} className={styles.reportViewImgVisibility} style={{paddingRight: 0}}>
                                {img}
                            </Col>
                            <div className={styles.reportViewCover} onClick={this.handlePhotoChangeForMobile}>
                                <PhotoBar numPhotos={numOriginalPhotosPlusMap} currentIndex={this.state.currentIndex}/>
                            </div>
                        </Row>

                        <ReportOptions
                            history={this.props.history}
                            isTopOptions={false}
                            notify={this.notify}
                            report={this.state.report}
                        />
                    </div>
                    <div className={generalStyles.booghText} style={{marginTop: 20, marginBottom: 20}}>
                        {BooghApi.decodeHtml(this.state.report.description)}
                    </div>
                </div>
            )
        }

        let commentSection =  <Comments history={this.props.history} key={"comment-section"} reportId={reportId}/>;
        let numModalPhotos = this.state.currentSrcSets.length;
        return(
            <div className={generalStyles.componentContainer}>
                <div className={generalStyles.subContainer}>
                    {content}
                    {this.state.updateSection}
                    {commentSection}
                </div>
                <div style={{marginLeft: 'auto', marginRight: 'auto'}}>
                <Modal
                    show={this.state.showModal}
                    onHide={this.handleHide}
                    dialogClassName="modal-transparent"
                    aria-labelledby="example-custom-modal-styling-title">

                        <div style={{display: 'inline-block', paddingBottom: 50}}>
                            <button className={generalStyles.borderNone} onClick={() => this.handlePhotoChange("left")}>
                                <img src={require('../assets/chevron_icon.png')} className={`${styles.modalArrow} ${styles.flipArrow}`}/>
                            </button>
                        </div>
                        <div style={{display: 'inline-block'}}>
                            <Modal.Header closeButton>
                            </Modal.Header>
                            <Modal.Body>
                                {this.state.focusedImage}
                            </Modal.Body>
                        </div>
                        <div style={{display: 'inline-block'}}>
                            <button className={generalStyles.borderNone} onClick={() => this.handlePhotoChange("right")}>
                                <img src={require('../assets/chevron_icon.png')} className={styles.modalArrow}/>
                            </button>
                        </div>
                    <Row>
                        <Col>
                            <PhotoBar numPhotos={numModalPhotos} currentIndex={this.state.currentIndex}/>
                        </Col>
                    </Row>
                </Modal>
                </div>
            </div>
        )
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
type MyMarkerProps = {
    lat: number,
    lng: number,
    report: Report
}

type MyMarkerState = {
}

class MyMarker extends React.Component<MyMarkerProps, MyMarkerState>{

    constructor(props: MyMarkerProps){
        super(props);
    }

    render(){
        return(
            <div>
                <img src={require('../assets/location_indicator_icon.png')} style={{height:32, width:32}}/>
            </div>
        )
    }
}
function createMapOptions(maps) {
    return {
        mapTypeControl: false,
        disableDoubleClickZoom: true,
        scrollwheel: false,
        panControl: false,
        draggable: false,
        streetViewControl: false,
    }
}
