// GoogleスプレッドシートのCSVファイルのURL
const csvUrl = "https://docs.google.com/spreadsheets/u/0/d/1bf61OOjuj1DX9yfb79eo5zq7VCE7NVHJMB7McRH-NOI/export?format=csv";

// 散布図と円グラフ用のグローバル変数
let scatterChart, pieChart;
let filteredData = []; // フィルタリングしたデータを格納する変数

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
        const rank = parseFloat(cells[2]?.textContent); // 3列目（インデックス2）を順位と仮定

        if (!selectedUser || participant === selectedUser) {
            rows[i].style.display = ''; // 該当行を表示

            if (!isNaN(rank)) {
                data.push({ x: i, y: rank }); // 散布図のデータとして行番号と順位を使用
                filteredData.push({ participant, rank }); // フィルタリングされたデータも格納

                // 順位ごとのカウントを更新
                rankCounts[rank] = (rankCounts[rank] || 0) + 1;
            }
        } else {
            rows[i].style.display = 'none'; // 該当しない行を非表示
        }
    }

    // 「すべて表示」が選ばれていない場合にのみ散布図を表示
    if (selectedUser !== "") {
        updateScatterChart(data);
        updatePieChart(rankCounts);
    } else {
        if (scatterChart) {
            scatterChart.destroy(); // すべて表示の場合はチャートを削除
        }
        if (pieChart) {
            pieChart.destroy(); // すべて表示の場合は円グラフを削除
        }
    }
}

// 散布図の更新
function updateScatterChart(data) {
    const ctx = document.getElementById('scatterChart').getContext('2d');

    if (scatterChart) {
        scatterChart.destroy(); // 既存のチャートを削除
    }

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '順位の散布図',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: '行番号' },
                    beginAtZero: true
                },
                y: {
                    title: { display: true, text: '順位' },
                    beginAtZero: true
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
            labels: labels,
            datasets: [{
                label: '順位の割合',
                data: data,
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const percentage = Math.round((tooltipItem.raw / data.reduce((acc, value) => acc + value, 0)) * 100);
                            return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ページ読み込み時にCSVを表示
document.addEventListener('DOMContentLoaded', loadCSV);
