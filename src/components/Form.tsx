import * as React from 'react';
import * as styles from '../css-modules/Form.module.css';

interface FormProps {
    fields: JSX.Element;
    onSubmit: (event: React.FormEvent) => void;
}

export class Form extends React.PureComponent<FormProps> {
    public render() {
        return (
            <div className={styles.formBackground}>

                    <div className={styles.form}>
                        <form
                            className={styles.formContent}
                            onSubmit={this.props.onSubmit}
                        >
                            {this.props.fields}
                        </form>
                    </div>

            </div>
        );
    }
}
