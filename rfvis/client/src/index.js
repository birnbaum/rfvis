import React from 'react';
import ReactDOM from 'react-dom';
import {applyMiddleware, createStore} from 'redux';

import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from './containers/App';
import { Provider } from "react-redux";
import {createLogger} from 'redux-logger';
import rootReducer from "./reducers";

const logger = createLogger({
    predicate: (getState, action) => action.type.indexOf("HOVER") === -1
});

const store = createStore(
    rootReducer,
    applyMiddleware(logger)
);

ReactDOM.render((
    <Provider store={store}>
        <App />
    </Provider>
), document.getElementById('root'));
