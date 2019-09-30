import * as React from 'react';
import { Button, Row, Col, Checkbox} from 'react-bootstrap';
import GoogleMapReact, {MapOptions, Maps} from "google-map-react";
import '../App.css';
import {Report, User} from '../types';
import Geosuggest from 'react-geosuggest';
import { fitBounds } from 'google-map-react/utils';
import { Upload } from "./Upload";
import {Trans} from "react-i18next";
import BooghApi from "../api/BooghApi";
import { RouteComponentProps } from "react-router-dom";
import config from '../config';
import {getDefaultGoogleMapOptions, getNumBytesFromBase64StringArray} from '../utils';
import * as styles from "../css-modules/Submit.module.css";
import * as formStyles from "../css-modules/Form.module.css";
import * as mapStyles from "../css-modules/Map.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import LoadingOverlay from 'react-loading-overlay';

type SubmitState = {
    address: string,
    title: string,
    description: string
    isAnonymous: boolean,
    lat: number,
    lng: number,
    center: {
        lat: number,
        lng: number,
    },
    zoom: number,
    marker: Array<JSX.Element>,
    images: Array<string>,
    showLocationMissing: boolean,
    showReportTitleMissing: boolean,
    showDescriptionMissing: boolean,
    showConnectionTimeout: boolean,
    submitDisabled: boolean,
    showLoadingBar: boolean,
    totalImageBytes: number,
}

export class Submit extends React.Component<RouteComponentProps, SubmitState> {

    private googleMapInstance: google.maps.Map | null = null;
    private MAX_REQUEST_SIZE = 65000000;

    public constructor(props: RouteComponentProps) {
        super(props);
        this.handleAddressChange = this.handleAddressChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleAnonymousChange = this.handleAnonymousChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onMapClick = this.onMapClick.bind(this);
        this.onSuggestSelect = this.onSuggestSelect.bind(this);
        this.setImages = this.setImages.bind(this);
        this.createGoogleMapOptions = this.createGoogleMapOptions.bind(this);
        this.state = {
            address: "",
            title: "",
            description: "",
            isAnonymous: false,
            lat: 0.0,
            lng: 0.0,
            zoom: 6,
            center: {
                lat: 32.4279,
                lng: 53.6880,
            },
            marker: [],
            images: [],
            showLocationMissing: false,
            showReportTitleMissing: false,
            showDescriptionMissing: false,
            showConnectionTimeout: false,
            submitDisabled: false,
            showLoadingBar: false,
            totalImageBytes: 0,
        }
    }

    private handleAddressChange(event: any): void {
        this.setState({address: event.target.value});
    }

    private handleTitleChange(event: any): void {
        this.setState({title: event.target.value});
    }

    private handleDescriptionChange(event: any): void {
        this.setState({description: event.target.value});
    }

    private handleAnonymousChange(event: any): void {
        this.setState({isAnonymous: !this.state.isAnonymous})
    }

    private handleSubmit(): void {
        this.setState({showReportTitleMissing: false, showDescriptionMissing: false, submitDisabled: true, showLoadingBar: true, showConnectionTimeout: false});

        if (this.state.totalImageBytes > this.MAX_REQUEST_SIZE) {
            this.setState({submitDisabled: false, showLoadingBar: false, showConnectionTimeout: true});
            return;
        }

        let report: Report = {
            reporter: {} as User,
            title: this.state.title,
            description: this.state.description,
            date: "",
            anonymous: this.state.isAnonymous,
            latitude: this.state.lat,
            longitude: this.state.lng,
            state: "PENDING",
            type: "ROAD_SAFETY",
            images: this.state.images,
        };
        BooghApi.submitReport(report).then(data  => {

            if(data.id != null){
                this.setState({submitDisabled: false, showLoadingBar: false});
                this.props.history.push("/submit-confirmation", {reportId: data.id});
            }
        }).catch(err => {
            let error: string = err.toString();
            if (error.includes("location")) {
                this.setState({showLocationMissing: true})
            }
            if (error.includes("title")) {
                this.setState({showReportTitleMissing: true});
            }
            if (error.includes('description')) {
                this.setState({showDescriptionMissing: true});
            }
            if (error.includes('connection')) {
                this.setState({showConnectionTimeout: true});
            }
            this.setState({submitDisabled: false, showLoadingBar: false});
        });
    }

    private createGoogleMapOptions(maps: Maps): MapOptions {
        const defaultGoogleMapOptions = getDefaultGoogleMapOptions(maps);

        let disableDoubleClickZoom =  false;
        let panControl, dragable, scrollwheel = true;

        return {
            ...defaultGoogleMapOptions,
            disableDoubleClickZoom: disableDoubleClickZoom,
            scrollwheel: scrollwheel,
            panControl: panControl,
            draggable : dragable,
            zoomControl: false
        };
    }

