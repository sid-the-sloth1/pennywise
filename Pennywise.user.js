// ==UserScript==
// @name         Pennywise
// @namespace   hardy.pennywise
// @version      3.1
// @description  Records your transactions
// @author       Hardy[2131687]
// @match        https://www.torn.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      script.google.com
// @updateURL    http://localhost:8000/storage/shared/Android/data/io.spck/files/pennywise/Pennywise.user.js
// ==/UserScript==

(function() {
    'use strict';
    let settings = {"penny_bazaar": isChecked("bazaar", 1), "penny_imarket": isChecked("imarket", 1), "penny_points": isChecked("points", 1)};
    console.log(settings);
    //Creating an  Options box on Preferences page by adding the above defined HTML
    if (window.location.href.includes("/preferences.php")) {
        addSettingsBox();
    }


    //defining a function to send data to your Webapp
    function sendDatatoWebapp(x) {
        console.log(x);
    }
    //This function is to get the name of country from where you buy stuff from.
    function getcountry() {
        var penny_country_array = ["Mexico",
                                   "Switzerland",
                                   "UAE",
                                   "Cayman Islands",
                                   "Canada",
                                   "Hawaii",
                                   "United Kingdom",
                                   "Argentina",
                                   "Japan",
                                   "China",
                                   "South Africa"];
        var penny_country = document.getElementsByClassName('msg right-round')[1].childNodes[1].childNodes[0].data;
        if (penny_country_array.indexOf(penny_country) !== -1) {
            var penny_return = penny_country;
        }
        return penny_return;
    }

    //Bazaar log. Because Ched changed the way Bazaar Requests work. They now use Fetch
    let original_fetch = unsafeWindow.fetch;
    unsafeWindow.fetch = async (input, init) => {
        let response = await original_fetch(input, init);
        let respo = response.clone();
        respo.json().then((data) => {
            if (input == "/bazaar.php?sid=bazaarData&step=buyItem" && data.success) {
                let formData = {
                    itemName: /\sx\s(.*)\sfrom\s/.exec(data.text)[1]
                };
                for (let key of init.body.keys()) {
                    formData[key] = init.body.get(key);
                }
                formData.userName = /\sfrom\s(.*)\'/.exec(data.text)[1];
                formData.type = 'bazaar';
                sendDatatoWebapp(formData);
            }
        });
        return response;
    };
    //Main part of the script. It catches AJAX responses and parses them. It sends the responses to WebApp, only if they meet a certain criteria. Unlike the old version, I parsed the response in the script and sent it as a JSON string with only relevant data. Due to changes made by Ched, the below method no longer works for Bazaar items.
    $(document).ajaxComplete(function (event, jqXHR, ajaxObj) {
        var penny_ajax_formData = ajaxObj.data;
        var penny_ajax_response = jqXHR.responseText;
        var penny_ajax_url = ajaxObj.url;
        if (penny_ajax_formData) {
            if (penny_ajax_url.includes("item.php") && penny_ajax_formData.includes("step=sendItemAction") && penny_ajax_formData.includes("confirm=1")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && penny_items == true) {
                    var penny_obj = {};
                    for (let [key, data] of penny_ajax_formData.split("&").map(e=>e.split("=")))
                        penny_obj[key] = data;
                    let bold_text = $(penny_parsed["text"]);
                    console.log(bold_text);
                    for (var k = 0; k < bold_text.length; k++) {
                        if (bold_text[k].nodeName == "B") {
                            let text = bold_text[k].innerText;
                            if (text.match(/^\d/)) {
                                {}
                            } else {
                                penny_obj.item = text;
                            }
                        } else if (bold_text[k].nodeName == "A") {
                            penny_obj.userName = bold_text[k].innerText;
                        }
                    }

                    penny_obj.type = "item_sent";
                    if (penny_obj.tag !== "") {
                        penny_obj.tag = penny_parsed["text"].split("with the message: ")[1];
                    } else {
                        penny_obj.tag = "None";
                    }
                    sendDatatoWebapp(penny_obj);
                }
            } else if (penny_ajax_url.includes("imarket.php") && penny_ajax_formData.includes("step=buyItemConfirm")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && penny_imarket === true) {
                    var penny_result = penny_parsed["text"].replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
                    var imarket_obj = {};
                    imarket_obj.item = /bought\sthe\s(.*?)\sfor\s\$/g.exec(penny_result)[1];
                    imarket_obj.price = parseInt(/for\s\$(.*?)\sfrom\sthe\smarket/g.exec(penny_result)[1].replace(/,/g, ""));
                    imarket_obj.type = "imarket";
                    sendDatatoWebapp(imarket_obj);
                }
            } else if (penny_ajax_url.includes("sendcash.php") && penny_ajax_formData.includes("step=cash1")) {
                var penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && penny_cash === true) {
                    var penny_cash_obj = {};
                    for (let [key, data] of penny_ajax_formData.split("&").map(e=>e.split("=")))
                        penny_cash_obj[key] = data;
                    if (penny_ajax_formData.split("&")[0] == "step=cash1") {
                        penny_cash_obj.user = penny_parsed["text"].match(/<b>(.*?)<\/b>/gm)[1].replace("<b>", "").replace("</b>", "");
                    } else {
                        penny_cash_obj.user = penny_cash_obj.ID.split("+")[0];
                        let id = penny_cash_obj.ID.split("+%5B")[1];
                        penny_cash_obj.ID = id.substring(0, id.indexOf("%"));
                    }
                    if (penny_cash_obj.tag !== "") {
                        penny_cash_obj.tag = penny_parsed["text"].split("with the message: ")[1];
                    } else {
                        penny_cash_obj.tag = "None";
                    }
                    if (penny_cash_obj.theanon == "true") {
                        penny_cash_obj.theanon = "Yes";
                    } else {
                        penny_cash_obj.theanon = "No";
                    }
                    penny_cash_obj.type = "cash_sent";
                    sendDatatoWebapp(penny_cash_obj);
                }
            } else if (penny_ajax_url.includes("pmarket.php") && penny_ajax_formData.includes("ajax_action=buy1")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.color == "green" && penny_points === true) {
                    let result = penny_parsed["msg"].split(" ");
                    let amount = parseInt(result[2].replace(/,/g, ""));
                    let total = parseInt(result[result.length -1].replace("$", "").replace(/,/g, "").replace(".", ""));
                    let unit_price = total/amount;
                    var point_obj = {};
                    point_obj.type = "points";
                    point_obj.total = total;
                    point_obj.quantity = amount;
                    point_obj.unit_price = unit_price;
                    sendDatatoWebapp(point_obj);
                }
            } else if (penny_ajax_url.includes("shops.php") && penny_ajax_formData.includes("step=buyShopItem")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && penny_foreign === true) {
                    var penny_foreign_obj = {};
                    for (let [key, data] of penny_ajax_formData.split("&").map(e=>e.split("=")))
                        penny_foreign_obj[key] = data;
                    let penny_text = penny_parsed["text"];
                    let total = parseInt(/\sfor\s\$(.*?)\./.exec(penny_text)[1].replace(/,/g, ""));
                    penny_foreign_obj.total = total;
                    penny_foreign_obj.item = /x\s<b>(.*?)<\/b>/.exec(penny_text)[1];
                    penny_foreign_obj.type = "foreign";
                    let amount = penny_foreign_obj.amount;
                    penny_foreign_obj.per_unit = total/amount;
                    penny_foreign_obj.country = getcountry();
                    sendDatatoWebapp(penny_foreign_obj);
                }
            }
        }
    });
    function isChecked(variableName, returnType) {
        let saved = GM_getValue(variableName);
        if (saved === null || typeof saved == "undefined" || saved === "no") {
            if (returnType === 1) {
                return false;
            } else if (returnType === 2 || returnType === 3) {
                return "";
            }
        } else {
            if (returnType === 1) {
                return true;
            } else if (returnType === 2) {
                return " checked";
            } else if (returnType === 3) {
                return ` value="${saved}"`;
            }
        }
    }
    function addSettingsBox() {
        if (!document.querySelector(".hardyPennywiseBox")) {
            let node = document.createElement("div");
            node.innerHTML = `<div class="homie_header">Pennywise</div><div class="hardyPennywiseContent" style="font-size: 15px;"><input type="text" id="hardyPennywiseLinkBox" placeholder="Enter your link here"${isChecked("link", 3)}><br><input type="checkbox" id="pennybazaar_check" class="pennywiseCheckbox"${isChecked("bazaar", 2)}><label for="pennybazaar_check">Bazaar Buy Log</label><br><input type="checkbox" id="pennycash_check" class="pennywiseCheckbox"${isChecked("cash", 2)}><label for="pennycash_check">Cash Sent Log</label><br><input type="checkbox" id="pennyforeign_check" class="pennywiseCheckbox"${isChecked("foreign", 2)}><label for="pennyforeign_check">Foreign Buy Log</label><br><input type="checkbox" id="pennyimarket_check" class="pennywiseCheckbox"${isChecked("imarket", 2)}><label for="pennyimarket_check">Item Market Log</label><br><input type="checkbox" id="pennyitems_check" class="pennywiseCheckbox"${isChecked("items", 2)}><label for="pennyitems_check">Items Sent Log</label><br><input type="checkbox" id="pennypoints_check" class="pennywiseCheckbox"${isChecked("points", 2)}><label for="pennypoints_check">Points Buy Log</label><br><button id="hardyPennywiseSave">Save</button><div class="pennywiseNoti" style="text-align: center;"></div></div>`;
            node.className = "hardyPennywiseBox";
            document.querySelector(".content-wrapper").appendChild(node);
            document.querySelector("#hardyPennywiseSave").addEventListener("click", (e) =>{
                let checkboxes = document.querySelectorAll(".pennywiseCheckbox");
                for (const checkbox of checkboxes) {
                    let id = checkbox.id.split("_")[0].split("penny")[1];
                    if (checkbox.checked) {
                        GM_setValue(id, "yes");
                    } else {
                        GM_setValue(id, "no");
                    }
                }
                let linkBox = document.querySelector("#hardyPennywiseLinkBox");
                if (linkBox.value) {
                    GM_setValue("link", linkBox.value);
                } else {
                    GM_setValue("link", "no");
                }
                document.querySelector(".pennywiseNoti").innerHTML = `<label class="homieSuccessLabel">Settings saved!</label>`;
            });
        }
    }
})();
