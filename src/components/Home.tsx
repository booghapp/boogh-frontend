import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Trans } from "react-i18next";
import { RouteComponentProps } from 'react-router-dom';
import * as styles from "../css-modules/Home.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import {Map} from "./Map";

interface HomeProps extends RouteComponentProps {
    refresh: boolean
}

export class Home extends React.Component<HomeProps> {
    public constructor(props: HomeProps) {
        super(props);

        this.submitIssue = this.submitIssue.bind(this);
        this.viewIssues = this.viewIssues.bind(this);
        this.viewMap = this.viewMap.bind(this);
    }

    private submitIssue(event: any) {
        this.props.history.push("/submit");
        event.preventDefault();
    }

    private viewIssues(event: any) {
        this.props.history.push("/explore/feed");
        event.preventDefault();
    }

    private viewMap(event: any) {
        this.props.history.push("explore/map");
        event.preventDefault();
    }

    public render(): JSX.Element {
        return (
            <div className={generalStyles.componentContainer}>
                <Row className={styles.homeRow}>
                    <Col
                        md={7}
                        mdPush={5}
                        xs={12}
                        className={styles.homeCol}
                    >
                        <div onClick={this.viewMap}>
                            <Map
                                forHomePage
                                history={this.props.history}
                                location={this.props.location}
                                match={this.props.match}
                                setFooterView={() => {}}
                                refresh={this.props.refresh}
                            />
                        </div>
                    </Col>
                    <Col
                        md={4}
                        mdPull={6}
                        xs={12}
                        className={styles.homeCol}
                    >
                        <div className={styles.homeInfo}>
                            <div className={styles.homeHeader}><Trans>Build a better community</Trans></div>
                            <div style={{marginTop:20}}>
                                <div className={styles.homeText}>
                                    به کمک «بــوق»، به‌عنوان اعضای محله، شهر و یا استانی که در آن زندگی می‌کنید، برای حل مشکلات دست به کار شوید.‎‎‎
                                </div>
                            </div>

                            <div className={styles.homeButtonsContainer}>
                                <a
                                    className={styles.submitButton}
                                    onClick={this.submitIssue}
                                    type='button'
                                    href={"/submit"}
                                >
                                    <Trans>Submit issues</Trans>
                                </a>
                                <a
                                    className={styles.viewButton}
                                    onClick={this.viewIssues}
                                    type='button'
                                    href={"/explore/feed"}
                                >
                                    <Trans>View issues</Trans>
                                </a>
                            </div>
                        </div>
                    </Col>

                </Row>
                <hr className={styles.homeHr} />
                <Info />
            </div>
        );
    }
}

function Info() {
    const info = (
        <Row style={{margin:'30px 80px 40px 80px'}}>
            <Col xs={12} md={4} mdPush={8}>
                <img src={require('../assets/Boogh_add_location.png')} className={styles.homeImg}/>
                <div className={styles.homeImgTitle}>۱. <Trans>Location</Trans></div>
                <div className={styles.homeText} style={{marginBottom: '0px', marginTop: '20px'}}>مکانی که مشکل موردنظر در آنجا وجود دارد را پیدا کن</div>
            </Col>
            <Col xs={12} md={4}>
                <img src={require('../assets/Boogh_description.png')} className={styles.homeImg}/>
                <div className={styles.homeImgTitle}>۲.  <Trans>Describe the problem</Trans></div>
                <div className={styles.homeText} style={{marginBottom: '0px', marginTop: '20px'}}>در بخش «شرح» توضیحات خود را وارد کن</div>
            </Col>
            <Col xs={12} md={4} mdPull={8}>
                <img src={require('../assets/Boogh_add_photos.png')} className={styles.homeImg}/>
                <div className={styles.homeImgTitle}>۳. <Trans>Add Photos</Trans></div>
                <div className={styles.homeText} style={{marginBottom: '0px', marginTop: '20px'}}>تصاویری از محل گزارش‌شده بگیر و آن‌ها را در بخش «عکس‌ها» بارگذاری کن</div>
            </Col>
        </Row>
    );

    return(
        <div>
            <div className={styles.infoTitle}>
                <Trans>How to submit an issue</Trans>
            </div>
            <div>
                {info}
            </div>
        </div>
    );
}
