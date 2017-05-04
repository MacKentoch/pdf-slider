/* @flow */

/* eslint-disable flowtype/no-weak-types */
import React, {
  // PropTypes,
  PureComponent
} from 'react';
import { Link } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import Spinner from 'react-spinkit';
import { virtualize, bindKeyboard } from 'react-swipeable-views-utils';
import PDF from 'react-pdf-js';
import Button from './button';
import styles from './pdfViewer.scss';
import SidePdfList from './SidePdfList';

const ipcRenderer = require('electron').ipcRenderer;

const VirtualizedSwipeableViews = bindKeyboard(virtualize(SwipeableViews));
// une liste de démo de pdf, plus elle augrmente plus le premier chargement est long
// MAIS pas d'impacte de fluidité
const LIST_PDF = [
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf',
  'react.pdf',
  'bootstrap.pdf',
  'material.pdf'
];

// le starter utilise flow au lieu des PropTypes (donc j'utilise pour ne aps perdre de temps à reconfigurer)
type PdfViewerState = {
  pdfDirectory: string,
  listPdf: Array<string>,
  isReady: boolean,
  totalPdf: number,
  pdfScale: number,
  index: number
};

class PdfViewer extends PureComponent {
  state: PdfViewerState;

  state = {
    pdfDirectory: '',
    listPdf: LIST_PDF,
    isReady: false,
    totalPdf: LIST_PDF.length,
    pdfScale: 0.80,
    index: 0
  };

  componentWillMount() {
    // evenèment de reception du répertoire des pdf
    ipcRenderer.on('reveivedPdfDirectory', this.handlesOnReveivedPdfDirectory);
  }

  componentDidMount() {
    // demande au Main le chemin des répertoires des pdf
    ipcRenderer.send('getPdfDirectory');
  }

  componentWillUpdate(nextProps: any, nextState: PdfViewerState) {
    const {
      pdfDirectory: prevPdfDirectory,
      listPdf: prevListPdf
    } = this.state;

    const {
      pdfDirectory: nextPdfDirectory,
      listPdf: nextListPdf
    } = nextState;

    // isReady flag l'affichage de la SwipeableView
    // (elle ne doit commencer à s'intancier que lorsque les urls sont toutes prêtes des pdfs )
    if (!this.urlsAreReady(prevPdfDirectory, prevListPdf) &&
        !this.urlsAreReady(nextPdfDirectory, nextListPdf)) {
      this.setState({ isReady: true });
    }
  }

  handlesOnReveivedPdfDirectory = (event: any, args: string) => {
    const pdfDirectory = args;
    this.setState({ pdfDirectory });
  }

  handlesOnPreviousClick = () => {
    const { index: currentIndex } = this.state;
    const updatedIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
    this.setState({ index: updatedIndex });
  }

  handlesOnNextClick = () => {
    const {
      index: currentIndex,
      totalPdf
    } = this.state;

    const updatedIndex = currentIndex < (totalPdf - 1)
      ? currentIndex + 1
      : currentIndex;

    this.setState({ index: updatedIndex });
  }

  handlesOnChangeIndex = () => {
    // ici au chamengement d'index on ajoute ce qu'on veut
  }

  /**
   * vérifie que le répertoire des pdf et que la liste des pdf est bien défini et non vide
   *
   * @memberof PdfViewer
   */
  urlsAreReady = (pdfDirectory: string, listPdf: Array<string>) => {
    const listPdfNotEmpty = listPdf.reduce((prev, next) => (next && (prev && (prev.length > 0))), false);
    const pdfDirectoryReady = pdfDirectory && (pdfDirectory.length > 0);

    return (listPdfNotEmpty && pdfDirectoryReady);
  }

  slideRenderer = (params: any) => {
    const {
      index: slideIndex,
      key
    } = params;

    const {
      pdfDirectory,
      listPdf,
      pdfScale
    } = this.state;

    const fileUrl = listPdf[slideIndex];

    // console.log('current pdf: ', `${pdfDirectory}${fileUrl}`);

    return (
      <div
        key={key}
        className={styles.pdfSwipeableViewsContainer}
      >
        <PDF
          file={`${pdfDirectory}/${fileUrl}`}
          scale={pdfScale}
          onDocumentationComplete={() => null}
          onPageComplete={() => null}
          page={1}
        />
      </div>
    );
  }

  render() {
    const {
      index,
      listPdf,
      isReady
    } = this.state;

    return (
      <div className={styles.pdfViewerContainer}>
        <div className={styles.pdfViewerTitleContainer}>
          <Link to="/">
            <i className="fa fa-home fa-2x" />
          </Link>
        </div>
        <div className={styles.pdfViewerContentContainer}>
          <SidePdfList
            list={listPdf}
            currentIndex={index}
          />
          <div className={styles.pdfSwipeableViewsContainer}>
            {
              isReady
              ?
                <VirtualizedSwipeableViews
                  index={index}
                  overscanSlideAfter={listPdf.length - 1 - index}
                  overscanSlideBefore={index + 1}
                  onChangeIndex={this.handlesOnChangeIndex}
                  slideRenderer={this.slideRenderer}
                />
              :
                <div>
                  <Spinner
                    spinnerName="circle"
                  />
                </div>
            }
          </div>
          <div className={styles.buttonContainer}>
            <Button
              text="précédent"
              type="previous"
              onClick={this.handlesOnPreviousClick}
            />
            <Button
              text="suivant"
              type="next"
              onClick={this.handlesOnNextClick}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PdfViewer;
