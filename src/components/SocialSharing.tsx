import * as React from 'react';
import * as styles from "../css-modules/SocialSharing.module.css";


interface SocialSharingProps {
    sharingOptions: JSX.Element;
    show: boolean;
}

export class SocialSharing extends React.Component<SocialSharingProps>{

    constructor(props: SocialSharingProps) {
        super(props);
    }


    render () {

        const desktopSharingView = (
            <div className={styles.sharingInfo}>
                {this.props.sharingOptions}
            </div>
        );

        if (this.props.show) {
            return desktopSharingView;

        } else {
            return <div></div>
        }
    }
}
