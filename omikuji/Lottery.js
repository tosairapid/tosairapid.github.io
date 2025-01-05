let stations = [];
let config = {};

// JSONファイルを読み込む
Promise.all([
  fetch("json/omokuji.json").then(response => response.json()),
])
  .then(([omikujiData]) => {
    omijuji = omikujiData;
  })
  .catch(error => console.error("Error loading data:", error));

function drawLottery() {
  if (omikuji.length === 0) {
    alert("データが正常に読み込まれませんでした。");
    return;
  }

  const randomIndex = Math.floor(Math.random() * stations.length);
  const result = omijuji[randomIndex];

  // 結果を表示
  document.getElementById("result").innerText = result.name;
  document.getElementById("resultp").innerText = result.setsumei;

  // 抽選時間を表示
  document.getElementById("time").innerText = new Date()
}