    private onGoogleApiLoaded = ({ map, maps }) => {
        this.googleMapInstance = map;
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

    private onMapClick(obj){
        let marker : Array<JSX.Element> = [];
        marker.push(<MyMarker key={'marker'} lat={obj.lat} lng={obj.lng}/>);
        this.setState({
            marker: marker,
            lat: obj.lat,
            lng: obj.lng
        })
    }

    private onSuggestSelect(suggest: any) {
        if (suggest != null) {

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
                , ne: northEastBounds.ne, sw: southWestBounds.sw}, {width: window.innerWidth, height: 300});

            this.setState({
                center: center,
                zoom: zoom,
            });
        }
    }

    private setImages(images: Array<string>) {
        let totalImageBytes = getNumBytesFromBase64StringArray(images);
        this.setState({images: images, totalImageBytes: totalImageBytes});
    }

    public render() {
        let checkbox : JSX.Element = <div></div>
        if (BooghApi.getToken() != "") {
            checkbox = (
                <Checkbox checked={this.state.isAnonymous} style={{direction:'rtl'}} onChange={this.handleAnonymousChange}>
                    <div className={`${generalStyles.booghText} ${formStyles.formCheckboxLabel}`} >
                        <Trans>Post anonymously</Trans>
                    </div>
                </Checkbox>
            )
        }

        let reportLocationClass :string = formStyles.formInput;
        let mapClass :string = mapStyles.container;
        let locationErrorMsg = <div></div>;
        if (this.state.showLocationMissing) {
            mapClass = `${mapStyles.container} ${formStyles.formInputError}`;
            reportLocationClass = `${formStyles.formInput} ${formStyles.formInputError}`;
            locationErrorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>Location is required</Trans>
                </div>
            )
        }

        let reportTitleClass :string = formStyles.formInput;
        let titleErrorMsg = <div></div>;
        if (this.state.showReportTitleMissing) {
            reportTitleClass = `${formStyles.formInput} ${formStyles.formInputError}`;
            titleErrorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>Title is required</Trans>
                </div>
            )
        }

        let reportDescriptionClass :string = formStyles.formInput;
        let descriptionErrorMsg = <div></div>;
        if (this.state.showDescriptionMissing) {
            reportDescriptionClass = `${formStyles.formInput} ${formStyles.formInputError}`;
            descriptionErrorMsg = (
                <div className={formStyles.formInputErrorText}>
                    <Trans>Description is required</Trans>
                </div>
            )
        }

        return(
            <LoadingOverlay
                active={this.state.showLoadingBar}
                spinner>
                <div className={generalStyles.subContainer}>
                    <div className={generalStyles.pageTitle}>
                        <Trans>Submit an issue</Trans>
                    </div>
                    <hr className={generalStyles.titleHr}/>

                    <div className={generalStyles.booghText} style={{fontSize: 22, padding: '0px 0px 15px'}}>
                        <Trans>Location</Trans>
                    </div>
                    <div style={{height:300, width: '100%', padding:2}} className={mapClass}>
                        <GoogleMapReact
                            bootstrapURLKeys={{
                                key: config.googleMapsApiKey
                            }}
                            center={this.state.center}
                            zoom={this.state.zoom}
                            onClick={this.onMapClick}
                            options={this.createGoogleMapOptions}
                            onGoogleApiLoaded={this.onGoogleApiLoaded}
                        >
                            {this.state.marker}
                        </GoogleMapReact>


                        <div className={mapStyles.zoomButtonsContainer} style={{position: 'absolute', left: 10, top: 10}}>
                            <button
                                className={mapStyles.zoomInButton}
                                type='button'
                                onClick={this.zoomIn}
                            >
                                +
                            </button>
                            <button
                                className={mapStyles.zoomOutButton}
                                type='button'
                                onClick={this.zoomOut}
                            >
                                -
                            </button>
                        </div>

                    </div>
                    <div style={{position:'relative', marginTop:20}}>
                        <Geosuggest
                            onSuggestSelect={this.onSuggestSelect} placeholder="آدرس را جستجو کن!"
                            style={{'input': {height:56, paddingRight:30, boxShadow: '0 1px 0 0 rgba(0,0,0,0.15)'}}}
                            inputClassName={reportLocationClass}
                            suggestsClassName={mapStyles.geoSuggestSuggests}
                            suggestItemClassName={mapStyles.geoSuggestSuggestItem}
                            suggestItemActiveClassName={mapStyles.geoSuggestSuggestItemActive}
                            suggestsHiddenClassName={mapStyles.geoSuggestHiddenClassName}
                            country='Ir'
                        />
                        <img src={require('../assets/magnifyWhite.png')} style={{position: 'absolute', top: 20, right:10}}/>
                    </div>
                    {locationErrorMsg}

                    <hr/>

                    <div className='form-group'>
                        <div className={`${generalStyles.booghText} ${formStyles.fieldLabel}`}>
                            <Trans>Title</Trans>
                        </div>
                        <input type="text" value={this.state.title} onChange={this.handleTitleChange} className={reportTitleClass}/>
                    </div>
                    {titleErrorMsg}

                    <div className='form-group' style={{paddingTop: 5}}>
                        <div className={`${generalStyles.booghText} ${formStyles.fieldLabel}`}>
                            <Trans>Description</Trans>
                        </div>
                        <textarea value={this.state.description} onChange={this.handleDescriptionChange} className={reportDescriptionClass}
                               placeholder="مشکل را توضیح بده و بگو این مشکل چه پیامدهایی برای شما و دیگران داشته."
                               style={{height:120, fontSize: 15, paddingTop: 10}}/>
                    </div>
                    {descriptionErrorMsg}

                    <hr/>

                    <Upload setImages={this.setImages} showConnectionTimeout={this.state.showConnectionTimeout}/>

                    {checkbox}

                    <button
                        className={styles.submitButton}
                        onClick={this.handleSubmit}
                        type='button'
                        disabled={this.state.submitDisabled}
                    >
                        <div className={styles.submitButtonText}>
                            <Trans>Submit issue</Trans>
                        </div>
                    </button>
                </div>
            </LoadingOverlay>
        )
    }
}

type MyMarkerProps = {
    lat: number,
    lng: number
}

type MyMarkerState = {
}

class MyMarker extends React.Component<MyMarkerProps, MyMarkerState>{
    public constructor(props: MyMarkerProps){
        super(props);
    }

    public render() {
        return (
            <div>
                <img className={styles.submitMarkerImg} src={require('../assets/location_indicator_icon.png')}/>
            </div>
        );
    }
}
