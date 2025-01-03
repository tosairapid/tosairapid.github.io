window.onload = openModal
let version = "var.2025/01/03/11:30"
function openModal() {
  // 利用規約への同意がまだなされていない場合にモーダルを表示
  if (!getCookie(`terms_accepted_${version}`)) {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('main').style.display = 'none'; // メインコンテンツを隠す
    document.getElementById("version").innerText = version;
    loadTerms(); // 利用規約をロード
  } else {
    document.getElementById('main').style.display = 'block'; // 同意済みの場合、メインコンテンツを表示
    document.getElementById("version").innerText = version;
  }
}
        
function Modal() {
  document.getElementById('modal').style.display = 'block';
  document.getElementById('main').style.display = 'none'; // メインコンテンツを隠す
  document.getElementById("version").innerText = version;
  loadTerms(); // 利用規約をロード
}

function closeModal() {
  // 利用規約に同意したことをCookieに保存
  setCookie(`terms_accepted_${version}`, 'true', 365); // 365日間保存
  document.getElementById('modal').style.display = 'none';
  document.getElementById('main').style.display = 'block'; // メインコンテンツを再表示
}

// Cookieを設定する関数
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
    }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return c.substring(nameEQ.length, c.length);
    }
  return null;
}

function loadTerms() {
  fetch('html/terms.html')
  .then(response => {
    if (!response.ok) {
      throw new Error('利用規約の読み込みに失敗しました');
    }
    return response.text();
  })
  .then(data => {
    document.getElementById('modal-content').innerHTML = data;
  })   
  .catch(error => {
    console.error(error);
    document.getElementById('modal-content').innerHTML = '<p>利用規約を読み込めませんでした。</p>';
  });
}
