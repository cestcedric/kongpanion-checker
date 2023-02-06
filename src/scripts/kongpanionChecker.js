const kongpanionOverviewPath = 'https://www.kongregate.com/kongpanions';

const allKongpanionsPath =
  'https://api.kongregate.com/api/kongpanions/index.json';
const userKongPanionsPath = (user) =>
  `https://api.kongregate.com/api/kongpanions.json?username=${user}`;

const addDestination = (dest) => {
  const destinationList = document.getElementById('destinations');
  const item = document.createElement('li');
  item.appendChild(document.createTextNode(dest));
  destinationList.appendChild(item);
};

document.addEventListener('DOMContentLoaded', () => {
  // initial loading of hardcoded list
  destinations.forEach(addDestination);

  // update list and display new submission
  document.querySelector('#submit').addEventListener('click', () => {
    const input = document.querySelector('input');
    addDestination(input.value);
    input.value = '';
  });
});
