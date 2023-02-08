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
    .then((data) => data.kongpanions)
    .catch((error) => {
      console.log(error);
    });
};

const getUserKpans = async (user) => {
  return fetch(corsProxy(userKongPanionsPath(user)))
    .then((response) => response.json())
    .then((data) => JSON.parse(data.contents))
    .then((data) => {
      if (data.success) return data.kongpanions;
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

const drawKpans = (kpans, parentId) => {
  const parent = document.getElementById(parentId);

  const kpanRows = kpans.map(
    ({ description, id, name, normal_icon_url, shiny_icon_url, shiny }) => {
      const kpanRow = document.createElement('tr');

      const normalCol = document.createElement('th');
      if (normal_icon_url !== undefined) {
        const normalImg = document.createElement('img');
        normalImg.src = normal_icon_url;
        normalCol.appendChild(normalImg);
      }

      const shinyCol = document.createElement('th');
      if (shiny || shiny === undefined) {
        const shinyImg = document.createElement('img');
        shinyImg.src = shiny_icon_url;
        shinyCol.appendChild(shinyImg);
      }

      const textCol = document.createElement('th');
      const nameElement = document.createElement('h4');
      const descriptionElement = document.createElement('p');
      nameElement.innerHTML = `${id} - ${name}`;
      descriptionElement.innerHTML = description;
      textCol.appendChild(nameElement);
      textCol.appendChild(descriptionElement);

      kpanRow.appendChild(normalCol);
      kpanRow.appendChild(shinyCol);
      kpanRow.appendChild(textCol);

      return kpanRow;
    }
  );

  parent.replaceChildren(...kpanRows);
};

const getMissingKpans = (allKpans, userKpans) => {
  const userKpanDict = userKpans.reduce((userKpanDict, kpan) => {
    userKpanDict[kpan.id] = kpan;
    return userKpanDict;
  });

  const missingKpans = allKpans.map((kpan) => {
    if (userKpanDict[kpan.id] === undefined) {
      return {
        description: kpan.description,
        id: kpan.id,
        name: kpan.name,
        normal_icon_url: kpan.normal_icon_url,
        shiny_icon_url: kpan.shiny_icon_url,
      };
    }
    if (!userKpanDict[kpan.id].shiny) {
      return {
        description: kpan.description,
        id: kpan.id,
        name: `${kpan.name} (shiny)`,
        shiny_icon_url: kpan.shiny_icon_url,
      };
    }
  });

  return missingKpans.filter((kpan) => kpan);
};

document.addEventListener('DOMContentLoaded', async () => {
  const compKpans = (a, b) => a.id - b.id;

  const weeklyKpan = await getWeeklyKpan();
  addWeeklyKpanInfo(weeklyKpan);

  const allKpans = await getAllKpans();
  allKpans.sort(compKpans);
  drawKpans(allKpans, 'allKpans');

  const handleUserKpans = async () => {
    const user = document.querySelector('input').value;

    const userKpans = await getUserKpans(user);
    userKpans.sort(compKpans);
    drawKpans(userKpans, 'collectedKpans');

    const missingKpans = getMissingKpans(allKpans, userKpans);
    missingKpans.sort(compKpans);
    drawKpans(missingKpans, 'missingKpans');
  };

  document.querySelector('#submit').addEventListener('click', handleUserKpans);
  document.querySelector('#usernameInput').addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
      handleUserKpans();
    }
  });
  document
    .querySelector('#usernameInput')
    .addEventListener('change', handleUserKpans);
});
