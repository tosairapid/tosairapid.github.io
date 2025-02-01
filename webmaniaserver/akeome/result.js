// GoogleスプレッドシートのCSVファイルのURL

const csvUrl = "https://docs.google.com/spreadsheets/u/0/d/1bf61OOjuj1DX9yfb79eo5zq7VCE7NVHJMB7McRH-NOI/export?format=csv";

const secondCsvUrl = "https://docs.google.com/spreadsheets/d/1bf61OOjuj1DX9yfb79eo5zq7VCE7NVHJMB7McRH-NOI/export?format=csv&gid=2071154206"; // 2つ目のCSVのURL


// 散布図と円グラフ用のグローバル変数

let scatterChart, pieChart;

let filteredData = []; // フィルタリングしたデータを格納

let secondCsvData = {}; // 2つ目のCSVデータをユーザー名ごとに格納


// URLパラメータから参加者を取得

function getUserFromURL() {

    const urlParams = new URLSearchParams(window.location.search);

    return urlParams.get('user') || ''; // 'user' パラメータを取得

}


// CSVをロードしてテーブルとセレクトボックスを作成

async function loadCSV() {

    const output = document.getElementById('output');

    const select = document.getElementById('participantSelect');

    output.innerHTML = ''; // 初期化

    select.innerHTML = '<option value="">すべて表示</option>'; // セレクトボックス初期化

    // セレクトボックスを編集不可にする
    select.disabled = true;

    try {

        const response = await fetch(csvUrl);

        if (!response.ok) {

            throw new Error('CSVファイルを取得できませんでした。');

        }

        const csvText = await response.text();

        const rows = csvText.split('\n').map(row => row.split(','));

        const participants = new Set(); // 重複しない参加者リスト

        filteredData = [];


        // テーブル生成

        const table = document.createElement('table');

        table.id = 'csvTable'; // テーブルにIDを設定（フィルタ用）


        rows.forEach((row, index) => {

            const tr = document.createElement('tr');

            row.forEach(cell => {

                const td = document.createElement(index === 0 ? 'th' : 'td');

                td.textContent = cell.trim();

                tr.appendChild(td);

            });


            if (index > 0) {

                participants.add(row[1].trim()); // 2列目（インデックス1）を参加者と仮定

            }


            table.appendChild(tr);

        });


        output.appendChild(table);


        // 参加者をアルファベット順にソート

        const sortedParticipants = Array.from(participants).sort();


        // セレクトボックスに参加者を追加（アルファベット順）

        sortedParticipants.forEach(participant => {

            const option = document.createElement('option');

            option.value = participant;

            option.textContent = participant;

            select.appendChild(option);

        });


        // 2つ目のCSVをロード

        await loadSecondCSV();


        // URLパラメータがある場合は、選択された参加者を反映

        const selectedUser = getUserFromURL();

        if (selectedUser) {

            select.value = selectedUser;

            filterTableAndPlot();

        } else {

            filterTableAndPlot(); // 初期状態でフィルタリングを適用

        }


    } catch (error) {

        output.textContent = `エラー: ${error.message}`;

    }

}


// 2つ目のCSVデータを表示

async function loadSecondCSV() {

    const secondCsvOutput = document.getElementById('secondCsvOutput');

    secondCsvOutput.innerHTML = ''; // 初期化


    try {

        const response = await fetch(secondCsvUrl);

        if (!response.ok) {

            throw new Error('2つ目のCSVファイルを取得できませんでした。');

        }

        const csvText = await response.text();

        const rows = csvText.split('\n').map(row => row.split(','));


        // テーブル生成

        const table = document.createElement('table');

        table.id = 'secondCsvTable'; // テーブルにIDを設定


        // 1行目（ヘッダー）を表示

        const headerRow = document.createElement('tr');

        // 必要なデータ項目を追加

        const headers = ['参加者', '勝率', '参加率', 'ポイント', '参加回数', '初参加日', '最終参加日'];

        headers.forEach(header => {

            const th = document.createElement('th');

            th.textContent = header;

            headerRow.appendChild(th);

        });

        table.appendChild(headerRow);


        // データ行を表示

        for (let i = 1; i < rows.length; i++) {

            const row = rows[i].map(cell => cell.trim());

            const tr = document.createElement('tr');

            row.slice(1).forEach((cell, index) => { // ヘッダー以外のデータ

                const td = document.createElement('td');

                td.textContent = cell;

                tr.appendChild(td);

            });

            table.appendChild(tr);

        }


        secondCsvOutput.appendChild(table);


        // データをオブジェクトに格納

        const header = rows[0].map(cell => cell.trim().toLowerCase()); // 小文字化

        for (let i = 1; i < rows.length; i++) {

            const row = rows[i].map(cell => cell.trim());

            const userName = row[0]?.toLowerCase(); // 1列目をユーザー名とする

            if (userName) {

                secondCsvData[userName] = row.slice(1); // ユーザー名以降のデータを保存

            }

        }

    } catch (error) {

        console.error(`2つ目のCSV読み込みエラー: ${error.message}`);

        secondCsvOutput.textContent = `エラー: ${error.message}`;

    }

}


// フィルタリングと散布図、円グラフ作成

