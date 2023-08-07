
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
	const rinu_regex = /^https?:\/\/rinu.cf\/[\w/:%#\$&\?\(\)~\.=\+\-]+$/;
	const toku_regex = /^https?:\/\/tokutei.cf\/\?url=[\w/:%#\$&\?\(\)~\.=\+\-]+$/;

	if (!rinu_regex.test(url)) {
		load.textContent = "rinu.cfのURLを入力してください。";
		return;
	}

	let url_code = url.substring(16);

	let dat = await (await fetch(`https://api.activetk.jp/urlmin/get?code=${url_code}`)).json();

	console.log(dat);

	let go_url = "http://example.com/";

	if (toku_regex.test(dat["LinkURL"])) {
		load.textContent = "特定ツール有";
		load.classList.add("red_text");
		go_url = decodeURIComponent(getParam("url", dat["LinkURL"]));
	}
	else {
		load.textContent = "特定ツールなし";
		go_url = dat["LinkURL"];
	}



	detail.innerHTML = "詳細情報<br><br>" +
		`作成者IPアドレス: <a href=${dat["CreatorInfo"]["MoreInformation"]}>${dat["CreatorInfo"]["IPAddress"]}</a><br>` +
		`IPからわかる場所: ${dat["CreatorInfo"]["Location"]}<br>` +
		`遷移先URL: <a href="${go_url}">${go_url}</a><br>` +
		`作成日: ${dat["CreatedDateTime"]}<br>` +
		`使用回数: ${dat["UsedCount"]}`;
}
