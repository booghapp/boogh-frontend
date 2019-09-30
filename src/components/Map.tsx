/* eslint-disable react/no-multi-comp */

import * as React from 'react';
import GoogleMapReact, { MapOptions, Maps } from 'google-map-react';
import { fitBounds } from 'google-map-react/utils';
import Geosuggest from 'react-geosuggest';
import { Suggest } from 'react-geosuggest';
import { Col, Row} from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import BooghApi from '../api/BooghApi';
import config from '../config';
import { Report, ReportStatus, ReportStatusState, User } from '../types';
import {
    englishNumeralToPersianNumeral,
    getDefaultGoogleMapOptions,
    gregorianDateToJalaaliDate,
    truncateReportTitle
} from '../utils';
import * as styles from '../css-modules/Map.module.css';
import * as generalStyles from '../css-modules/General.module.css';

interface MapProps extends RouteComponentProps {
    forHomePage: boolean;
    setFooterView: Function;
    refresh: boolean;
}

interface MapState {
    bounds: object;
    groupedMarkers: Array<JSX.Element>;
    markers: Array<JSX.Element>;
    markerInfos: Array<JSX.Element>;
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
}

export class Map extends React.Component<MapProps, MapState> {
    mapHeight;
    MAX_MAP_HEIGHT: number = 800;
    APP_FRAME_WIDTH: number = 1024;
    NAV_BAR_HEIGHT: number = 134;

    constructor(props: MapProps) {
        super(props);

        this.createGoogleMapOptions = this.createGoogleMapOptions.bind(this);
    }

    private createGoogleMapOptions(maps: Maps): MapOptions {
        const defaultGoogleMapOptions = getDefaultGoogleMapOptions(maps);

        let disableDoubleClickZoom =  false;
        let panControl, dragable, scrollwheel = true;
        if (this.props.forHomePage) {
            disableDoubleClickZoom = true;
            scrollwheel = true;
            panControl = false;
            dragable = false;
        }

        return {
            ...defaultGoogleMapOptions,
            disableDoubleClickZoom: disableDoubleClickZoom,
            scrollwheel: scrollwheel,
            panControl: panControl,
            draggable : dragable,
            zoomControl: false
        };
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        if (!this.props.forHomePage) {
            this.mapHeight = screen.height - this.NAV_BAR_HEIGHT;
            if (this.mapHeight > this.MAX_MAP_HEIGHT || screen.width >= this.APP_FRAME_WIDTH) {
                this.mapHeight = this.MAX_MAP_HEIGHT;
            }
        }
    }

    componentDidUpdate(prevProps: Readonly<MapProps>, prevState: Readonly<MapState>, snapshot?: any): void {
        if (this.props.refresh !== prevProps.refresh ) {
            this.getReportsWithinGeometry();
        }
    }

    private googleMapInstance: google.maps.Map | null = null;

    public state: MapState = {
        bounds: [],
        groupedMarkers: [],
        markers: [],
        markerInfos: [],
        zoom: this.props.forHomePage ? 5 : 6,
        center: {
            lat: 32.4279,
            lng: 53.6880,
        },
    };

    private handleMapChange = (mapData) => {
        this.setState({
            bounds: mapData.bounds,
            zoom: mapData.zoom,
            center: mapData.center,
        }, () => this.getReportsWithinGeometry());
    };

