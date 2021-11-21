import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

const KONGPANIONROOT = 'https://api.kongregate.com/api/kongpanions/index.json';

const getAll =  function getAllKongpanions() {
  console.log('Start fetching:', KONGPANIONROOT);
  fetch(KONGPANIONROOT)
  .then(response => {
    console.log('Promise resolved');
    if (!response.ok) { throw new Error('Kongregate response was not OK!'); }
    return response.json()
  })
  .then(data => {
    return data;
  })
  .catch(error => {
    console.log('There has been an error while fetching a list of all Kongpanions:', error);
  })
};


console.log('Start of script!');
let dataAll = getAll();
console.log('End of script!');
console.log(dataAll);

let element = React.createElement('h1', { className: 'greeting' }, 'Hello, world!');
ReactDOM.render(element, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
