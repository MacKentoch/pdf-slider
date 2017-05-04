/* @flow */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import styles from './sidePdfList.scss';

type SidePdfListType = {
  list: Array<string>,
  currentIndex: number
};

const SidePdfList = ({
  list = [],
  currentIndex = 0
}: SidePdfListType) => (
  <div className={styles.sidePdfListContainer}>
    <ul>
      {
        list.map(
          (item, itemIndex) => (
            <li
              key={itemIndex}
              className={
                currentIndex === itemIndex
                  ? `${styles.sideListItem} ${styles.sidePdfListSelectedItem}`
                  : `${styles.sideListItem} ${styles.sidePdfListDefaultItem}`
                }
            >
              {item}
            </li>
          )
        )
      }
    </ul>
  </div>
);

export default SidePdfList;
