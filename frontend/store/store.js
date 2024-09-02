import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import logger from 'redux-logger';




const rootReducer = combineReducers({

});

let enhancer;
if (import.meta.env.MODE === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
//   const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
    const store = createStore(rootReducer, preloadedState, enhancer);

    // Expose the store for development
    if (import.meta.env.MODE !== 'production') {
        console.log('Setting window.store');
    window.store = store;
  }
    
  return store;

};
  

export default configureStore;