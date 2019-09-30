import * as React from 'react';
import {Trans} from "react-i18next";
import * as formStyles from "../css-modules/Form.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import { Document } from '../types';
import BooghApi from "../api/BooghApi";
const ReactMarkdown = require("react-markdown");

interface TermsOfUseState {
    document: Document;
}

export class TermsOfUse extends React.Component<any, TermsOfUseState>{

    constructor(props: any){
        super(props);
        this.state = {document: {} as Document}
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        BooghApi.getDocumentOfType("TERMSOFUSE").then(data  => {
            if (data.length != 0) {
                this.setState({document:data[0]});
            }
        }).catch(err => {
            console.log(err);
        })
    }

    render(){
        return (
            <div className={`${generalStyles.subContainer} ${generalStyles.infoPageStyle}`}>
                <div className={generalStyles.document}>
                    <ReactMarkdown source={this.state.document.content}/>
                </div>
            </div>
        )
    }

}
