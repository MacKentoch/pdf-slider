// @flow

/* eslint-disable flowtype/no-weak-types */

import React from 'react';
// import cx from 'classnames';
import styles from './button.scss';


type ButtonProp = {
  text: string,
  type: 'previous' | 'next',
  onClick: () => any
};

const Button = ({
  text = 'button text',
  type = 'next',
  onClick = () => true
}: ButtonProp) => (
  <button
    onClick={onClick}
    className={`${styles.btn} ${type === 'next' ? styles.btnNext : styles.btnPrev}`}
  >
    { text }
  </button>
  );

export default Button;
