let stations = [];
let config = {};

// JSONファイルを読み込む
Promise.all([
  fetch("json/stations.json").then(response => response.json()),
  fetch("json/config.json").then(response => response.json())
])
  .then(([stationsData, configData]) => {
    stations = stationsData;
    config = configData;
  })
  .catch(error => console.error("Error loading data:", error));

function drawLottery() {
  if (stations.length === 0) {
    alert("駅データが読み込まれていません");
    return;
  }

  const randomIndex = Math.floor(Math.random() * stations.length);
  const result = stations[randomIndex];

  // 駅名を表示
  document.getElementById("result").innerText = result.name;

  // 駅番号を処理して画像を表示
  const imgDiv = document.getElementById("img");
  imgDiv.innerHTML = result.numbers.map(num =>
    `<img src="${config.imageBaseUrl}${num}.png" alt="${num}">`
  ).join('');

  // 駅情報リンクと地図リンクを表示
  document.getElementById("info").innerHTML = `
    <button type="button" onclick="window.open('${encodeURI(`https://maps.google.com/maps?ie=UTF8&f=d&dirflg=r&saddr=現在地&daddr=${result.name.trim()}駅`)}', '_blank')">行き方を調べる</button>
    <button type="button" onclick="window.open('${encodeURI(`${config.stationInfoBaseUrl}${result.numbers[0]}`)}', '_blank')">駅情報を見る</button>
  `;

  // 抽選時間を表示
  document.getElementById("time").innerText = new Date()
}