function filterTableAndPlot() {

    const selectedUser = document.getElementById('participantSelect').value.toLowerCase();

    const table = document.getElementById('csvTable');

    const rows = table.getElementsByTagName('tr');

    const data = []; // 散布図データ用

    const rankCounts = {}; // 順位ごとのカウント

    filteredData = []; // フィルタリングされたデータを再初期化


    for (let i = 1; i < rows.length; i++) { // ヘッダー行を除く

        const cells = rows[i].getElementsByTagName('td');

        const participant = cells[1]?.textContent.toLowerCase(); // 2列目（インデックス1）を参加者と仮定

        const rank = cells[2]?.textContent.trim(); // 3列目（インデックス2）を順位と仮定


        if (!selectedUser || participant === selectedUser) {

            rows[i].style.display = ''; // 該当行を表示


            if (rank) {

                data.push({ x: i, y: rank === 'ﾌﾗｲﾝｸﾞ' ? 0 : parseFloat(rank) }); // 散布図のデータとして行番号と順位を使用

                filteredData.push({ participant, rank }); // フィルタリングされたデータも格納


                // 順位ごとのカウントを更新

                rankCounts[rank] = (rankCounts[rank] || 0) + 1;

            }

        } else {

            rows[i].style.display = 'none'; // 該当しない行を非表示

        }

    }


    // 2つ目のCSVデータを表示

    const secondCsvOutput = document.getElementById('secondCsvOutput');

    secondCsvOutput.innerHTML = ''; // 初期化

    if (selectedUser && secondCsvData[selectedUser]) {

        const table = document.createElement('table');


        // 追加データを <th> で表示（ヘッダー）

        const headerRow = document.createElement('tr');

        const headers = ['勝率', '参加率', 'ポイント', '参加回数']; // 例としてヘッダーを設定

        headers.forEach(header => {

            const th = document.createElement('th');

            th.textContent = header;

            headerRow.appendChild(th);

      });

        table.appendChild(headerRow);


        // 追加データを <td> で表示

        const dataRow = document.createElement('tr');

        secondCsvData[selectedUser].forEach(cell => {

        const td = document.createElement('td');

        td.textContent = cell;

        dataRow.appendChild(td);

    });

    table.appendChild(dataRow);


    secondCsvOutput.appendChild(table);

}


    if (selectedUser !== "") {

        updateScatterChart(data);

        updatePieChart(rankCounts);

    } else {

        if (scatterChart) scatterChart.destroy();

        if (pieChart) pieChart.destroy();

    }

}


// 散布図を更新

function updateScatterChart(data) {

    const ctx = document.getElementById('scatterChart').getContext('2d');


    if (scatterChart) {

        scatterChart.destroy();

    }


    scatterChart = new Chart(ctx, {

        type: 'scatter',

        data: {

            datasets: [{

                label: '順位',

                data: data,

                backgroundColor: 'rgba(75, 192, 192, 0.6)', // 透過を戻す

                borderColor: 'rgba(75, 192, 192, 1)',

                borderWidth: 1

            }]

        },

        options: {

            responsive: true,

            scales: {

                x: {

                    type: 'linear',

                    position: 'bottom'

                },

                y: {

                    reverse: true // 縦軸を反転

                }

            }

        }

    });

}


// 円グラフの更新

function updatePieChart(rankCounts) {

    const ctx = document.getElementById('pieChart').getContext('2d');


    if (pieChart) {

        pieChart.destroy(); // 既存の円グラフを削除

    }


    // 円グラフ用のデータ

    const labels = Object.keys(rankCounts);

    const data = labels.map(rank => rankCounts[rank]);


    pieChart = new Chart(ctx, {

        type: 'pie',

        data: {

            labels: Object.keys(rankCounts).map(rank => {

                // "ﾌﾗｲﾝｸﾞ"がそのまま表示されるように処理

                return rank === 'ﾌﾗｲﾝｸﾞ' ? 'ﾌﾗｲﾝｸﾞ' : `${rank}位`;

            }),

            datasets: [{

                label: '順位の割合',

                data: data,

                backgroundColor: [

                    'rgba(255, 99, 132, 0.2)',

                    'rgba(54, 162, 235, 0.2)',

                    'rgba(255, 206, 86, 0.2)',

                    'rgba(75, 192, 192, 0.2)',

                    'rgba(153, 102, 255, 0.2)',

                    'rgba(255, 159, 64, 0.2)'

                ], // 透明度を0.2に設定

                borderColor: [

                    'rgba(255, 99, 132, 1)',

                    'rgba(54, 162, 235, 1)',

                    'rgba(255, 206, 86, 1)',

                    'rgba(75, 192, 192, 1)',

                    'rgba(153, 102, 255, 1)',

                    'rgba(255, 159, 64, 1)'

                ],

                borderWidth: 1

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: 'top', // グラフのラベル位置

                },

                tooltip: {

                    callbacks: {

                        label: function (tooltipItem) {

                            const percentage = Math.round((tooltipItem.raw / data.reduce((acc, value) => acc + value, 0)) * 100);

                            return `${tooltipItem.raw}回 (${percentage}%)`;

                        }

                    }

                }

            }

        }

    });

}


// ページ読み込み時にCSVを表示

document.addEventListener('DOMContentLoaded', loadCSV);
