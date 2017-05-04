/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import PdfViewerPage from './containers/PdfViewerPage';

export default () => (
  <App>
    <Switch>
      <Route path="/pdfviewer" component={PdfViewerPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
