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
    let listOfStocks = ['BAG', 'CNC', 'ELBT', 'EVL', 'EWM', 'FHG', 'GRN', 'HRG', 'IIL', 'IOU', 'ISTC', 'LSC', 'MCS', 'MSG', 'PRN', 'SLAG', 'SYM', 'SYS', 'TCB', 'TCC', 'TCHS', 'TCM', 'TCP', 'TCSE', 'TCT', 'TGP', 'TMI', 'TSBC', 'WLT', 'WSSB', 'YAZ'];
    var toBeSent = {
        "stocks": {}};
    let pageUrl = window.location.href;
    let settings = {
        "penny_bazaar": isChecked("bazaar", 1), "penny_imarket": isChecked("imarket", 1), "penny_points": isChecked("points", 1), "penny_cash": isChecked("cash", 1), "penny_items": isChecked("items", 1), "penny_foreign": isChecked("foreign", 1)};
    //Creating an  Options box on Preferences page by adding the above defined HTML
    if (pageUrl.includes("/preferences.php")) {
        addPrefBox();
    } else if (pageUrl.includes("stockexchange.php")) {
        createIcons();
        addListeners();
        if (pageUrl.includes("step=portfolio")) {
            updatePortfolio();
        }
    } else if(pageUrl.includes("/bazaar.php")) {
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
    }
    //defining a function to send data to your Webapp
    function sendDatatoWebapp(dataObj, linkType) {
        console.log(dataObj);
    }
    function getcountry() {
        let penny_country_array = ['Mexico', 'Switzerland', 'UAE', 'Cayman Islands', 'Canada', 'Hawaii', 'United Kingdom', 'Argentina', 'Japan', 'China', 'South Africa'];
        let penny_country = document.getElementsByClassName('msg right-round')[1].childNodes[1].childNodes[0].data;
        if (penny_country_array.indexOf(penny_country) !== -1) {
            return penny_country;
        }
    }

    //Main part of the script. It catches AJAX responses and parses them. It sends the responses to WebApp, only if they meet a certain criteria. Unlike the old version, I parsed the response in the script and sent it as a JSON string with only relevant data. Due to changes made by Ched, the below method no longer works for Bazaar items.
    $(document).ajaxComplete(function (event, jqXHR, ajaxObj) {
        let penny_ajax_formData = ajaxObj.data;
        let penny_ajax_response = jqXHR.responseText;
        let penny_ajax_url = ajaxObj.url;
        if (penny_ajax_formData) {
            if (penny_ajax_url.includes("item.php") && penny_ajax_formData.includes("step=sendItemAction") && penny_ajax_formData.includes("confirm=1")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && settings.penny_items == true) {
                    let penny_obj = {};
                    for (let [key, data] of penny_ajax_formData.split("&").map(e=>e.split("="))) {
                        penny_obj[key] = data;
                    }
                    let bold_text = $(penny_parsed.text);
                    for (var k = 0; k < bold_text.length; k++) {
                        if (bold_text[k].nodeName == "B") {
                            let text = bold_text[k].innerText;
                            if (!text.match(/^\d/)) {
                                penny_obj.item = text;
                            }
                        } else if (bold_text[k].nodeName == "A") {
                            penny_obj.userName = bold_text[k].innerText;
                        }
                    }

                    penny_obj.type = "item_sent";
                    if (penny_obj.tag !== "") {
                        penny_obj.tag = penny_parsed.text.split("with the message: ")[1];
                    } else {
                        penny_obj.tag = "None";
                    }
                    sendDatatoWebapp(penny_obj);
                }
            } else if (penny_ajax_url.includes("imarket.php") && penny_ajax_formData.includes("step=buyItemConfirm")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && settings.penny_imarket === true) {
                    let penny_result = penny_parsed.text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
                    let imarket_obj = {};
                    imarket_obj.item = /bought\sthe\s(.*?)\sfor\s\$/g.exec(penny_result)[1];
                    imarket_obj.price = parseInt(/for\s\$(.*?)\sfrom\sthe\smarket/g.exec(penny_result)[1].replace(/,/g, ""));
                    imarket_obj.type = "imarket";
                    sendDatatoWebapp(imarket_obj);
                }
            } else if (penny_ajax_url.includes("sendcash.php") && penny_ajax_formData.includes("step=cash1")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && settings.penny_cash === true) {
                    let penny_cash_obj = {};
                    for (let [key, data] of penny_ajax_formData.split("&").map(e=>e.split("="))) {
                        penny_cash_obj[key] = data;
                    }
                    if (penny_ajax_formData.split("&")[0] == "step=cash1") {
                        penny_cash_obj.user = penny_parsed.text.match(/<b>(.*?)<\/b>/gm)[1].replace("<b>", "").replace("</b>", "");
                    } else {
                        penny_cash_obj.user = penny_cash_obj.ID.split("+")[0];
                        let id = penny_cash_obj.ID.split("+%5B")[1];
                        penny_cash_obj.ID = id.substring(0, id.indexOf("%"));
                    }
                    if (penny_cash_obj.tag !== "") {
                        penny_cash_obj.tag = penny_parsed.text.split("with the message: ")[1];
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
                if (penny_parsed.color == "green" && settings.penny_points === true) {
                    let result = penny_parsed.msg.split(" ");
                    let amount = parseInt(result[2].replace(/,/g, ""));
                    let total = parseInt(result[result.length -1].replace("$", "").replace(/,/g, "").replace(".", ""));
                    let unit_price = total/amount;
                    let point_obj = {};
                    point_obj.type = "points";
                    point_obj.total = total;
                    point_obj.quantity = amount;
                    point_obj.unit_price = unit_price;
                    sendDatatoWebapp(point_obj);
                }
            } else if (penny_ajax_url.includes("shops.php") && penny_ajax_formData.includes("step=buyShopItem")) {
                let penny_parsed = JSON.parse(penny_ajax_response);
                if (penny_parsed.success && settings.penny_foreign === true) {
                    let penny_foreign_obj = {};
                    for (let [key, data] of penny_ajax_formData.split("&").map(e=>e.split("="))) {
                        penny_foreign_obj[key] = data;
                    }
                    let penny_text = penny_parsed.text;
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
        } else {
            if (penny_ajax_url.includes("stockexchange.php?") && penny_ajax_url.includes("step=buy2")) {
                let response = new DOMParser().parseFromString(jqXHR.responseText, 'text/html');
                let text = response.querySelector(".stock-main-wrap div .info-msg-cont .info-msg .delimiter .msg").innerText.trim();
                if (text.startsWith("You have bought")) {
                    createIcons();
                    let obj = {};
                    obj.stocks = {};
                    obj.stocks.shares = parseInt(retrieve(penny_ajax_url, "shares"));
                    obj.stocks.cost = parseInt(retrieve(penny_ajax_url, "cost"));
                    obj.stocks.price = obj.stocks.cost/obj.stocks.shares;
                    obj.stocks.seller = "System";
                    obj.stocks.sellerId = 0;
                    obj.stocks.stamp = Date.now();
                    let regexPattern = obj.stocks.shares === 1? /\sshare\sin\s(.*?)\sat\sa\s/: /\sshares\sin\s(.*?)\sat\sa\s/;
                    obj.stocks.stockName = regexPattern.exec(text)[1];
                    obj.stocks.type = "buy";
                    sendDatatoWebapp(obj, 2);

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
    function addPrefBox() {
        if (!document.querySelector(".hardyPennywiseBox")) {
            let node = document.createElement("div");
            node.innerHTML = `<div class="homie_header">Pennywise</div><div class="hardyPennywiseContent" style="font-size: 15px;"><input type="text" id="hardyPennywiseLinkBox" placeholder="Enter your link here"${isChecked("link", 3)}><br><input type="checkbox" id="pennybazaar_check" class="pennywiseCheckbox"${isChecked("bazaar", 2)}><label for="pennybazaar_check">Bazaar Buy Log</label><br><input type="checkbox" id="pennycash_check" class="pennywiseCheckbox"${isChecked("cash", 2)}><label for="pennycash_check">Cash Sent Log</label><br><input type="checkbox" id="pennyforeign_check" class="pennywiseCheckbox"${isChecked("foreign", 2)}><label for="pennyforeign_check">Foreign Buy Log</label><br><input type="checkbox" id="pennyimarket_check" class="pennywiseCheckbox"${isChecked("imarket", 2)}><label for="pennyimarket_check">Item Market Log</label><br><input type="checkbox" id="pennyitems_check" class="pennywiseCheckbox"${isChecked("items", 2)}><label for="pennyitems_check">Items Sent Log</label><br><input type="checkbox" id="pennypoints_check" class="pennywiseCheckbox"${isChecked("points", 2)}><label for="pennypoints_check">Points Buy Log</label><br><button id="hardyPennywiseSave">Save</button><div class="pennywiseNoti" style="text-align: center;"></div></div>`;
            node.className = "hardyPennywiseBox";
            document.querySelector(".content-wrapper").appendChild(node);
            document.querySelector("#hardyPennywiseSave").addEventListener("click", (e) => {
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
    function createIcons() {
        if (!document.querySelector("#homie_create_box")) {
            let htmlIcon1 = '<span class="icon-wrap svg-icon-wrap"><span class="link-icon-svg homieTrade"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path id="homie-icon" d="M19 11V9h-8V5H9v4H5v2h4v8h2v-8h8m0-8c.5 0 1 .2 1.39.61C20.8 4 21 4.5 21 5v14c0 .5-.2 1-.61 1.39c-.39.41-.89.61-1.39.61H5c-.5 0-1-.2-1.39-.61C3.2 20 3 19.5 3 19V5c0-.5.2-1 .61-1.39C4 3.2 4.5 3 5 3h14z" fill="#626262"/></svg></div></span></span><span id="homietitle">Update Sheet</span>';
            let htmlIcon2 = '<span class="icon-wrap svg-icon-wrap"><span class="link-icon-svg homieOptions"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1024 1024"><path id="homie-icon1" d="M512.5 390.6c-29.9 0-57.9 11.6-79.1 32.8c-21.1 21.2-32.8 49.2-32.8 79.1c0 29.9 11.7 57.9 32.8 79.1c21.2 21.1 49.2 32.8 79.1 32.8c29.9 0 57.9-11.7 79.1-32.8c21.1-21.2 32.8-49.2 32.8-79.1c0-29.9-11.7-57.9-32.8-79.1a110.96 110.96 0 0 0-79.1-32.8zm412.3 235.5l-65.4-55.9c3.1-19 4.7-38.4 4.7-57.7s-1.6-38.8-4.7-57.7l65.4-55.9a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a442.5 442.5 0 0 0-79.6-137.7l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.2 28.9c-30-24.6-63.4-44-99.6-57.5l-15.7-84.9a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52-9.4-106.8-9.4-158.8 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.3a353.44 353.44 0 0 0-98.9 57.3l-81.8-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a445.93 445.93 0 0 0-79.6 137.7l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.2 56.5c-3.1 18.8-4.6 38-4.6 57c0 19.2 1.5 38.4 4.6 57l-66 56.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.3 44.8 96.8 79.6 137.7l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.8-29.1c29.8 24.5 63 43.9 98.9 57.3l15.8 85.3a32.05 32.05 0 0 0 25.8 25.7l2.7.5a448.27 448.27 0 0 0 158.8 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-84.9c36.2-13.6 69.6-32.9 99.6-57.5l81.2 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.5-87.4 79.6-137.7l.9-2.6c4.3-12.4.6-26.3-9.5-35zm-412.3 52.2c-97.1 0-175.8-78.7-175.8-175.8s78.7-175.8 175.8-175.8s175.8 78.7 175.8 175.8s-78.7 175.8-175.8 175.8z" fill="#626262"/></svg></div></span></span><span id="homietitle1">Settings</span>';
            let stockIcon = document.querySelector('a[aria-labelledby="stockexchange"]') || document.querySelector('a[aria-labelledby="your-portfolio"]');
            let parent = stockIcon.parentNode;
            let newElement = document.createElement('a');
            newElement.id = "homie_create_box";
            newElement.setAttribute("role", "button");
            newElement.setAttribute("aria-labelledby", "homie");
            newElement.setAttribute("href", "#");
            newElement.className = 'homie t-clear h c-pointer  m-icon line-h24 right';
            newElement.innerHTML = htmlIcon1;
            parent.insertBefore(newElement, document.querySelector(".links-footer"));
            let anotherNewElement = document.createElement('a');
            anotherNewElement.id = "homie_create_options_box";
            anotherNewElement.setAttribute("role", "button");
            anotherNewElement.setAttribute("aria-labelledby", "homie1");
            anotherNewElement.setAttribute("href", "#");
            anotherNewElement.className = 'homie1 t-clear h c-pointer  m-icon line-h24 right';
            anotherNewElement.innerHTML = htmlIcon2;
            parent.insertBefore(anotherNewElement, document.querySelector(".links-footer"));
        }
    }
    function addListeners() {
        document.addEventListener("input", function(g) {
            if (g.target.className == "homieInputBox1") {
                let inpu = document.getElementById(g.target.id).value;
                if (inpu == "" || inpu.startsWith("N") || inpu == "$") {
                    return;
                } else {
                    let inp = inpu.replace(/,/g, "").replace(/\$/g, "").replace(/\s/g, "");
                    let val = inp.split("");
                    let lastLetter = val[val.length -1];
                    //console.log(lastLetter);
                    var digits;
                    if (lastLetter == "b" || lastLetter == "B") {
                        val.splice(val.length-1, 1);
                        digits = parseFloat(val.join(""))*1000000000.0
                    } else if (lastLetter == "k" || lastLetter == "K") {
                        val.splice(val.length-1, 1);
                        digits = parseFloat(val.join(""))*1000.0;
                    } else if (lastLetter == "m" || lastLetter == "M") {
                        val.splice(val.length-1, 1);
                        digits = parseFloat(val.join(""))*1000000.0
                    } else {
                        let joined = val.join("");
                        if (joined.includes(".")) {
                            digits = joined.replace(/./g, "h")
                        } else {
                            digits = joined;
                        }
                    }
                    if (isNaN(parseInt(digits))) {
                        g.target.setAttribute("isError", "yes");

                        g.target.value = val.join("");
                        //console.log(val);
                    } else {
                        g.target.value = digits;
                        g.target.setAttribute("isError", "no");
                    }
                }
            }
        });
        document.addEventListener("click", function(e) {
            if (e.target.id == "homietitle" || e.target.id == "homie-icon" || e.target.id == "homie_create_box") {
                createTradeInfoBox();
            } else if (e.target.id == "homietitle1" || e.target.id == "homie-icon1" || e.target.id == "homie_create_options_box") {
                createSettingsBox();
            } else if (e.target.id == "homieReset") {
                resetBox();
                toBeSent = {
                    "stocks": {}};
            } else if (e.target.id == "homieCloseModal") {
                document.querySelector(".homie_modal").remove();
                toBeSent = {
                    "stocks": {}};
            } else if (e.target.id == "homieSendData") {
                toBeSent = {
                    "stocks": {}};
                resetLabels();
                let type = document.querySelector('input[name="transaction_type"]:checked');
                let stock = document.querySelector("#homieStockAcronym").value.toUpperCase();
                let amount = document.querySelector("#homieShareAmount").value;
                let cost = document.querySelector("#homieMoney").value;
                let playerName = document.querySelector("#homie_player_name").value;
                let playerId = document.querySelector("#homieUserId").value;
                let time = new Date(document.querySelector("#homieTradeTime").value).getTime();
                let dict = {
                    "errors": 0
                };
                if (isNaN(time)) {
                    dict.errors += 1;
                    document.querySelector("#labelTime").innerHTML = 'Select approximate time of trade:<label class="homieErrorLabel">Please select a valid date and time!</label>';
                }
                if (playerId === "" || playerId === null || typeof playerId == "undefined") {
                    dict.errors += 1;
                    document.querySelector("#labelId").innerHTML = 'User Id of the player your traded with:<label class="homieErrorLabel">Please enter the Id of the user!</label>';
                }
                if (playerName === "" || playerName === null || typeof playerName == "undefined") {
                    dict.errors += 1;
                    document.querySelector("#labelName").innerHTML = 'Name of Player you traded with:<label class="homieErrorLabel">Please enter the name of the user!</label>';
                }
                if (cost == 0 || cost == "" || cost === null || typeof cost == "undefined" || document.querySelector("#homieMoney").getAttribute("isError") == "yes") {
                    dict.errors += 1;
                    document.querySelector("#labelCost").innerHTML = 'Total value of shares:<label class="homieErrorLabel">Please enter a valid amount. Only non-numerical characters that are supported are $ . , k m b</label>';
                }
                if (amount == 0 || amount == "" || amount === null || typeof amount == "undefined" || document.querySelector("#homieShareAmount").getAttribute("isError") == "yes") {
                    dict.errors += 1;
                    document.querySelector("#labelAmount").innerHTML = 'Enter numbers of shares traded:<label class="homieErrorLabel">Please enter a valid amount. Only non-numerical characters that are supported are $ . , k m b</label>';
                }
                if (type === null || typeof type == "undefined" || type == "") {
                    dict.errors += 1;
                    document.querySelector("#labelType").innerHTML = 'Transaction Type:<label class="homieErrorLabel">Please select the type of transaction!</label>';
                }
                if (dict.errors === 0) {
                    toBeSent.stocks.type = type.value;
                    let noun = type.value === "buy"? "seller": "buyer";
                    toBeSent.stocks[noun] = playerName;
                    let nounId = type.value === "buy"? "sellerId": "buyerId";
                    toBeSent.stocks[nounId] = playerId;
                    toBeSent.stocks.stockName = stock;
                    toBeSent.stocks.shares = parseInt(amount);
                    toBeSent.stocks.cost = parseInt(cost);
                    toBeSent.stocks.price = parseInt(cost)/parseInt(amount);
                    toBeSent.stocks.stamp = time;
                    let confirmationDiv = document.querySelector(".homieConfirmation");
                    confirmationDiv.innerHTML = '<p>Are you sure you want to send the data to your webapp?</p><button id="homieSendyes">Yes</button><button id="homieSendNo">No</button>';
                }
            } else if (e.target.id == "homieSendNo") {
                document.querySelector(".homieConfirmation").innerHTML = "";
                toBeSent = {
                    "stocks": {}};
            } else if (e.target.id == "homieSendyes") {
                sendDatatoWebapp(toBeSent, 3);
            } else if (e.target.id == "homieCloseSetting") {
                document.querySelector(".homieSettingsBox").remove();
            } else if (e.target.id == "homieSaveUrl") {
                let url = document.querySelector("#homieUrl").value;
                let notifDiv = document.querySelector(".homieSettingsConfirm");
                if (url === null || url == "" || typeof url == "undefined") {
                    notifDiv.innerHTML = '<label class="homieErrorLabel">Please enter the webapp url.</label>';
                } else {
                    GM_setValue('link1', url);
                    notifDiv.innerHTML = '<label class="homieSuccessLabel">Webapp URL saved.</label>';
                }
            }

        });
    }
    function resetLabels() {
        let nodes = document.querySelectorAll(".homie_modal_content p");
        for (const p of nodes) {
            let html = p.innerHTML.split("<")[0];
            p.innerHTML = html;
        }
    }
    function createSettingsBox() {
        if (!document.querySelector(".homieSettingsBox")) {
            let savedUrl = GM_getValue("link");
            var placeholderHTML;
            if (savedUrl === null || savedUrl == "" || typeof savedUrl == "undefined") {
                placeholderHTML = ' placeholder="Enter Webapp URL here"';
            } else {
                placeholderHTML = ' value="'+savedUrl+'"';
            }
            $(".content-wrapper").prepend('<div class="homieSettingsBox"><div class="homie_header">Settings</div><div class="homieSettingsContent"><p>Enter the Webapp URL:</p><input type="text" class="homieInputBox" id="homieUrl"'+placeholderHTML+'><br><br><button id="homieSaveUrl">Save</button><button id="homieCloseSetting">Close</button><div class="homieSettingsConfirm"></div></div></div>');

        }
    }
    function resetBox() {
        document.querySelector(".homie_modal").innerHTML = '<div class="homie_header">Homie</div><div class="homie_modal_content"><p id="labelType" style="margin-bottom:10px;">Transaction Type</p><input type="radio" name="transaction_type" value="sold" id="homieIsSold"><label for="homieIsSold" style="margin-left:10px; margin-bottom:10px;">Shares sold</label><br><br><input type="radio" name="transaction_type" value="buy" id="homieIsBought"><label for="homieIsBought" style="margin-left:10px; margin-bottom:10px;">Shares bought</label><br><br><p style="margin-bottom:10px;">Select name of the stock:</p><select id="homieStockAcronym"></select><br><br><p id="labelAmount">Enter numbers of shares traded:</p><input type="text" class="homieInputBox1" id="homieShareAmount" placeholder="Enter number of shares"><br><br><p id="labelCost">Total value of shares:</p><input type="text" class="homieInputBox1" id="homieMoney" placeholder="Value of shares"><br><br><p id="labelName">Name of Player you traded with:</p><input type="text" class="homieInputBox" id="homie_player_name" placeholder="Name of player you traded with"><br><br><p id="labelId">User Id of the player your traded with:</p><input type="number" id="homieUserId" class="homieInputBox" placeholder="User ID of that player" min="1"><br><br><p style="margin-bottom:10px;" id="labelTime">Select approximate time of trade:</p><input type="datetime-local" id="homieTradeTime"><br><br><button id="homieSendData">Send</button><button id="homieReset">Reset</button><button id="homieCloseModal">Close</button><div class="homieConfirmation"></div></div>';
        let array = [];
        for (const stock of listOfStocks) {
            array.push(`<option value="${stock.toLowerCase()}">${stock}</option>`);
        }
        document.querySelector("#homieStockAcronym").innerHTML = array.join("");
        var now = new Date();
        //now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        document.querySelector("#homieTradeTime").value = now.toISOString().slice(0, 16);
    }
    function createTradeInfoBox() {
        let boxHtml = '<div class="homie_modal"></div>';
        if (!document.querySelector(".homie_modal")) {
            $(".content-wrapper").prepend(boxHtml);
            resetBox();
        }
    }
    function retrieve(string, argName) {
        return string.split(`${argName}=`)[1].split("&")[0];
    }
    function updatePortfolio() {
        let array = [];
        let stockList = document.querySelector(".stock-main-wrap .stock-cont").children;
        for (const item of stockList) {
            let info = item.querySelector(".item .info");
            let obj = {}
            obj.acronym = item.getAttribute("data-stock").toUpperCase();
            obj.shares = parseInt(info.querySelector(".b-price-wrap .first-row").innerText.replace(/\s/g, "").split(":")[1].replace(/,/g, ""));
            obj.current_price = info.querySelector(".b-price-wrap .second-row").innerText.replace(/\s/g, "").split("$")[1].replace(/,/g, "").split("S")[0];
            obj.price = info.querySelector(".c-price-wrap .second-row").innerText.replace(/\s/g, "").split(":$")[1].replace(/,/g, "").split("S")[0];
            obj.time = info.querySelector(".length-wrap .first-row").innerText.replace(/\s/g, "").split(":")[1].split("(")[0];
            obj.worth = info.querySelector(".c-price-wrap .first-row").innerText.replace(/\s/g, "").split("$")[1].replace(/,/g, "");
            let changeclass = info.querySelector(".length-wrap .second-row .prop-wrap .change")
            let sign = changeclass.querySelector(".arrow-change-icon").getAttribute("aria-label") === "stock price is down"? "-": "";
            obj.change = sign + changeclass.innerText.replace(/\s/g, "").replace(/,/g, "").split("$")[1].split("(")[0];
            obj.loss_profit = Math.round(obj.change * obj.shares);
            obj.percent = sign+changeclass.innerText.replace(/,/g, "").replace(/\s/g, "").split("(")[1].split("%")[0];
            obj.boughtTotal = Math.round(obj.shares*obj.price);
            array.push(obj);
        }
        let dict = {};
        dict.stocks = {};
        dict.stocks.data = array;
        dict.stocks.type = "portfolio"
        sendDatatoWebapp(dict, 2);
    }
})();
