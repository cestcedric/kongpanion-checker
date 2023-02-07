// Proxy from https://github.com/gnuns/allorigins
const corsProxy = (url) => {
  return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
};

const kongpanionOverviewPath = 'https://www.kongregate.com/kongpanions';

const allKongpanionsPath =
  'https://api.kongregate.com/api/kongpanions/index.json';
const userKongPanionsPath = (user) =>
  `https://api.kongregate.com/api/kongpanions.json?username=${user}`;

const getAllKpans = async () => {
  return fetch(allKongpanionsPath)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

const getUserKpans = async (user) => {
  return fetch(corsProxy(userKongPanionsPath(user)))
    .then((response) => response.json())
    .then((data) => JSON.parse(data.contents))
    .then((data) => {
      if (data.success) return data;
      throw new Error(data.error_description);
    })
    .catch((error) => window.alert(`Oh no!\n${error}`));
};

const getWeeklyKpan = async () => {
  return fetch(corsProxy(kongpanionOverviewPath))
    .then((response) => response.json())
    .then(traverseDomWeeklyKpan)
    .catch((error) => console.log(error));
};

const traverseDomWeeklyKpan = (data) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(data.contents, 'text/html');
  const kpanContent = Array.from(
    content.getElementsByClassName('cur_kpan regtext ')[0].childNodes
  );

  const kpanImg = kpanContent[1].src;
  const kpanImgAlt = kpanContent[1].alt;
  const kpanName = Array.from(
    Array.from(kpanContent[3].childNodes)[1].childNodes
  )[0].data;
  const kpanDescription = kpanContent[5].innerText;

  return { kpanImg, kpanImgAlt, kpanName, kpanDescription };
};

const addWeeklyKpanInfo = ({
  kpanImg,
  kpanImgAlt,
  kpanName,
  kpanDescription,
}) => {
  const imgDiv = document.getElementById('weeklyKpanImg');
  const img = document.createElement('img');
  img.src = kpanImg;
  img.alt = kpanImgAlt;
  imgDiv.appendChild(img);

  const textDiv = document.getElementById('weeklyKpanText');
  const nameElement = document.createElement('h4');
  const descriptionElement = document.createElement('p');
  nameElement.innerHTML = kpanName;
  descriptionElement.innerHTML = kpanDescription;
  textDiv.appendChild(nameElement);
  textDiv.appendChild(descriptionElement);
};

document.addEventListener('DOMContentLoaded', async () => {
  const weeklyKpan = await getWeeklyKpan();
  addWeeklyKpanInfo(weeklyKpan);

  document.querySelector('#submit').addEventListener('click', async () => {
    const user = document.querySelector('input').value;

    const allKpans = await getAllKpans();
    const userKpans = await getUserKpans(user);
  });
});
