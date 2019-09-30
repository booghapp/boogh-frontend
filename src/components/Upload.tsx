import * as React from 'react';
import Dropzone from 'react-dropzone';
import { Row, Col } from 'react-bootstrap';
import {Trans} from "react-i18next";
import * as styles from "../css-modules/Upload.module.css";
import * as generalStyles from "../css-modules/General.module.css";
import * as formStyles from "../css-modules/Form.module.css";

type UploadProps = {
    setImages: Function;
    showConnectionTimeout: boolean;
}

type UploadState = {
    images: Array<string>,
    showUploadError: boolean,
}

export class Upload extends React.Component<UploadProps, UploadState>{

    constructor(props: UploadProps){
        super(props);

        this.state = {images: [], showUploadError: false};
        this.onDrop = this.onDrop.bind(this);
        this.onDropRejected = this.onDropRejected.bind(this);
    }

    removeImage(id: number) {
        let images : Array<string> = this.state.images;
        images.splice(id,1);
        this.setState({images: images});
        this.props.setImages(this.state.images);
    }

    onDrop(files) {
        let componentContext = this;
        componentContext.setState({showUploadError: false});

        let file = files.pop();
        while (file !== undefined) {
            const reader = new FileReader();
            reader.onabort = () => console.log('file reading was aborted');

            reader.onload = function () {
                let base64Img = reader.result || "";
                let images: Array<string> = componentContext.state.images;
                images.push(base64Img.toString());
                componentContext.setState({
                    images: images
                });
                componentContext.props.setImages(images);
            };
            reader.onerror = function (error) {
                componentContext.setState({
                    showUploadError: true
                })
            };

            if (file && file.type.match('image.*')) {
                reader.readAsDataURL(file);
            }
            file = files.pop();
        }

    }

    onDropRejected() {
        this.setState({
            showUploadError: true
        })
    }

    render() {

        let uploadErrorMsg = <div></div>;
        if (this.state.showUploadError) {
            uploadErrorMsg = (
                <div className={formStyles.formError}>
                    <div className={formStyles.formConfirmationText} style={{textAlign: 'center'}}>
                        <Trans>Could not upload file.  File size limit is 10mb.</Trans>
                    </div>
                </div>
            )
        }

        let dropzoneRef: any = React.createRef();
        if (dropzoneRef == null) {
            dropzoneRef = {};
        }


        let connectionErrorMsg = <div></div>;
        if (this.props.showConnectionTimeout) {
            connectionErrorMsg = (
                <div className={formStyles.formError}>
                    <div className={formStyles.formConfirmationText} style={{textAlign: 'center'}}>
                        <Trans>Could not submit report.  Report images cannot exceed 65mb!</Trans>
                    </div>
                </div>
            )
        }

        const column = {padding: '10px 10px'};
        return (
            <div style={{direction: 'rtl'}}>
                <div className={generalStyles.booghText} style={{fontSize: 22}}>
                    <Trans>Photos</Trans>
                    <div className={styles.uploadTextLight}>
                        <Trans>(optional) </Trans>
                    </div>
                </div>
                <div className={generalStyles.booghText} style={{fontSize: 16}}>
                    <Trans>Add as many photos as you can to show the issue in detail.</Trans>
                </div>
                <div className={generalStyles.booghText} style={{paddingTop: 15, marginBottom: 10, fontSize: 16}}>
                    <b><Trans>Recommendations</Trans></b>
                </div>
                <Row style={{textAlign: 'center', margin: 0}}>
                    <Col md={3} xs={6} style={column}>
                        <div className={styles.uploadImgContainer}>
                            <img className={styles.uploadImg} src={require('../assets/Boogh_noface.png')}/>
                            <div className={styles.uploadText}>
                                <Trans>Avoid faces and license plates</Trans>
                            </div>
                        </div>
                    </Col>
                    <Col md={3} xs={6} style={column}>
                        <div className={styles.uploadImgContainer}>
                            <img className={styles.uploadImg} src={require('../assets/Boogh_angles.png')}/>
                            <div className={styles.uploadText}>
                                <Trans>Shoot different angles of the issue</Trans>
                            </div>
                        </div>
                    </Col>
                    <Col md={3} xs={6} style={column}>
                        <div className={styles.uploadImgContainer}>
                            <img className={styles.uploadImg} src={require('../assets/Boogh_bright.png')}/>
                            <div className={styles.uploadText}>
                                <Trans>Ensure the photos are bright and clear</Trans>
                            </div>
                        </div>
                    </Col>
                    <Col md={3} xs={6} style={column}>
                        <div className={styles.uploadImgContainer}>
                            <img className={styles.uploadImg} src={require('../assets/Boogh_resolution.png')}/>
                            <div className={styles.uploadText}>
                                <Trans>Upload high resolution photos</Trans>
                            </div>
                        </div>
                    </Col>
                </Row>

                {connectionErrorMsg}

                {uploadErrorMsg}

                <Dropzone
                    ref={dropzoneRef}
                    accept={".jpg, .jpeg, .png"}
                    onDrop={files => {
                        this.onDrop(files)
                    }}
                    onDropRejected={this.onDropRejected}
                    maxSize={10097152}>

                    {({getRootProps, getInputProps}) => (
                        <div className={styles.uploadDropzone} {...getRootProps({onClick: evt => evt.preventDefault()})}>
                            <input {...getInputProps()} />
                            <div className={styles.uploadDropzoneContainer}>
                                <div className={styles.dropZoneImgVisibility}>
                                    <img src={require('../assets/upload_icon.png')}/>
                                    <div className={generalStyles.booghText} style={{fontSize: 20, margin: 10}}>
                                        <Trans>Drag & Drop to upload photos</Trans>
                                    </div>
                                    <div style={{fontFamily: 'Source Sans Pro', fontSize: 16, margin: 10}}>
                                        <Trans>or</Trans>
                                    </div>
                                </div>
                                <button className={styles.uploadDropzoneButton}
                                        onClick={() => dropzoneRef.current.open()}>
                                    <Trans>Open File Dialog</Trans>
                                    <img src={require('../assets/upload_icon.png')} className={styles.dropZoneButtonImg}/>
                                </button>
                            </div>
                            <div>
                                {this.state.images.map((file, index) =>
                                    <div key={index} style={{position:'relative', display:'inline-block', margin:5, width:100, height:100}}>
                                        <button className={styles.photoPreviewCloseButton} onClick={() => this.removeImage(index)}>X</button>
                                        <img style={{width:100, height:100}} src={file} />
                                    </div>)}
                            </div>
                        </div>
                    )}
                </Dropzone>

                <hr/>
            </div>
        )
    }
}
