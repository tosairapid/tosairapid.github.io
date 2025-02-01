// GoogleスプレッドシートのCSVファイルのURL
const csvUrl = "https://docs.google.com/spreadsheets/d/1bf61OOjuj1DX9yfb79eo5zq7VCE7NVHJMB7McRH-NOI/export?format=csv&gid=2071154206";

// フィルタリングしたデータを格納する変数
let filteredData = [];

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

        // ヘッダー行を追加
        const headerRow = document.createElement('tr');
        rows[0].forEach(cell => {
            const th = document.createElement('th');
            th.textContent = cell.trim();
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // データ行の追加と参加者リストの作成
        rows.slice(1).forEach((row, index) => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell.trim();
                tr.appendChild(td);
            });

            if (index > 0) {
                participants.add(row[0].trim()); // 1列目（インデックス0）を参加者と仮定
            }

            table.appendChild(tr);
        });

        // 4列目（インデックス3）でソート
        const sortedRows = Array.from(table.rows).slice(1); // ヘッダー行を除外
        sortedRows.sort((a, b) => {
            const rankA = parseFloat(a.cells[3]?.textContent); // 4列目（インデックス3）を順位として取得
            const rankB = parseFloat(b.cells[3]?.textContent);
            return rankB - rankA; // 昇順にソート
        });

        // ソート後の行を再追加
        sortedRows.forEach(row => table.appendChild(row));

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

        // セレクトボックスの変更イベントを設定
        select.addEventListener('change', function() {
            const selectedUser = select.value;
            if (selectedUser) {
                window.location.href = `result?user=${encodeURIComponent(selectedUser)}`;
            } else {
                filterTableAndPlot(); // すべて表示
            }
        });

    } catch (error) {
        output.textContent = `エラー: ${error.message}`;
    }
}

// フィルタリングとテーブル作成
function filterTableAndPlot() {
    const selectedUser = document.getElementById('participantSelect').value.toLowerCase();
    const table = document.getElementById('csvTable');
    const rows = table.getElementsByTagName('tr');
    filteredData = []; // フィルタリングされたデータを再初期化

    for (let i = 1; i < rows.length; i++) { // ヘッダー行を除く
        const cells = rows[i].getElementsByTagName('td');
        const participant = cells[0]?.textContent.toLowerCase(); // 1列目（インデックス0）を参加者と仮定
        const rank = parseFloat(cells[3]?.textContent); // 4列目（インデックス3）を順位と仮定

        if (!selectedUser || participant === selectedUser) {
            rows[i].style.display = ''; // 該当行を表示

            if (!isNaN(rank)) {
                filteredData.push({ participant, rank }); // フィルタリングされたデータも格納
            }
        } else {
            rows[i].style.display = 'none'; // 該当しない行を非表示
        }
    }
}

// ページ読み込み時にCSVを表示
document.addEventListener('DOMContentLoaded', loadCSV);