    private getReportsWithinGeometry() {
        let myReports: Array<Report> = [];
        let distance = 0.1;

        BooghApi.getReportsWithinGeometry(this.state.bounds).then((data) => {
            if (Array.isArray(data)) {
                myReports = data.map((report: Report) => report);
            }

            distance = Math.abs(parseFloat(this.state.bounds['sw']['lat']) - parseFloat(this.state.bounds['ne']['lat']))*.10;
        })
            .then(async () => {
                if (BooghApi.getToken() !== '') {
                    await BooghApi.getUserPendingReports().then((data) => {
                        data.map((data: Report) => {
                            myReports.push(data);
                        });
                    });
                }
            })
            .then(() => {
                this.groupMarkers(myReports, distance);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    private onChildClick = (key, props) => {
        if(props.numReports == null) {
            this.handleMarkerClick(props.report);
        } else {
            //Handle group marker click
            this.setState({
                center: {
                    lat: props.lat,
                    lng: props.lng
                },
                zoom: this.state.zoom + 3
            });
        }
    };

    private handleMarkerClick = (report: Report) => {
        let deleted: boolean = false;
        let i;
        let markerInfos = this.state.markerInfos;
        //Check if the marker's info is already visible
        for (i = 0; i < markerInfos.length; i ++) {
            if (markerInfos[i].props.report.id == report.id) {
                let markerInfos1 = this.state.markerInfos;
                markerInfos1.splice(i,1);
                this.setState({
                    markerInfos: markerInfos1
                });
                deleted = true;
                break;
            }
        }
        //otherwise create it
        if (!deleted) {
            //Make conversion from pixels to lat/lng
            let latDifference = 0;
            let lngDifference = 0;
            if (this.googleMapInstance != null) {
                let bounds : google.maps.LatLngBounds = this.googleMapInstance.getBounds() || new google.maps.LatLngBounds();
                latDifference = Math.abs(bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
                lngDifference = Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
            }

            // 1024 is max width of map.//window.innerWidth
            const deviceWidth = Math.min(screen.availWidth, 1024);

            // 76.5 is (width of marker info - width of marker) / 2
            let adjustedLng =(76.5 / deviceWidth) * lngDifference;
            let adjustedLat = 0;

            //the width of mark info element is 200px, half of it is 100px
            let map = document.getElementById('google-map');
            if (map != null) {
                let mapHeight = map.style.height;
                if (mapHeight != null) {
                    adjustedLat = (100 / parseInt(mapHeight)) * latDifference;
                }
            }

            markerInfos.push(<MarkerInfo {...this.props} deleteMethod={this.deleteMarkerInfo} key={report.id + '-info'} lat={report.latitude + adjustedLat}
                                         lng={report.longitude - adjustedLng} selectReport={this.viewReport} report={report} refreshReport={() => this.getReportsWithinGeometry()}/>);
            this.setState({
                markerInfos: markerInfos
            })
        }
    };

    private deleteMarkerInfo = (markerInfo: MarkerInfo) => {
        let i;
        let markerInfos = this.state.markerInfos;
        for(i = 0; i < markerInfos.length; i ++) {
            if(markerInfos[i].props.report.id == markerInfo.props.report.id) {
                let markerInfos1 = this.state.markerInfos;
                markerInfos1.splice(i,1);
                this.setState({
                    markerInfos: markerInfos1
                });
                break;
            }
        }
    };

    private distanceToMouse = ({ x, y }, { x: mouseX, y: mouseY }) => {
        const offsetY = -49/2;
        return Math.sqrt((x - mouseX - offsetY) * (x - mouseX - offsetY) + (y - mouseY - offsetY) * (y - mouseY - offsetY))
    };

    private onSuggestSelect = (suggest: Suggest) => {
        if (typeof suggest === 'object' && suggest !== null) {
            // Note: This is necessary because the Suggest typings erroneously
            // define location.lat and location.lng as strings
            let suggestGmaps = suggest.gmaps;
            let northEastBounds = {ne: {lat: 0.0, lng: 0.0}};
            let southWestBounds = {sw: {lat: 0.0, lng: 0.0}};
            if ( suggestGmaps != undefined) {
                northEastBounds.ne.lat = suggestGmaps.geometry.viewport.getNorthEast().lat();
                northEastBounds.ne.lng = suggestGmaps.geometry.viewport.getNorthEast().lng();
                southWestBounds.sw.lat = suggestGmaps.geometry.viewport.getSouthWest().lat();
                southWestBounds.sw.lng = suggestGmaps.geometry.viewport.getSouthWest().lng();
            }

            const {center, zoom} = fitBounds({nw: {lat: northEastBounds.ne.lat, lng: southWestBounds.sw.lng}, se: {lat: southWestBounds.sw.lat, lng: northEastBounds.ne.lng}
            , ne: northEastBounds.ne, sw: southWestBounds.sw}, {width: window.innerWidth, height: this.mapHeight});


            this.setState({
                center: center,
                zoom: zoom
            });
        }
    };

    private onGoogleApiLoaded = ({ map, maps }) => {
        this.googleMapInstance = map;
    };

    private viewReport = (reportId: number) => {
        this.props.history.push("/report?id=" + reportId)
    };

    private zoomIn = () => {
        if (this.googleMapInstance !== null) {
            this.googleMapInstance.setZoom(this.googleMapInstance.getZoom() + 1);
        }
    };

    private zoomOut = () => {
        if (this.googleMapInstance !== null) {
            this.googleMapInstance.setZoom(this.googleMapInstance.getZoom() - 1);
        }
    };

    private groupMarkers = (reports: Array<Report>, distance: number) => {
        let grouped = new Array(reports.length).fill(0); // Keeps track if a report belongs to a group.
        let groupedMarkers : Array<JSX.Element> = [];
        let markers: Array<JSX.Element> = [];

        let i;
        for (i = 0; i < reports.length; i++) {
            let report1 = reports[i];
            let numGroupElements = 1;

            // Proceed if the report has not been grouped yet.
            if (grouped[i] !== 1) {
                let j;
                for (j = i + 1; j < reports.length; j++) {
                    if (grouped[j] !== 1) {
                        let report2 = reports[j];
                        if (report1.longitude + distance > report2.longitude && report1.longitude - distance < report2.longitude) {
                            if (report1.latitude + distance > report2.latitude && report1.latitude - distance < report2.latitude) {
                                numGroupElements++;
                                grouped[j] = 1;
                                grouped[i] = 1;
                            }
                        }
                    }
                }
                if (numGroupElements > 1) {
                    groupedMarkers.push(<GroupMarker key={report1.id} lat={report1.latitude} lng={report1.longitude} numReports={numGroupElements}/>);
                }
            }

        }
        for (i = 0 ; i < grouped.length; i++) {
            let report = reports[i];
            if (grouped[i] == 0) {
                markers.push(<MyMarker key={report.id} lat={report.latitude} lng={report.longitude} onClick={this.handleMarkerClick} report={report}/>)
            }
        }
        this.setState({
            groupedMarkers,
            markers,
        });
    };

    public render() {

        let searchBar = <div></div>;
        let zoomControl = <div></div>;
        let googleMapStyle = styles.homeGoogleMap;
        let componentContainerStyle;
        let onChildClick;
        if (!this.props.forHomePage) {
            searchBar = (
                <div className={styles.mapSearchBar}>
                    <div style={{position: 'relative'}}>
                        <Geosuggest
                            onSuggestSelect={this.onSuggestSelect}
                            placeholder='آدرس را جستجو کن!'
                            inputClassName={styles.geoSuggestInput}
                            suggestsClassName={styles.geoSuggestSuggests}
                            suggestItemClassName={styles.geoSuggestSuggestItem}
                            suggestItemActiveClassName={styles.geoSuggestSuggestItemActive}
                            suggestsHiddenClassName={styles.geoSuggestHiddenClassName}
                            country="ir"/>

                        <img src={require('../assets/magnifyWhite.png')} style={{position: 'absolute', top: 20, right:20}}/>

                    </div>
                </div>
            );

            zoomControl = (
                <div className={styles.zoomButtonsContainer}>
                    <button
                        className={styles.zoomInButton}
                        type='button'
                        onClick={this.zoomIn}
                    >
                        +
                    </button>
                    <button
                        className={styles.zoomOutButton}
                        type='button'
                        onClick={this.zoomOut}
                    >
                        -
                    </button>
                </div>
            );

            googleMapStyle = styles.container;
            componentContainerStyle = generalStyles.componentContainer;
            onChildClick = this.onChildClick;
        }else{
            onChildClick = () => {};
        }



        return (
            <div>
                <div key='map' id='google-map' className={googleMapStyle} style={{height: this.mapHeight}}>
                    <GoogleMapReact
                        bootstrapURLKeys={{
                            key: config.googleMapsApiKey,
                        }}
                        center={this.state.center}
                        zoom={this.state.zoom}
                        options={this.createGoogleMapOptions}
                        onChange={this.handleMapChange}
                        onChildClick={onChildClick}
                        onGoogleApiLoaded={this.onGoogleApiLoaded}
                        distanceToMouse={this.distanceToMouse}
                        yesIWantToUseGoogleMapApiInternals>

                        {this.state.groupedMarkers}
                        {this.state.markers}
                        {this.state.markerInfos}
                    </GoogleMapReact>

                    {zoomControl}

                    {searchBar}
                </div>
            </div>
        );
    }
}

interface GroupMarkerProps {
    lng: number;
    lat: number;
    numReports: number;
}

const GroupMarker = (props: GroupMarkerProps) => (
    <div className={styles.groupMarkerContainer}>
        <img className={styles.groupMarkerImg} src={require('../assets/Boogh_issue_clustered.png')}/>
        <div className={styles.groupMarkerNumber}>{englishNumeralToPersianNumeral(props.numReports)}</div>
    </div>
);

interface MyMarkerProps {
    lat: number;
    lng: number;
    onClick: Function;
    report: Report;
}

const MyMarker = (props: MyMarkerProps) => {
    let src = require('../assets/Boogh_issue_icon.png');

    const { currentUserReport } = props.report;

    if (currentUserReport !== null) {
        if (currentUserReport) {
            if (props.report.state === 'APPROVED') {
                src = require('../assets/Boogh_userissue_icon.png');
            } else {
                src = require('../assets/Boogh_pending_icon.png');
            }
        }
    }

    return (
        <button key={props.report.id} style={{border: 'none', backgroundColor: 'transparent', outline: 'none'}}>
            <img src={src} style={{height:47, width:47}} />
        </button>
    );
};

interface MarkerInfoProps extends RouteComponentProps{
    report: Report;
    lat: number;
    lng: number;
    selectReport: (reportId: number) => void;
    deleteMethod: (markerInfo: MarkerInfo) => void;
    refreshReport: Function;
}

interface MarkerInfoState {
    favoriteToggle: boolean;
}

class MarkerInfo extends React.Component<MarkerInfoProps, MarkerInfoState> {
    MAX_TITLE_LENGTH = 10;
    public constructor(props: MarkerInfoProps) {
        super(props);
        this.state = {
            favoriteToggle: (this.props.report.favoritedByCurrentUser != null) ? this.props.report.favoritedByCurrentUser : false
        };
        this.favoriteReport = this.favoriteReport.bind(this);
        this.closeMarkerInfo = this.closeMarkerInfo.bind(this);
    }

    private favoriteReport(event : any): void {
        if (BooghApi.getToken() != "") {
            let toggle = !this.state.favoriteToggle;
            this.setState({
                favoriteToggle: toggle
            });

            let report = {} as Report;
            report.id = this.props.report.id;
            let reportStatusState :ReportStatusState = ReportStatusState.FALSE;
            if(toggle == true) {
                reportStatusState = ReportStatusState.TRUE;
            }

            const reportStatus: ReportStatus = {
                saved: reportStatusState,
                report: report,
                reporter: {} as User,
                flagged: ReportStatusState.UNSET
            };
            BooghApi.favoriteReport(reportStatus)
                .then((data) => {
                    this.props.refreshReport();
                }).catch((err) => {
                    console.log(err);
                });
        } else {
            this.props.history.push('/login');
        }
        event.stopPropagation();
    }

    private closeMarkerInfo(event: any): void {
        this.props.deleteMethod(this);
        event.stopPropagation();
    }

    public render() {
        let createdJalaliDate = gregorianDateToJalaaliDate(this.props.report.date);

        let src = require('../assets/favorite_inactive_icon.png');
        if (this.state.favoriteToggle) {
            src  = require('../assets/favorite_active_icon.png');
        }

        let author = "anonymous";
        let reporter: User = this.props.report.reporter;
        if (reporter != null) {
            author = reporter.login;
        }

        if (this.props.report.currentUserReport != null) {
            if (this.props.report.currentUserReport == true) {
                author = 'you';
            }
        }
        let space = " ";

        let markerInfoTitle = truncateReportTitle(this.props.report.title, this.MAX_TITLE_LENGTH);

        return (
            <div className={styles.markerInfo} onClick={()=> this.props.selectReport(this.props.report.id || -1)}>
                <Row>
                    <Col md={3} xs={3}>
                        <button className={generalStyles.borderNone} onClick={this.closeMarkerInfo}>
                            <img src={require('../assets/close.png')} className={styles.markerInfoCloseButton}/>
                        </button>
                    </Col>
                    <Col md={9} xs={9}>
                        <div className={`boogh-Text ${styles.markerInfoTitle}`}>
                            {markerInfoTitle}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={3} xs={3} style={{marginTop:'10%'}}>
                        <img src={src} onClick={this.favoriteReport} style={{height: 23, width: 23}} />
                    </Col>
                    <Col md={9} xs={9} style={{marginTop:'5%'}}>
                        <div className={`boogh-Text ${styles.markerInfoText}`}>
                            <Trans>Posted by</Trans>
                            {space}
                            <Trans>{author}</Trans>
                        </div>
                        <div className={`boogh-Text ${styles.markerInfoText}`}>
                            <Trans>Updated</Trans> {createdJalaliDate}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
