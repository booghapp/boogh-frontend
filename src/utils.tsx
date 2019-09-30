/* eslint-disable import/prefer-default-export */

import {
    MapOptions,
    Maps,
} from 'google-map-react';

var jalaali = require('jalaali-js');

export function getDefaultGoogleMapOptions(maps: Maps): MapOptions {
    return {
        zoomControlOptions: {
            position: maps.ControlPosition.LEFT_TOP,
        },
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'greedy',
    };
}

export function englishNumeralToPersianNumeral(englishNumeral : number) {

    let persianBaseNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    let englishNumeralString = englishNumeral.toString();
    let persianNumeralString = "";
    let engNumeralIndex = 0;
    if (englishNumeralString.charAt(0) === '-') {
        persianNumeralString += "-";
        engNumeralIndex = 1;
    }

    for (engNumeralIndex; engNumeralIndex < englishNumeralString.length; engNumeralIndex++) {
        let englishNumeralChar = englishNumeralString.charAt(engNumeralIndex);
        persianNumeralString += persianBaseNumbers[parseInt(englishNumeralChar)];
    }

    return persianNumeralString;
}

export function gregorianDateToJalaaliDate(gregorianDate: string) {

    let date = new Date(gregorianDate);
    let jalaaliDate = jalaali.toJalaali(date);
    let formattedJalaaliDate = jalaaliDate['jy'] + "/" + jalaaliDate['jm'] + "/" + jalaaliDate['jd'];
    return formattedJalaaliDate;
}

export function truncateReportTitle(reportTitle: string, maxTitleLength: number) {

    let truncatedReportTitle = reportTitle;
    if (reportTitle.length > maxTitleLength) {
        truncatedReportTitle = reportTitle.substr(0, maxTitleLength) + " ...";
    }

    return truncatedReportTitle;
}

export function getNumBytesFromBase64StringArray(array : Array<string>) :number{

    let numberOfBytes: number = 0;
    for (let i = 0; i < array.length ; i++) {
        let base64String :string = array[i];
        let num6BitBytes = base64String.length * 6;
        let num8BitBytes = num6BitBytes / 8;
        numberOfBytes += num8BitBytes;
    }
    return numberOfBytes;
}