
Pennywise

Hi everyone.

Almost 20 days ago, I came across this thread and thought about how something like this could be made. I had the idea to catch server-side responses and parse them. It was first going to be an extension, but after a conversation with DeKleineKobini who has always been a great help in my coding pursuits, I realized it would be easier to implement it as a Userscript instead. So I began the journey. I came up with this.

What does it do?

That's a good question. It currently records:

a) Items bought from other user's Bazaars.

b) Items bought from Item Market directly.

c) Items bought from shops Abroad.

d) Points bought from Points Market.

e) Items sent to other users.

f) Cash sent to other users.

It has been in alpha testing for almost a week now and now I think it is time for making it Public and having more people try it and test it out. The reason I am calling it Beta version is because I know it can be made better and faster. So try it out and let me know how it works for you. I have put a lot of time and effort in this one, it will make my day to know someone finds it useful.

It includes a Tampermonkey script and a Google Sheet Spreadsheet. The script catches server-sides responses and sends them to Spreadsheet. The code in Spreadsheet parses those responses and get the required info from them.

How to set it up?
1. 
First of all open this Spreadsheet . Click on File > Make a Copy . You can now delete this spreadsheet. You will be sole owner of the copied Spreadsheet.

2. 
Now open the copied Spreadsheet . Click on Tools > Script Editor.

3. 
Click on Publish > Deploy as Web app .

￼

Select the options as shown in the above image and click on that blue colored Deploy button.
1. 
After you deploy it, it will provide you with a URL link. Copy that Link.

2. 
Now install this Script You are going to need to install Tampermonkey on your browser for using it.

If you are using Yandex or Kiwi Browser then install Chrome Tampermonkey. Download Links:

Tampermonkey for Chrome

Tampermonkey for Firefox
1. After installing the script go to Torn Preferences page. You will see a box as shown below. I know it looks horrible but I suck at CSS.

￼

1. 
Put the link that you received after deploying the spreadsheet in the box as shown above and select options as per required.

2. 
Click on Save button. And you are good to go.

The recorded transactions will be updated in the Spreadsheet.

I am very new to coding and this is my first time writing a Userscript so there may be better and easier ways of achieving what I did. If you have any doubts about what a certain piece of code is doing or you have suggestions about how to make the code better and faster, drop me a mail or post it here. I will answer all the queries and I will appreciate all sort of feedback.

Special thanks to tos , Pi77bull and DeKleineKobini for helping me with the script.

A huge thanks and a warm hug to Sterling and my awesome Faction Leader Headjob for helping me test it out.

Special thanks and apologies to Malvo and Scarlett-X whom I spammed while testing Items and Cash sent Recording feature.

Note: If the script is not working as intended on certain pages it maybe because it is having conflict with some other script that is active at that page. Try disabling other script, refresh the page and try again.

First time, please be gentle.