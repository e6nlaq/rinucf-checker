
/**
 * https://www-creators.com/archives/4463#JavascriptjQueryURL
 * Get the URL parameter value
 *
 * @param  name {string} パラメータのキー文字列
 * @return  url {url} 対象のURL文字列（任意）
 */
function getParam(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}


async function check() {
	let load = document.getElementById("loading");
	let detail = document.getElementById("detail");

	load.textContent = "取得中...";
	detail.textContent = "";

	load.classList.remove("red_text");

	let url = document.getElementById("url").value;

	// なんと汚い正規表現なのでしょう
	const rinu_regex = /^https?:\/\/rinu\.(cf|jp)\/[\w/:%#\$&\?\(\)~\.=\+\-]+$/;
	const toku_regex = /^https?:\/\/(tokutei\.cf|tokutei\.end2end\.tech)\/\?url=[\w/:%#\$&\?\(\)~\.=\+\-]+$/;

	if (!rinu_regex.test(url)) {
		load.textContent = "rinu.cf or rinu.jpのURLを入力してください。";
		return;
	}

	let url_code = "";
	if (url.substring(0, 5) === "https")
		url_code = url.substring(16);
	else
		url_code = url.substring(15);

	let dat = await (await fetch(`https://api.activetk.jp/urlmin/get&code=${url_code}`)).json();

	console.log(`Send Code:${url_code}`);
	console.log(dat);

	let go_url = "http://example.com/";

	if (dat["status"] != "OK") {
		load.textContent = "エラー";
		if (dat["type"] == 404) {
			detail.textContent = "URLが存在しません。もう一度お確かめの上、再試行してください。(404)";
		} else {
			detail.textContent = `申し訳ございません。予期せぬエラーが発生しました。(${dat["type"]})`;
		}
		return;
	}

	if (toku_regex.test(dat["LinkURL"])) {
		load.textContent = "特定ツール有";
		load.classList.add("red_text");
		go_url = getParam("url", dat["LinkURL"]);
	}
	else {
		load.textContent = "特定ツールなし";
		go_url = dat["LinkURL"];
	}

	const last_use_ip = dat["LastUsed"].substring(11);

	let ipinfo = await (await fetch(`https://www.ipinfo.io/${dat["CreatorInfo"]["IPAddress"]}/json`)).json();

	detail.innerHTML = "詳細情報<br><br>" +
		`作成者IPアドレス: <a href=${dat["CreatorInfo"]["MoreInformation"]}>${dat["CreatorInfo"]["IPAddress"]}</a><br>` +
		`作成者タイムゾーン: ${dat["CreatorInfo"]["TimeZone"]}<br>` +
		`IPからわかる場所: ${dat["CreatorInfo"]["Location"]}<br>` +
		`郵便番号: ${ipinfo["postal"]}<br>` +
		`ASN: ${ipinfo["org"]}<br><br>` +
		`遷移先URL: <a href="${go_url}">${decodeURIComponent(go_url)}</a><br>` +
		`作成日: ${dat["CreatedDateTime"]}<br>` +
		`使用回数: ${dat["UsedCount"]}<br>` +
		`最後に使用したユーザーのIPアドレス: <a href="https://ipinfo.io/${last_use_ip}">${last_use_ip}</a>`;
}

async function paste() {

	let url = document.getElementById("url");
	await navigator.clipboard.readText().then(
		(clip) => {
			url.value = clip;
		}
	);

	// alert(navigator.clipboard.readText());

	check();
}
