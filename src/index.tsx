import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "fontsource-roboto";
import store from './store'
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';

const render = () => {
  const App = require("./App").default;
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

render();

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', render)
}

reportWebVitals();