import * as React from 'react';
import {Trans} from "react-i18next";
import * as styles from "../css-modules/Help.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import BooghApi from "../api/BooghApi";
import {QA} from "../types";

type HelpState = {
    qas: Array<any>,
    arrowStyles: Array<any>,
}

export class Help extends React.Component<any, HelpState> {
    public constructor(props) {
        super(props);
        this.state = {
            qas: [],
            arrowStyles: [],
        };
        this.toggleArrowStyles = this.toggleArrowStyles.bind(this);
        this.getQAs = this.getQAs.bind(this);
    }

    componentDidMount(): void {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        this.getQAs();
    }

    private getQAs() {
        BooghApi.getQAs().then( data => {
            let qas : Array<QA> = data;
            let arrowStyles = new Array(qas.length);
            arrowStyles.fill(styles.helpArrowDown);
            this.setState({arrowStyles: arrowStyles, qas: qas});

        }).catch(err => {
            console.log(err);
        })
    }

    private toggleArrowStyles(arrowNum: number) {
        let arrowStyles = this.state.arrowStyles;
        if (arrowStyles[arrowNum] == styles.helpArrowDown) {
            arrowStyles[arrowNum] = styles.helpArrowUp;
        } else {
            arrowStyles[arrowNum] = styles.helpArrowDown;
        }
        this.setState({arrowStyles: arrowStyles});
    }

    public render() {

        let qasJSX = this.state.qas.map((qa, index) => {
            return (
                <div key={qa.id}>
                    <button className={styles.helpQuestion}  onClick={() => this.toggleArrowStyles(index)}>
                        <div className={this.state.arrowStyles[index]}></div>
                        <div>{qa.question}</div>
                    </button>
                    {this.state.arrowStyles[index] === styles.helpArrowUp && <div className={styles.helpAnswer}>{qa.answer}</div>}
                    <hr/>
                </div>
            );
        });

        return(
            <div className={`${generalStyles.subContainer} ${generalStyles.page} ${generalStyles.document}`}>
                <div className={generalStyles.pageTitle}>
                    <Trans>Questions</Trans>
                </div>
                <hr className={generalStyles.titleHr}/>

                {qasJSX}
            </div>
        )
    }
}
