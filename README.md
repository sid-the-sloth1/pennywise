# Pennywise


Hi everyone. 

Almost 20 days ago, I came across this [thread](https://www.torn.com/forums.php?p=threads&f=67&t=16130687&b=0&a=0) and thought about how something like this could be made. I had the idea to catch server-side responses and parse them. It was first going to be an extension, but after a conversation with  [DeKleineKobini](https://www.torn.com/profiles.php?XID=2114440) who has always been a great help in my coding pursuits, I realized it would be easier to implement it as a Userscript instead. So I began the journey. I came up with this.

***What does it do?***
That's a good question. It currently records:

a) Items bought from other user's **Bazaars.**

b) Items bought from ***Item Market*** directly.

c) Items bought from **shops Abroad.**

d) Points bought from **Points Market**

e) **Items sent** to other users.

f) **Cash sent** to other users.

It has been in alpha testing for almost a week now and now I think it is time for making it Public and having more people try it and test it out. The reason I am calling it Beta version is because I know it can be made better and faster. So try it out and let me know how it works for you. I have put a lot of time and effort in this one, it will make my day to know someone finds it useful.

It includes a Tampermonkey script and a Google Sheet Spreadsheet. The script catches server-sides responses and sends them to Spreadsheet. The code in Spreadsheet parses those responses and get the required info from them. 

**How to set it up?** 


1) First of all open this [Spreadsheet](https://docs.google.com/spreadsheets/d/1RH-W6J-pbLd7m2C7kCcHX2LSQSavCMTXOzEuHMHHHgQ/edit?usp=drivesdk) . Click on **File > Make a Copy.** 
You can now delete this spreadsheet. You will be sole owner of the copied Spreadsheet. 

2)  Now open the **copied Spreadsheet**. Click on **Tools > Script Editor.**

3) Click on **Publish > Deploy as Web app**. 


![](https://toucantoco.com/img/tech_appscript-webhook/deploy-web-app.png)






Select the options as shown in the above image and click on  that blue colored  **Deploy**  button.

4) After you deploy it, it will provide you with a URL link. **Copy that Link.**

5) Now install this [Script](https://greasyfork.org/en/scripts/395141-pennywise) You are going to need to install Tampermonkey on your browser for using it. 

If you are using Yandex or Kiwi Browser then install Chrome Tampermonkey.

Download Links: 

[Tampermonkey for Chrome
](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) 

[Tampermonkey for Firefox
](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)


6) After installing the script go to [Torn Preferences](https://www.torn.com/preferences.php) page. 

You will see a box as shown below. I know it looks horrible but I suck at CSS.



![](https://i.gyazo.com/8275edd05c5a6174ec9f5f768f81d76d.jpg)



7) Put the link that you received after deploying the spreadsheet in the box as shown above and select options as per required.

8) Click on Save button. And you are good to go.

The recorded transactions will be updated in the Spreadsheet. 


*I am very new to coding and this is my first time writing a Userscript so there may be better and easier ways of achieving what I did. If you have any doubts about what a certain piece of code is doing  or you have suggestions about how to make the code better and faster, drop me a mail or post it here. I will answer all the queries and I will appreciate all sort of feedback.*


Special thanks to [tos](https://www.torn.com/profiles.php?XID=1976582#/), [Pi77bull](https://www.torn.com/profiles.php?XID=2082618#/) and [DeKleineKobini](https://www.torn.com/profiles.php?XID=2114440#/) for helping me with the script.

A huge thanks and a warm hug to [Sterling](https://www.torn.com/profiles.php?XID=1616063#/) and my awesome Faction Leader [Headjob](https://www.torn.com/profiles.php?XID=1935957#/) for helping me test it out.

Special thanks and apologies to [Malvo](https://www.torn.com/profiles.php?XID=2175250)  and [Scarlett-X](https://www.torn.com/profiles.php?XID=2095421#/) whom I spammed while testing Items and Cash sent Recording feature.

**Note: If the script is not working as intended on certain pages it maybe because it is having conflict with some other script that is active at that page. Try disabling other script, refresh the page and try again.**

First time, please be gentle.




[![](https://www.torn.com/signature.php?id=5&user=2131687&v=1528808940574)](https://www.torn.com/profiles.php?XID=2131687#/)

 
