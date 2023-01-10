import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import store, { persistor } from "./store/store";
import { Provider } from "react-redux";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./i18n";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { updateReady } from "./store/reducers/uiReducer";
import { PersistGate } from "redux-persist/integration/react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      store.dispatch(updateReady(waitingServiceWorker));
    }
  },
});

reportWebVitals();
