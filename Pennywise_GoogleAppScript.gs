//Welcome Stranger
var properties = PropertiesService.getUserProperties();
//function to format numbers and add commas in them to make them pretty like your mom.
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}


//this function is for Item Market Log.
function market(x) {


    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Item Market"); //Get Item Market sheet in your Spreadsheet
    ss.insertRowsAfter(1, 1); //Insert a row

    //parsing the response to get required information
    var splash = x.split(" ");
    var item_array = [];
    for (i = 3; i < splash.length - 5; i++) {
        item_array.push(splash[i]);
    }
    var item = item_array.join(" ");

    var price_ = splash[splash.length - 4];
    var price_a = price_.substring(1);
    var price = parseInt(price_a.replace(/,/g, ''));
    var time = Utilities.formatDate(new Date(), "GMT", "dd MMMM yyyy  hh:mm:ss a");

    var array = []
    array.push([time + " TCT", item, price]);

    //writing data
    var range = ss.getRange(2, 1, 1, 3);
    range.setValues(array);


}


function bazaar(x) {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bazaars");
    ss.insertRowsAfter(1, 1);
    var splash = x.split(" ");
    var item_array = [];
    for (i = 4; i < splash.length - 8; i++) {
        item_array.push(splash[i]);
        var item = item_array.join(" ");
    }
    var name_ = splash[splash.length - 7];
    var name = name_.substring(0, name_.indexOf("'"));
    var total_ = splash[splash.length - 1].substring(1, splash[splash.length - 1].indexOf("."));
    var total = parseInt(total_.replace(/,/g, ""));
    var amount_ = splash[2];
    var amount = parseInt(amount_.replace(/,/g, ""));
    var unit_price = total / amount;



    var time = Utilities.formatDate(new Date(), "GMT", "dd MMMM yyyy  hh:mm:ss a");

    var array = []
    array.push([time + " TCT", item, amount, total, unit_price, name]);
    var range = ss.getRange(2, 1, 1, 6);
    range.setValues(array);


}


function item(x) {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sent Items");
    ss.insertRowsAfter(1, 1);
    var time = Utilities.formatDate(new Date(), "GMT", "dd MMMM yyyy  hh:mm:ss a");
    var splash = x.split("message:");
    var crack = x.split(" ");

    if (splash[1]) {
        var message = splash[1];
        var bish = splash[0].split(" ");
        var user = bish[bish.length - 4];
        var length = bish.length;
        bish.length = length - 5;
        bish.splice(0, 3);
        var item = bish.join(" ");

    } else {
        var message = "None";


        var user_ = crack[crack.length - 1];
        var usera = user_.split("");
        usera.splice(-1, 1);
        var user = usera.join("");
        crack.splice(-1, 1);
        crack.splice(-1, 1);
        crack.splice(0, 3);
        var item = crack.join(" ");
    }


    var crack_ = x.split(" ");

    if (crack_[2] == "some") {
        var amount = "1";
    } else if (crack_[2] == "a") {
        var amount = "1";
    } else if (crack_[2] == "an") {
        var amount = "1";
    } else {
        var amount_ = crack_[2];
        var amount = amount_.substring(0, amount_.indexOf("x"));
    }


    var array = []
    array.push([time + " TCT", user, item, amount.replace(/,/g, ''), message]);
    var range = ss.getRange(2, 1, 1, 5);
    range.setValues(array);



}

function cash(x) {

    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cash Sent");
    ss.insertRowsAfter(1, 1);
    var time = Utilities.formatDate(new Date(), "GMT", "dd MMMM yyyy  hh:mm:ss a");
    var splash = x.split(" ");
    if (splash[1] == "sent") {
        var anon = "No";
        var amount_ = splash[2];
        var amount = amount_.substring(1);

        if (splash[7] == "message:") {
            var message = x.substring(x.indexOf("message:") + 9);
            var user = splash[4];
        } else {
            var message = "None";
            var user = splash[4].substring(0, splash[4].indexOf("."));
        }
    } else if (splash[1] == "anonymously") {
        var anon = "Yes";
        var amount_ = splash[3];
        var amount = amount_.substring(1);


        if (splash[8] == "message:") {
            var message = x.substring(x.indexOf("message:") + 9);
            var user = splash[5];
        } else {
            var message = "None";
            var user = splash[5].substring(0, splash[5].indexOf("."));
        }
    }


    var array = []
    array.push([time + " TCT", user, amount.replace(/,/g, ''), message, anon]);
    var range = ss.getRange(2, 1, 1, 5);
    range.setValues(array);



}

function point(x) {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Points");
    ss.insertRowsAfter(1, 1);
    var time = Utilities.formatDate(new Date(), "GMT", "dd MMMM yyyy  hh:mm:ss a");
    var splash = x.split(" ");
    var amount = splash[2];
    var unit_price_ = splash[6]
    var unit_price = unit_price_.substring(1);
    var total_price_ = splash[12];
    var total_price = total_price_.substring(1, total_price_.indexOf("."));

    var array = []
    array.push([time + " TCT", amount.replace(/,/g, ''), unit_price.replace(/,/g, ''), total_price.replace(/,/g, '')]);
    var range = ss.getRange(2, 1, 1, 4);
    range.setValues(array);


}

function foreign(x) {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Foreign Items");
    ss.insertRowsAfter(1, 1);
    var time = Utilities.formatDate(new Date(), "GMT", "dd MMMM yyyy  hh:mm:ss a");
    var splash = x.split(" ");
    var total_ = splash[splash.length - 1];
    var total_a = total_.substring(1, total_.indexOf("."));
    var total = parseInt(total_a.replace(/,/g, ""));
    var amount = parseInt(splash[3].replace(/,/g, ""));
    var unit_price = total/amount;
    var length = splash.length;
    splash.length = length -3;
    splash.splice(0, 5);
    var item = splash.join(" ");
    array = [];
    var country = properties.getProperty("country");

    array.push([time + " TCT", item, amount, unit_price, total, country]);
    var range = ss.getRange(2, 1, 1, 6);
    range.setValues(array);



}


//the MVP function of the Webapp. It is responsible for the catching the data your script sends and then it executes a function from above according to data.
function doPost(e) {
    var inp = e.postData.contents;
    var input = JSON.parse(inp);
    if (input.success) {
        var text = input.text;
        var reg = text.replace(/<[^>]+>/g, "");
        var split = reg.split(" ");
        var last_term = split[split.length - 1];
        if (split[0] == "You") {
            if (split[1] == "bought") {

                if (last_term == "market.") {
                    market(reg);
                } else if (split[split.length - 6] == "bazaar") {
                    bazaar(reg);
                }
            } else if (split[1] == "sent") {
                if (split[2].slice(0, 1) == "$") {
                    cash(reg);
                } else {
                    item(reg);
                }
            } else if (split[1] == "anonymously") {
                cash(reg);

            } else if (split[1] == "have") {
                if (split[2] == "purchased") {
                    foreign(reg);
                }
            }


        }

    } else if (input.msg) {
        var text = input.msg;
        var split = text.split(" ");
        if (split[0] == "You") {
            if (split[1] == "bought") {
                point(text);
            }
        }
    } else if (input.country) {
        properties.setProperty('country', input.country);
    }
}
