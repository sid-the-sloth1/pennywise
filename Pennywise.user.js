// ==UserScript==
// @name         Pennywise
// @namespace   hardy.pennywise
// @version      3.0
// @description  Records your transactions
// @author       Hardy[2131687]
// @match        https://www.torn.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      script.google.com
// ==/UserScript==

(function() {
  'use strict';
  //Special Thanks to Helcostr for all his help with the code. Love ya <3 #NoHomo.
  //getting your script's settings

  //defining HTML to be added to Preference page so you can have options.


  //Creating an  Options box on Preferences page by adding the above defined HTML
  if (window.location.href.includes("/preferences.php")) {
    $(".content-wrapper").append(penny_html);
  }

  //saving settings when the "Save" button is clicked by the user
  $("#penny_savehardy_options").on("click", function () {
    GM_setValue('link', document.getElementById("penny_weblink").value);
    GM_setValue('bazaar', document.getElementById("penny_bazaar_").checked);
    GM_setValue('imarket', document.getElementById("penny_imarket_").checked);
    GM_setValue('points', document.getElementById("penny_points_").checked);
    GM_setValue('cash', document.getElementById("penny_cash_").checked);
    GM_setValue('items', document.getElementById("penny_items_").checked);
    GM_setValue('foreign', document.getElementById("penny_foreign_").checked);
    GM_setValue('version', "2.0");
    location.reload(); //before you come at me with pitchforks for reloading the page, this sort of reload has been given clearance in the past by IceBlueFire. As it is not automatically reloading and only reloads when you have to save the settings.
  });

  //creating a pop-up to remind users to update the Spreadsheet code.
  function pennyAlert() {
    $(".content-wrapper").prepend(`<div class="penny_modal", id="penny_modal">
      <div id="penny_modal-content">
      <p class="penny_line">Hi!! You are using Pennywise script, which has recently been updated. Some changes were also made to the Spreadsheet. Please update the Spreadsheet code to make sure that the script works properly.</p>
      <br><p class="penny_line"> Go to <a href="https://www.torn.com/forums.php?p=threads&t=16138949">this page</a> for more information.</p>
      <br><div class="penny_button_container">
      <button class="penny_close-button">Close me</button>
      </div>
      </div>
      </div><br><br>`)
  }
  //pennyAlert();


  //defining a function to send data to your Webapp
  function sendDatatoWebapp(x) {
    if (GM_getValue('version') !== '2.0') {
      pennyAlert();
    } else {
      console.log(x);
      GM_xmlhttpRequest({
        method: "POST",
        data: JSON.stringify({
          "pennywise": x
        }),
        url: penny_webapp,
        onload: function(e) {
          console.log("Data has been sent to your Webapp.");
        }
      });
    }
  }

  //for the alert Popup
  $(".penny_close-button").on("click", function () {
    GM_setValue('version', "2.0");
    var node = document.getElementById("penny_modal");
    node.style.display = "none";
  });

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
        for (let key of init.body.keys())
          formData[key] = init.body.get(key);
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
      } else {
        return "";
      }
    } else {
      if (returnType === 1) {
        return true;
      } else {
        return " checked";
      }
    }
  }
  //Adding CSS to options box and the alert Popup
  GM_addStyle(`
    .penny_modal { border-radius: 8px; background-color: rgb(242, 242, 242); animation: animate 3s linear infinite;}
    .penny_button_container { padding: 8px; padding-left: 30px;}
    .hardy_pennywise_header {align-items: center; color: rgb(249, 245, 245); font-size: 15px; background-color: rgb(31, 31, 32); border-radius: 3px; background-size: 4px; padding: 6px;}
    .accounting_save, .penny_save-button { padding: 5px 15px; font-size: 20px; display: inline-block; }
    .hardy_box { border-radius: 8px; background-color: rgb(242, 242, 242); box-shadow: 0px 4px 9px 3px rgba(119, 119, 119, 0.64); -moz-box-shadow: 0px 4px 9px 3px rgba(119, 119, 119, 0.64); -webkit-box-shadow: 0px 4px 9px 3px rgba(119, 119, 119, 0.64); }
    .accounting_text, .penny_line { padding: 10px; padding-top: 10px; padding-right: 30px; padding-bottom: 10px; padding-left: 30px; font-size: 18px }
    .accounting_link { border-color:#cccccc; font-size:16px; width: 90%; border-radius:8px; border-width:3px; border-style:ridge; padding: 10px; box-shadow: 1px 3px 5px 0px rgba(42,42,42,.39); text-shadow:0px 0px 1px rgba(42,42,42,.75); font-family:monospace; }
    .accounting_link:focus { outline:none; }
    .css-label { font-size: medium; }
    `)
})();