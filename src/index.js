import React from 'react';
import ReactDOM from 'react-dom';
import {applyMiddleware, compose, createStore} from 'redux';

import './index.css';
import App from './containers/App';
import { Provider } from "react-redux";
import logger from 'redux-logger';
import rootReducer from "./reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    rootReducer,
    composeEnhancers(
        applyMiddleware(logger)
    )
);

ReactDOM.render((
    <Provider store={store}>
        <App />
    </Provider>
), document.getElementById('root'));
