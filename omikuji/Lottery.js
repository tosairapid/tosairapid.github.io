let omikuji = [];

// JSONファイルを読み込む
fetch("omikuji.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    omikuji = data;
  })
  .catch(error => {
    console.error("Error loading data:", error);
    alert("データの読み込みに失敗しました。");
  });

function drawLottery() {
  if (omikuji.length === 0) {
    alert("データが正常に読み込まれませんでした。");
    return;
  }

  const randomIndex = Math.floor(Math.random() * omikuji.length);
  const result = omikuji[randomIndex];

  // `setsumei`をランダムに選ぶ
  const setsumeiArray = result.setsumei || ["説明がありません"];
  const randomSetsumeiIndex = Math.floor(Math.random() * setsumeiArray.length);
  const randomSetsumei = setsumeiArray[randomSetsumeiIndex];

  // 結果を表示
  document.getElementById("result").innerText = result.name || "名前がありません";
  document.getElementById("resultp").innerText = randomSetsumei;

  // 抽選時間を表示
  document.getElementById("time").innerText = new Date();
}
