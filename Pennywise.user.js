// ==UserScript==
// @name         Pennywise
// @namespace    mailto: blahblahbrian@protonmail.com
// @version      1.3
// @description  Records your transactions
// @author       Hardy[2131687]
// @match        https://www.torn.com/imarket.php*
// @match        https://www.torn.com/bazaar.php*
// @match        https://www.torn.com/item.php*
// @match        https://www.torn.com/profiles.php*
// @match        https://www.torn.com/sendcash.php*
// @match        https://www.torn.com/preferences.php*
// @match        https://www.torn.com/index.php*
// @match        https://www.torn.com/pmarket.php*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// ==/UserScript==

(function() {
    'use strict';
    //getting your script's settings
    var webapp = GM_getValue('link');
    var bazaar = GM_getValue('bazaar');
    var imarket = GM_getValue('imarket');
    var points = GM_getValue('points');
    var cash = GM_getValue('cash');
    var items = GM_getValue('items');
    var foreign = GM_getValue('foreign');

    //defining HTML to be added to Preference page so you can have options.
    if (bazaar === true) {
        var bazaar_inp = '<input type="checkbox" name="bazaar_" id="bazaar_" class="css-checkbox" checked/><label for="bazaar_" class="css-label">  Bazaar Log</label>';
    } else {
        var bazaar_inp = '<input type="checkbox" name="bazaar_" id="bazaar_" class="css-checkbox" /><label for="bazaar_" class="css-label">  Bazaar Log </label>';
    }
    if (webapp) {
        var link_value = ' value ='+webapp;
    } else {
        var link_value = '';
    }
    if (imarket === true) {
        var imarket_inp = '<input type="checkbox" name="imarket_" id="imarket_" class="css-checkbox" checked/><label for="imarket_" class="css-label">  Item Market Log </label>';
    } else {
        var imarket_inp = '<input type="checkbox" name="imarket_" id="imarket_" class="css-checkbox" /><label for="imarket_" class="css-label">  Item Market Log </label>';
    }
    if (points === true) {
        var points_inp = '<input type="checkbox" name="points_" id="points_" class="css-checkbox" checked/><label for="points_" class="css-label">  Points Market Log </label>';
    } else {
        var points_inp = '<input type="checkbox" name="points_" id="points_" class="css-checkbox" /><label for="points_" class="css-label">  Points Market Log </label>';
    }
    if (cash === true) {
        var cash_inp = '<input type="checkbox" name="cash_" id="cash_" class="css-checkbox" checked/><label for="cash_" class="css-label">  Cash sent Log </label>';
    } else {
        var cash_inp = '<input type="checkbox" name="cash_" id="cash_" class="css-checkbox" /><label for="cash_" class="css-label">  Cash Sent Log </label>';
    }
    if (items === true) {
        var items_inp = '<input type="checkbox" name="items_" id="items_" class="css-checkbox" checked/><label for="items_" class="css-label">  Items Sent Log </label>';
    } else {
        var items_inp = '<input type="checkbox" name="items_" id="items_" class="css-checkbox" /><label for="items_" class="css-label">  Items Sent Log </label>';
    }
    if (foreign === true) {
        var foreign_inp = '<input type="checkbox" name="items_" id="foreign_" class="css-checkbox" checked/><label for="foreign_" class="css-label">  Abroad Items Log </label>';
    } else {
        var foreign_inp = '<input type="checkbox" name="items_" id="foreign_" class="css-checkbox" /><label for="foreign_" class="css-label">  Abroad Items Log </label>';
    }

    var html = '<br><br><div class = hardy_box id="hardy_options"><div class="prefs-tab-title title-black top-round">Torn Accounting Settings </div><hr class="page-head-delimiter"><div class = accounting_text><form><br><label class = "css-label">Link to WebApp:<br><br><input type="text" id="weblink" name="link", class = "accounting_link"'+ link_value + '></label><br><br><br> ' + bazaar_inp + ' <br><br>' + imarket_inp + '<br><br> '+ points_inp + '<br><br> ' + cash_inp +'<br><br> ' + items_inp +'<br><br>' + foreign_inp + ' <br><br><br><button class = "accounting_save" id="savehardy_options" type="button">Save </button><br></div></div></form></div>';


    //Creating an  Options box on Preferences page by adding the above defined HTML
    if (window.location.href.includes("/preferences.php")) {
        $(".content-wrapper").append(html);
    }

    //saving settings when the "Save" button is clicked by the user
    $("#savehardy_options").on("click", function () {
        GM_setValue('link', document.getElementById("weblink").value);
        GM_setValue('bazaar', document.getElementById("bazaar_").checked);
        GM_setValue('imarket', document.getElementById("imarket_").checked);
        GM_setValue('points', document.getElementById("points_").checked);
        GM_setValue('cash', document.getElementById("cash_").checked);
        GM_setValue('items', document.getElementById("items_").checked);
        GM_setValue('foreign', document.getElementById("foreign_").checked);

        location.reload(); //before you come at me with pitchforks for reloading the page, this sort of reload has been given clearance in the past by IceBlueFire. As it is not automatically reloading and only reloads when you have to save the settings.
    });

    //defining a function to send data to your Webapp
    function sendData(x) {
        if (webapp == '') {
            console.log("Webapp is not set.")
        } else {
            GM_xmlhttpRequest({
                method: "POST",
                data: x,
                url: webapp,
                onload: function(e) {
                    console.log("Data has been sent to your Webapp.");
                }
            });
        }
    }

//This function is to get the name of country from where you buy stuff from.
    function getcountry() {
        var country_array = ["Mexico", "Switzerland", "UAE", "Cayman Islands", "Canada", "Hawaii", "United Kingdom", "Argentina", "Japan", "China", "South Africa"];
        var country = document.getElementsByClassName('msg right-round')[1].childNodes[1].childNodes[0].data;
        if (country_array.indexOf(country) !== -1) {
            sendData(JSON.stringify({"country": country}));
        }
    }
//executing the above defined function to get the name of country
    if (window.location.href.includes("index.php")) {
        getcountry();
    }
    //Main part of the script. It catches AJAX responses and parses them. It sends the responses to WebApp, only if they meet a certain criteria.
    $(document).ajaxComplete(function (event, jqXHR, ajaxObj) {
        //bazaar Log.
        if (window.location.href.includes("/bazaar.php")) {
            if (ajaxObj.url.split("?")[0] == "bazaar.php") {
                if (ajaxObj.data.split("&")[0] == "step=buyItem") {
                    if (bazaar === true) {
                        sendData(jqXHR.responseText);

                    }
                }
            } // Items sent Log
        } else if (window.location.href.includes("/item.php")) {
            if (ajaxObj.url.split("?")[0] == "item.php") {
                if (ajaxObj.data.split("&")[0] == "step=sendItemAction") {
                    if (ajaxObj.data.split("&")[1] == "confirm=1") {
                        if (items === true) {
                            sendData(jqXHR.responseText);
                        }
                    }
                }
            } //Item Market Log
        } else if (window.location.href.includes("/imarket.php")) {
            if (ajaxObj.url.split("?")[0] == "imarket.php") {
                if (ajaxObj.data.split("&")[0] == "step=buyItemConfirm") {
                    if (imarket === true) {
                        sendData(jqXHR.responseText);
                    }
                }
            } //Cash Sent Log, sent through the profile page of another player.
        } else if (window.location.href.includes("/profiles.php")) {
            if (ajaxObj.url.split("?")[0] == "/sendcash.php") {
                if (ajaxObj.data.split("&")[0] == "step=cash1") {
                    if (cash === true) {
                        sendData(jqXHR.responseText);
                    }
                }
            } //Cash Sent Log, sent through www.torn.com/sendcash.php
        } else if (window.location.href.includes("/sendcash.php")) {
            if (ajaxObj.url.split("?")[0] == "sendcash.php") {
                if (ajaxObj.data.split("&")[4] == "step=cash1") {
                    if (cash === true) {
                        sendData(jqXHR.responseText);
                    }
                }
            } //Points Bought Log
        } else if (window.location.href.includes("/pmarket.php")) {
            if (ajaxObj.url.split("?")[0] == "pmarket.php") {
                if (ajaxObj.data) {
                    if (ajaxObj.data.split("&")[0] == "ajax_action=buy1") {
                        if (points === true) {
                            sendData(jqXHR.responseText);
                        }
                    }
                }
            } //foreign items log
        } else if (window.location.href.includes("/index.php")) {
            if (ajaxObj.url.split("?")[0] == "shops.php") {
                if (ajaxObj.data.split("&")[0] == "step=buyShopItem") {
                    if (foreign === true) {
                        sendData(jqXHR.responseText)
                    }
                }
            }
        }
    });
    //Adding CSS to options page
    GM_addStyle(`
.accounting_save { padding: 5px 15px; font-size: 20px; }
.hardy_box { border-radius: 6px; background-color: rgb(242, 242, 242); box-shadow: 0px 4px 9px 3px rgba(119, 119, 119, 0.64); -moz-box-shadow: 0px 4px 9px 3px rgba(119, 119, 119, 0.64); -webkit-box-shadow: 0px 4px 9px 3px rgba(119, 119, 119, 0.64); }
.accounting_text { padding: 10px; padding-top: 10px; padding-right: 30px; padding-bottom: 10px; padding-left: 30px; }
.accounting_link { border-color:#cccccc; font-size:16px; width: 90%; border-radius:8px; border-width:3px; border-style:ridge; padding: 10px; box-shadow: 1px 3px 5px 0px rgba(42,42,42,.39); text-shadow:0px 0px 1px rgba(42,42,42,.75); font-family:monospace; }
.accounting_link:focus { outline:none; }
.css-label { font-size: medium; }`)
})();
