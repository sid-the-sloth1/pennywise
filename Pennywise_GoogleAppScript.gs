var version = {
	"version": "2.0"
};
//a function to track version of code incase of future updates
function doGet(fg) {
	if (fg.parameter.type == "version_penny") {
		return ContentService.createTextOutput(JSON.stringify(version));
	}
}

function doPost(e) {
	var inp = e.postData.contents;
	var input = JSON.parse(inp);
	if (input["pennywise"]) {
		var type = input["pennywise"]["type"];
		if (type == 'imarket') {
			imarket(inp);
		} else if (type == 'bazaar') {
			bazaar(inp);
		} else if (type == "points") {
			points(inp);
		} else if (type == 'item_sent') {
			item_sent(inp);
		} else if (type == "cash_sent") {
			cash_sent(inp);
		} else if (type == "foreign") {
			foreign(inp);
		}
	}
}

function imarket(args) {
	var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Item Market");
	var lock = LockService.getScriptLock();
	lock.tryLock(4*60*1000);
	ss.insertRowAfter(1);
	var data = JSON.parse(args)["pennywise"];
	ss.getRange(2, 1, 1, 3).setValues([[getTime(), data.item, data.price]]);
	lock.releaseLock()
}

function bazaar(args) {
	var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bazaars");
	var lock = LockService.getScriptLock();
	lock.tryLock(4*60*1000);
	ss.insertRowAfter(1);
	var data = JSON.parse(args)["pennywise"];
	ss.getRange(2, 1, 1, 6).setValues([[getTime(), data.itemName, data.amount, data.beforeval, data.price, '=HYPERLINK("https://www.torn.com/profiles.php?XID='+data.userID+'", "'+data.userName+'")']]);
	lock.releaseLock()
}

function points(args) {
	var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Points");
	var lock = LockService.getScriptLock();
	lock.tryLock(4*60*1000);
	ss.insertRowAfter(1);
	var data = JSON.parse(args)["pennywise"];
	ss.getRange(2, 1, 1, 4).setValues([[getTime(), data.quantity, data.unit_price, data.total]]);
	lock.releaseLock()
}

function cash_sent(args) {
	var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cash sent");
	var lock = LockService.getScriptLock();
	lock.tryLock(4*60*1000);
	ss.insertRowAfter(1);
	var data = JSON.parse(args)["pennywise"];
	ss.getRange(2, 1, 1, 6).setValues([[getTime(), data.user, data.money, data.tag, data.theanon, data.ID]]);
	lock.releaseLock()
}

function item_sent(args) {
	var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sent Items");
	var lock = LockService.getScriptLock();
	lock.tryLock(4*60*1000);
	ss.insertRowAfter(1);
	var data = JSON.parse(args)["pennywise"];
	ss.getRange(2, 1, 1, 6).setValues([[getTime(), data.userName, data.item, data.amount, data.tag, data.userID]]);
	lock.releaseLock()
}

function foreign(args) {
	var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Foreign Items");
	var lock = LockService.getScriptLock();
	lock.tryLock(4*60*1000);
	ss.insertRowAfter(1);
	var data = JSON.parse(args)["pennywise"];
	ss.getRange(2, 1, 1, 6).setValues([[getTime(), data.item, data.amount, data.per_unit, data.total, data.country]]);
	lock.releaseLock();
}
function getTime() {
	var time = Utilities.formatDate(new Date(), "GMT", "dd MMMM yyyy  hh:mm:ss a");
	return time;
}