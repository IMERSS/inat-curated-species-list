import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Standalone from './Standalone';
import reportWebVitals from './reportWebVitals';

let Component = App;

// for working on/building the standalone version, just change this boolean.
const isStandalone = true;
if (isStandalone) {
    Component = Standalone;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Component />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
