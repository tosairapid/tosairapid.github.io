// RSSフィードのURL
const rssUrl = 'https://note.com/tanasn_o38/m/m78e49f58ffab/rss';

// RSSフィードを非同期で取得する関数
async function fetchRSS() {
  try {
    const response = await fetch(rssUrl);
    const xmlString = await response.text();
    parseRSS(xmlString);
  } catch (error) {
    console.error('RSSフィードの取得に失敗しました:', error);
  }
}

// RSSフィードのXMLをパースする関数
function parseRSS(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  // <item>要素を取得
  const items = xmlDoc.getElementsByTagName("item");

  // 各item内のhref属性を取得し、<iframe>を埋め込む
  Array.from(items).forEach(item => {
    const link = item.getElementsByTagName("link")[0].textContent;
    const noteId = extractNoteIdFromLink(link);
    if (noteId) {
      writeIframeToHTML(noteId);  // HTMLに直接<iframe>を埋め込む
    }
  });
}

// リンクからノートIDを抽出する関数
function extractNoteIdFromLink(link) {
  const match = link.match(/note\.com\/.*\/m\/(.+)/);
  return match ? match[1] : null;
}

// HTMLに直接iframeを埋め込む関数
function writeIframeToHTML(noteId) {
  const iframeContainer = document.getElementById('iframe-container');
  
  // 埋め込むHTML
  const iframeHTML = `
    <iframe class="note-embed" src="https://note.com/embed/notes/${noteId}" height="400"></iframe>
    <script async src="https://note.com/scripts/embed.js" charset="utf-8"></script>
  `;
  
  // iframeHTMLを直接追加
  iframeContainer.innerHTML += iframeHTML;
}

// RSSフィードの取得と表示
fetchRSS();
