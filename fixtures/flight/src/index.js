import * as React from 'react';
import {Suspense} from 'react';
import ReactDOM from 'react-dom';
import ReactTransportDOMClient from 'react-transport-dom-webpack';

let data = ReactTransportDOMClient.createFromFetch(
  fetch('http://localhost:3001')
);

function Content() {
  return data.readRoot();
}

ReactDOM.render(
  <Suspense fallback={<h1>Loading...</h1>}>
    <Content />
  </Suspense>,
  document.getElementById('root')
);

// Reference server entrypoints so we know what client bundles to produce
// TODO: how should this be done?
() => import('./App.server.js');
