// ==UserScript==
// @name        MouseHunt AutoBot
// @author      Ooi Keng Siang
// @version    	2.03
// @namespace   http://ooiks.com/blog/mousehunt-autobot
// @description A simple user script to automate sounding the hunter horn in MouseHunt game / application in Facebook.
// @include		http://mousehuntgame.com/*
// @include		https://mousehuntgame.com/*
// @include		http://www.mousehuntgame.com/*
// @include		https://www.mousehuntgame.com/*
// @include		http://apps.facebook.com/mousehunt/*
// @include		https://apps.facebook.com/mousehunt/*
// @include		http://hi5.com/friend/games/MouseHunt*
// @include		http://mousehunt.hi5.hitgrab.com/*
// ==/UserScript==





// == Basic User Preference Setting (Begin) ==
// // The variable in this section contain basic option will normally edit by most user to suit their own preference
// // Reload MouseHunt page manually if edit this script while running it for immediate effect.

// // Extra delay time before sounding the horn. (in seconds)
// // Default: 5 - 180
var hornTimeDelayMin = 5;
var hornTimeDelayMax = 180;

// // Bot aggressively by ignore all safety measure such as check horn image visible before sounding it. (true/false)
// // Note: Highly recommanded to turn off because it increase the chances of getting caugh in botting.
// // Note: It will ignore the hornTimeDelayMin and hornTimeDelayMax.
// // Note: It may take a little bit extra of CPU processing power.
var aggressiveMode = false;

// // Enable trap check once an hour. (true/false)
var enableTrapCheck = false;

// // Trap check time different value (00 minutes - 45 minutes)
// // Note: Every player had different trap check time, set your trap check time here. It only take effect if enableTrapCheck = true;
// // Example: If you have XX:00 trap check time then set 00. If you have XX:45 trap check time, then set 45.
var trapCheckTimeDiff = 45;

// // Extra delay time to trap check. (in seconds)
// // Note: It only take effect if enableTrapCheck = true;
var checkTimeDelayMin = 15;
var checkTimeDelayMax = 120;

// // Play sound when encounter king's reward (true/false)
var isKingWarningSound = true;

// // Reload the the page according to kingPauseTimeMax when encount King Reward. (true/false)
// // Note: No matter how many time you refresh, the King's Reward won't go away unless you resolve it manually.
var reloadKingReward = false;

// // Duration of pausing the script before reload the King's Reward page (in seconds)
// // Note: It only take effect if reloadKingReward = true;
var kingPauseTimeMax = 18000;

// // The script will pause if player at different location that hunt location set before. (true/false)
// // Note: Make sure you set showTimerInPage to true in order to know what is happening.
var pauseAtInvalidLocation = false;

// == Basic User Preference Setting (End) ==





// == Advance User Preference Setting (Begin) ==
// // The variable in this section contain some advance option that will change the script behavior.
// // Edit this variable only if you know what you are doing 
// // Reload MouseHunt page manually if edit this script while running it for immediate effect.

// // Display timer and message in page title. (true/false)
var showTimerInTitle = true;

// // Embed a timer in page to show next hunter horn timer, highly recommanded to turn on. (true/false)
// // Note: You may not access some option like pause at invalid location if you turn this off.
var showTimerInPage = true;

// // Display the last time the page did a refresh or reload. (true/false)
var showLastPageLoadTime = true;

// // Default time to reload the page when bot encounter error. (in seconds)
var errorReloadTime = 60;

// // Time interval for script timer to update the time. May affact timer accuracy if set too high value. (in seconds)
var timerRefreshInterval = 1;

// == Advance User Preference Setting (End) ==





// WARNING - Do not modify the code below unless you know how to read and write the script.

// All global variable declaration and default value
var scriptVersion = "2.03";
var fbPlatform = false;
var hiFivePlatform = false;
var mhPlatform = false;
var mhMobilePlatform = false;
var secureConnection = false;
var lastDateRecorded = new Date();
var hornTime = 900;
var hornTimeDelay = 0;
var checkTimeDelay = 0;
var isKingReward = false;
var isKingRewardInformed = false;
var lastKingRewardSumTime;
var kingPauseTime;
var baitQuantity = -1;
var huntLocation;
var currentLocation;
var today = new Date();
var checkTime = (today.getMinutes() >= trapCheckTimeDiff) ? 3600 + (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds()) : (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds());
today = undefined;
var hornRetryMax = 10;
var hornRetry = 0;
var nextActiveTime = 900;
var timerInterval = 2;

// element in page
var titleElement;
var nextHornTimeElement;
var checkTimeElement;
var kingTimeElement;
var lastKingRewardSumTimeElement;
var optionElement;
var travelElement;

// start executing script
exeScript();

function exeScript()
{
	// check the trap check setting first
	if (trapCheckTimeDiff == 60)
	{
		trapCheckTimeDiff = 00;
	}
	else if (trapCheckTimeDiff < 0 || trapCheckTimeDiff > 60)
	{
		// invalid value, just disable the trap check
		enableTrapCheck = false;
	}
	
	if (showTimerInTitle)
	{
		// check if they are running in iFrame
		if (window.location.href.indexOf("apps.facebook.com/mousehunt/") != -1)
		{
			var contentElement = document.getElementById('pagelet_canvas_content');
			if (contentElement)
			{
				var breakFrameDivElement = document.createElement('div');
				breakFrameDivElement.setAttribute('id', 'breakFrameDivElement');
				breakFrameDivElement.innerHTML = "Timer in title no longer can show in Facebook, if you need it, then you must run in <a href='http://www.mousehuntgame.com/'> MouseHunt official website instead</a>";
				contentElement.parentNode.insertBefore(breakFrameDivElement, contentElement);
			}
			contentElement = undefined;
		}
		else if (window.location.href.indexOf("hi5.com/friend/games/MouseHunt") != -1)
		{
			var contentElement = document.getElementById('apps-canvas-body');
			if (contentElement)
			{
				var breakFrameDivElement = document.createElement('div');
				breakFrameDivElement.setAttribute('id', 'breakFrameDivElement');
				breakFrameDivElement.innerHTML = "Timer in title no longer can show in Facebook, if you need it, then you must run in <a href='http://www.mousehuntgame.com/'> MouseHunt official website instead</a>";
				contentElement.parentNode.insertBefore(breakFrameDivElement, contentElement);
			}
			contentElement = undefined;
		}
	}
	
	// check user running this script from where
	if (window.location.href.indexOf("mousehuntgame.com/canvas/") != -1)
	{
		// from facebook
		fbPlatform = true;
	}
	else if (window.location.href.indexOf("mousehuntgame.com") != -1)
	{
		// need to check if it is running in mobile version
		var version = getCookie("switch_to");
		if (version != null && version == "mobile")
		{
			// from mousehunt game mobile version
			mhMobilePlatform = true;
		}
		else
		{
		// from mousehunt game standard version
			mhPlatform = true
		}
		version = undefined;
	}
	else if (window.location.href.indexOf("mousehunt.hi5.hitgrab.com") != -1)
	{
		// from hi5
		hiFivePlatform = true;
	}
	
	// check if user running in https secure connection
	if (window.location.href.indexOf("https://") != -1)
	{
		secureConnection = true;
	}
	else
	{
		secureConnection = false;
	}
	
	if (fbPlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// this is the page to execute the script
		if (!checkIntroContainer() && retrieveDataFirst())
		{
			// embed a place where timer show
			embedTimer(true);
			
			// embed script to horn button
			embedScript();
			
			// start script action
			action();
		}
		else
		{
			// fail to retrieve data, display error msg and reload the page
			document.title = "Fail to retrieve data from page. Reloading in " + timeformat(errorReloadTime);
			window.setTimeout(function () { reloadPage(false) }, errorReloadTime * 1000);
		}
	}
	else if (mhPlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// this is the page to execute the script
		if (!checkIntroContainer() && retrieveDataFirst())
		{
			// embed a place where timer show
			embedTimer(true);
				
			// embed script to horn button
			embedScript();
					
			// start script action
			action();
		}
		else
		{
			// fail to retrieve data, display error msg and reload the page
			document.title = "Fail to retrieve data from page. Reloading in " + timeformat(errorReloadTime);
			window.setTimeout(function () { reloadPage(false) }, errorReloadTime * 1000);
		}
	}
	else if (mhMobilePlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// embed a place where timer show
		embedTimer(false);
	}
	else if (hiFivePlatform)
	{
		// make sure all the preference already loaded
		loadPreferenceSettingFromStorage();
		
		// this is the page to execute the script
		if (!checkIntroContainer() && retrieveDataFirst())
		{
			// embed a place where timer show
			embedTimer(true);
				
			// embed script to horn button
			embedScript();
					
			// start script action
			action();
		}
		else
		{
			// fail to retrieve data, display error msg and reload the page
			document.title = "Fail to retrieve data from page. Reloading in " + timeformat(errorReloadTime);
			window.setTimeout(function () { reloadPage(false) }, errorReloadTime * 1000);
		}
	}
}

function checkIntroContainer()
{
	var gotIntroContainerDiv = false;

	var introContainerDiv = document.getElementById('introContainer');
	if (introContainerDiv)
	{
		introContainerDiv = undefined;
		gotIntroContainerDiv = true;
	}
	else
	{
		gotIntroContainerDiv = false;
	}
	
	try
	{
		return (gotIntroContainerDiv);
	}
	finally
	{
		gotIntroContainerDiv = undefined;
	}
}

// Retrieve data from source code first when the page is first loaded.
// Variable data might not be available because the game might not fully loaded at this point.
function retrieveDataFirst()
{
	var gotHornTime = false;
	var gotPuzzle = false;
	var gotBaitQuantity = false;
	var retrieveSuccess = false;
	
	var scriptElementList = document.getElementsByTagName('script');
	if (scriptElementList)
	{
		var i;
		for (i = 0; i < scriptElementList.length; ++i)
		{
			var scriptString = scriptElementList[i].innerHTML;
			
			// get next horn time
			var hornTimeStartIndex = scriptString.indexOf("next_activeturn_seconds");
			if (hornTimeStartIndex >= 0)
			{
				var nextActiveTime = 900;
				hornTimeStartIndex += 25;
				var hornTimeEndIndex = scriptString.indexOf(",", hornTimeStartIndex);
				var hornTimerString = scriptString.substring(hornTimeStartIndex, hornTimeEndIndex);
				nextActiveTime = parseInt(hornTimerString);
				
				hornTimeDelay = hornTimeDelayMin + Math.round(Math.random() * (hornTimeDelayMax - hornTimeDelayMin));
				
				if (!aggressiveMode)
				{
					// calculation base on the js in Mousehunt
					var additionalDelayTime = Math.ceil(nextActiveTime * 0.1);
				
					// need to found out the mousehunt provided timer interval to determine the additional delay
					var timerIntervalStartIndex = scriptString.indexOf("next_activeturn_seconds");
					if (timerIntervalStartIndex >= 0)
					{
						timerIntervalStartIndex += 21;
						var timerIntervalEndIndex = scriptString.indexOf(";", timerIntervalStartIndex);
						var timerIntervalString = scriptString.substring(timerIntervalStartIndex, timerIntervalEndIndex);
						var timerInterval = parseInt(timerIntervalString);
						
						// calculation base on the js in Mousehunt
						if (timerInterval == 1)
						{
							additionalDelayTime = 2;
						}
						
						timerIntervalStartIndex = undefined;
						timerIntervalEndIndex = undefined;
						timerIntervalString = undefined;
						timerInterval = undefined;
					}
					
					// safety mode, include extra delay like time in horn image appear
					//hornTime = nextActiveTime + additionalDelayTime + hornTimeDelay;
					hornTime = nextActiveTime + hornTimeDelay;
					lastDateRecorded = undefined;
					lastDateRecorded = new Date();
					
					additionalDelayTime = undefined;
				}
				else
				{
					// aggressive mode, no extra delay like time in horn image appear
					hornTime = nextActiveTime;
					lastDateRecorded = undefined;
					lastDateRecorded = new Date();
				}
				
				gotHornTime = true;
				
				hornTimeStartIndex = undefined;
				hornTimeEndIndex = undefined;
				hornTimerString = undefined;
				nextActiveTime = undefined;
			}
			
			// get is king's reward or not
			var hasPuzzleStartIndex = scriptString.indexOf("has_puzzle");
			if (hasPuzzleStartIndex >= 0)
			{
				hasPuzzleStartIndex += 12;
				var hasPuzzleEndIndex = scriptString.indexOf(",", hasPuzzleStartIndex);
				var hasPuzzleString = scriptString.substring(hasPuzzleStartIndex, hasPuzzleEndIndex);
				isKingReward = (hasPuzzleString == 'false') ? false : true;
				
				gotPuzzle = true;
				
				hasPuzzleStartIndex = undefined;
				hasPuzzleEndIndex = undefined;
				hasPuzzleString = undefined;
			}
			
			// get cheese quantity
			var baitQuantityStartIndex = scriptString.indexOf("bait_quantity");
			if (baitQuantityStartIndex >= 0)
			{
				baitQuantityStartIndex += 15;
				var baitQuantityEndIndex = scriptString.indexOf(",", baitQuantityStartIndex);
				var baitQuantityString = scriptString.substring(baitQuantityStartIndex, baitQuantityEndIndex);
				baitQuantity = parseInt(baitQuantityString);
				
				gotBaitQuantity = true;
				
				baitQuantityStartIndex = undefined;
				baitQuantityEndIndex = undefined;
				baitQuantityString = undefined;
			}
			
			var locationStartIndex;
			var locationEndIndex;
			locationStartIndex = scriptString.indexOf("location\":\"");
			if (locationStartIndex >= 0)
			{
				locationStartIndex += 11;
				locationEndIndex = scriptString.indexOf("\"", locationStartIndex);
				var locationString = scriptString.substring(locationStartIndex, locationEndIndex);
				currentLocation = locationString;
				
				locationStartIndex = undefined;
				locationEndIndex = undefined;
				locationString = undefined;
			}
			
			scriptString = undefined;
		}
		i = undefined;
	}
	scriptElementList = undefined;
	
	if (gotHornTime && gotPuzzle && gotBaitQuantity)
	{
		// get trap check time
		if (enableTrapCheck)
		{
			var today = new Date();
			checkTimeDelay = checkTimeDelayMin + Math.round(Math.random() * (checkTimeDelayMax - checkTimeDelayMin));
			checkTime = (today.getMinutes() >= trapCheckTimeDiff) ? 3600 + (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds()) : (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds());
			checkTime += checkTimeDelay;
			today = undefined;
		}
		
		// get last location
		var huntLocationCookie = getStorage("huntLocation");
		if (huntLocationCookie == undefined || huntLocationCookie == null)
		{
			huntLocation = currentLocation;
			setStorage("huntLocation", currentLocation);
		}
		else
		{
			huntLocation = huntLocationCookie;
			setStorage("huntLocation", huntLocation);
		}
		huntLocationCookie = undefined;
		
		// get last king reward time
		var lastKingRewardDate = getStorage("lastKingRewardDate");
		if (lastKingRewardDate == undefined || lastKingRewardDate == null)
		{
			lastKingRewardSumTime = -1;
		}
		else
		{
			var lastDate = new Date(lastKingRewardDate);
			lastKingRewardSumTime = parseInt((new Date() - lastDate) / 1000);
			lastDate = undefined;
		}
		lastKingRewardDate = undefined;
		
		retrieveSuccess = true;
	}
	else
	{
		retrieveSuccess = false;
	}
	
	// clean up
	gotHornTime = undefined;
	gotPuzzle = undefined;
	gotBaitQuantity = undefined;
	
	try
	{
		return (retrieveSuccess);
	}
	finally
	{
		retrieveSuccess = undefined;
	}
}

// Retrieve data from variable set by MouseHunt game for the most accurate reading.
function retrieveData()
{
	var browser = browserDetection();
	
	// get next horn time
	if (browser == "firefox")
	{
		nextActiveTime = unsafeWindow.user.next_activeturn_seconds;
		isKingReward = unsafeWindow.user.has_puzzle;
		baitQuantity = unsafeWindow.user.bait_quantity;
		currentLocation = unsafeWindow.user.location;
	}
	else if (browser == "opera")
	{
		nextActiveTime = user.next_activeturn_seconds;
		isKingReward = user.has_puzzle;
		baitQuantity = user.bait_quantity;
		currentLocation = user.location;
	}
	else if (browser == "chrome")
	{
		nextActiveTime = parseInt(getPageVariableForChrome("user.next_activeturn_seconds"));
		isKingReward = (getPageVariableForChrome("user.has_puzzle").toString() == "false") ? false : true;
		baitQuantity = parseInt(getPageVariableForChrome("user.bait_quantity"));
		currentLocation = getPageVariableForChrome("user.location");
	}
	else
	{
		window.setTimeout(function () { reloadWithMessage("Browser not supported. Reloading...", false); }, 60000);
	}
	
	browser = undefined;
	
	if (nextActiveTime == "" || isNaN(nextActiveTime))
	{
		// fail to retrieve data, might be due to slow network
		
		// reload the page to see it fix the problem
		window.setTimeout(function () { reloadWithMessage("Fail to retrieve data. Reloading...", false); }, 5000);
	}
	else
	{
		// got the timer right!
	
		// calculate the delay
		hornTimeDelay = hornTimeDelayMin + Math.round(Math.random() * (hornTimeDelayMax - hornTimeDelayMin));
	
		if (!aggressiveMode)
		{
			// calculation base on the js in Mousehunt
			var additionalDelayTime = Math.ceil(nextActiveTime * 0.1);
			if (timerInterval != "" && !isNaN(timerInterval) && timerInterval == 1)
			{
				additionalDelayTime = 2;
			}
			
			// safety mode, include extra delay like time in horn image appear
			//hornTime = nextActiveTime + additionalDelayTime + hornTimeDelay;
			hornTime = nextActiveTime + hornTimeDelay;
			lastDateRecorded = undefined;
			lastDateRecorded = new Date();
			
			additionalDelayTime = undefined;
		}
		else
		{
			// aggressive mode, no extra delay like time in horn image appear
			hornTime = nextActiveTime;
			lastDateRecorded = undefined;
			lastDateRecorded = new Date();
		}
	}
	
	// get trap check time
	if (enableTrapCheck)
	{
		var today = new Date();
		checkTimeDelay = checkTimeDelayMin + Math.round(Math.random() * (checkTimeDelayMax - checkTimeDelayMin));
		checkTime = (today.getMinutes() >= trapCheckTimeDiff) ? 3600 + (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds()) : (trapCheckTimeDiff * 60) - (today.getMinutes() * 60 + today.getSeconds());
		checkTime += checkTimeDelay;
		today = undefined;
	}
}

function getPageVariable(name, value)
{
	if (name == "user.next_activeturn_seconds")
	{
		nextActiveTime = parseInt(value);
	}
	else if (name == "hud.timer_interval")
	{
		timerInterval = parseInt(value);
	}
	else if (name == "user.has_puzzle")
	{
		isKingReward = (value.toString() == true) ? true : false;
	}
	else if (name == "user.bait_quantity")
	{
		baitQuantity = parseInt(value);
	}
	else if (name == "user.location")
	{
		currentLocation = value.toString();
	}
	
	name = undefined;
	value = undefined;
}

function checkJournalDate()
{
	var reload = false;

	var journalDateDiv = document.getElementsByClassName('journaldate');
	if (journalDateDiv)
	{
		var journalDateStr = journalDateDiv[0].innerHTML.toString();
		var midIndex = journalDateStr.indexOf(":", 0);
		var spaceIndex = journalDateStr.indexOf(" ", midIndex);
		
		if (midIndex >= 1)
		{
			var hrStr = journalDateStr.substring(0, midIndex);
			var minStr = journalDateStr.substring(midIndex + 1, 2);
			var hourSysStr = journalDateStr.substring(spaceIndex + 1, 2);
			
			var nowDate = new Date();
			var lastHuntDate = new Date();
			if (hourSysStr == "am")
			{
				lastHuntDate.setHours(parseInt(hrStr), parseInt(minStr), 0, 0);
			}
			else
			{
				lastHuntDate.setHours(parseInt(hrStr) + 12, parseInt(minStr), 0, 0);
			}
			if (parseInt(nowDate - lastHuntDate) / 1000 > 900)
			{
				reload = true;
			}
			hrStr = undefined;
			minStr = undefined;
			nowDate = undefined;
			lastHuntDate = undefined;
		}
		else
		{
			reload = true;
		}
		
		journalDateStr = undefined;
		midIndex = undefined;
		spaceIndex = undefined;
	}
	journalDateDiv = undefined;
	
	if (reload)
	{
		reloadWithMessage("Timer error. Try reload to fix.", true);
	}
	
	try
	{
		return (reload);
	}
	finally
	{
		reload = undefined;
	}
}

function action()
{
	if (isKingReward)
	{
		kingRewardAction();
	}
	else if (pauseAtInvalidLocation && (huntLocation != currentLocation))
	{
		// update timer
		displayTimer("Out of pre-defined hunting location...", "Out of pre-defined hunting location...", "Out of pre-defined hunting location...");
		
		if (fbPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (hiFivePlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (mhPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		
		displayKingRewardSumTime(null);
		
		// pause script
	}
	else if (baitQuantity == 0)
	{
		// update timer
		displayTimer("No more cheese!", "Cannot hunt without the cheese...", "Cannot hunt without the cheese...");
		displayLocation(huntLocation);
		displayKingRewardSumTime(null);
		
		// pause the script
	}
	else
	{
		// update location
		displayLocation(huntLocation);
	
		var isHornSounding = false;
	
		// check if the horn image is visible
		var headerElement;
		headerElement = document.getElementById('header');
		if (headerElement)
		{
			var headerStatus = headerElement.getAttribute('class');
			if (headerStatus.indexOf("hornready") != -1)
			{
				// if the horn image is visible, why do we need to wait any more, sound the horn!
				soundHorn();
				
				// make sure the timer don't run twice!
				isHornSounding = true;
			}
			headerStatus = undefined;
		}
		headerElement = undefined;
	
		if (isHornSounding == false)
		{
			// start timer
			window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
		}
		
		isHornSounding = undefined;
	}
}

function countdownTimer()
{
	if (isKingReward)
	{
		// update timer
		displayTimer("King's Reward!", "King's Reward!", "King's Reward");
		displayKingRewardSumTime("Now");
		
		// record last king's reward time
		var nowDate = new Date();
		setStorage("lastKingRewardDate", nowDate.toString());
		nowDate = undefined;
		lastKingRewardSumTime = 0;
		
		// reload the page so that the sound can be play
		gotoCamp(true);

		// don't continue
		return;
	}

	// check if king reward is happening


	// check if player is in camp
	if (checkIsInCamp())
	{
		// player in camp
	}
	else
	{
		// player in camp
	}

	if (pauseAtInvalidLocation && (huntLocation != currentLocation))
	{
		// update timer
		displayTimer("Out of pre-defined hunting location...", "Out of pre-defined hunting location...", "Out of pre-defined hunting location...");
		if (fbPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/canvas/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (hiFivePlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://mousehunt.hi5.hitgrab.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		else if (mhPlatform)
		{
			if (secureConnection)
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='https://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
			else
			{
				displayLocation("<font color='red'>" + currentLocation + "</font> [<a onclick='window.localStorage.removeItem(\"huntLocation\");' href='http://www.mousehuntgame.com/\'>Hunt Here</a>] - <i>Script pause because you had move to a different location recently, click hunt here to continue hunt at this location.</i>");
			}
		}
		displayKingRewardSumTime(null);
		
		// pause script
	}
	else if (baitQuantity == 0)
	{
		// update timer
		displayTimer("No more cheese!", "Cannot hunt without the cheese...", "Cannot hunt without the cheese...");
		displayLocation(huntLocation);
		displayKingRewardSumTime(null);
		
		// pause the script
	}
	else
	{
		var dateNow = new Date();
		var intervalTime = timeElapsed(lastDateRecorded, dateNow);
		lastDateRecorded = undefined;
		lastDateRecorded = dateNow;
		dateNow = undefined;
	
		if (enableTrapCheck)
		{
			// update time
			hornTime -= intervalTime;
			checkTime -= intervalTime;
			if (lastKingRewardSumTime != -1)
			{
				lastKingRewardSumTime += intervalTime;
			}
		}
		else
		{
			// update time
			hornTime -= intervalTime;
			if (lastKingRewardSumTime != -1)
			{
				lastKingRewardSumTime += intervalTime;
			}
		}
		
		intervalTime = undefined;
	
		if (hornTime <= 0)
		{
			// blow the horn!
			soundHorn();
		}
		else if (enableTrapCheck && checkTime <= 0)
		{
			// trap check!
			trapCheck();
		}
		else
		{
			if (enableTrapCheck)
			{
				// update timer
				if (!aggressiveMode)
				{
					displayTimer("Horn: " + timeformat(hornTime) + " | Check: " + timeformat(checkTime), 
						timeformat(hornTime) + "  <i>(included extra " + timeformat(hornTimeDelay) + " delay & +/- 5 seconds different from MouseHunt timer)</i>", 
						timeformat(checkTime) + "  <i>(included extra " + timeformat(checkTimeDelay) + " delay)</i>");
				}
				else
				{
					displayTimer("Horn: " + timeformat(hornTime) + " | Check: " + timeformat(checkTime), 
						timeformat(hornTime) + "  <i>(lot faster than MouseHunt timer)</i>", 
						timeformat(checkTime) + "  <i>(included extra " + timeformat(checkTimeDelay) + " delay)</i>");
				}
			}
			else
			{
				// update timer
				if (!aggressiveMode)
				{
					displayTimer("Horn: " + timeformat(hornTime), 
						timeformat(hornTime) + "  <i>(included extra " + timeformat(hornTimeDelay) + " delay & +/- 5 seconds different from MouseHunt timer)</i>", 
						"-");
					
					// check if user manaually sounded the horn
					var scriptNode = document.getElementById("scriptNode");
					if (scriptNode)
					{
						var isHornSounded = scriptNode.getAttribute("soundedHornAtt");
						if (isHornSounded == "true")
						{
							// sound horn function do the rest
							soundHorn();
							
							// stop loopping
							return;
						}
						isHornSounded = undefined;
					}		
					scriptNode = undefined;
				}
				else
				{
					displayTimer("Horn: " + timeformat(hornTime), 
						timeformat(hornTime) + "  <i>(lot faster than MouseHunt timer)</i>", 
						"-");
					
					// agressive mode should sound the horn whenever it is possible to do so.
					var headerElement = document.getElementById('header');
					if (headerElement)
					{
						// the horn image appear before the timer end
						if (headerElement.getAttribute('class').indexOf("hornready") != -1)
						{
							// who care, blow the horn first!
							soundHorn();
							
							headerElement = undefined;
							
							// skip all the code below
							return;
						}
					}
					headerElement = undefined;
				}
			}
			
			// set king reward sum time
			displayKingRewardSumTime(timeFormatLong(lastKingRewardSumTime));
			
			window.setTimeout(function () { (countdownTimer)() }, timerRefreshInterval * 1000);
		}
	}
}

function checkIsInCamp()
{
	var isInCamp = false;

	var containerNode = document.getElementById("mousehuntContainer");
	if (containerNode)
	{
		var containerClass = containerNode.getAttribute('class');
		isInCamp = containerClass.indexOf("PageCamp") == 0;
	}

	return isInCamp;
}

function gotoCamp(reloadIfFail)
{
	// simulate mouse click on the camp button
	var campElement = document.getElementsByClassName('camp  ')[0].firstChild;
	if (campElement)
	{
		fireEvent(campElement, 'click');
		campElement = null;
	}

	if (reloadIfFail)
	{
		// reload the page if click on the camp button fail
		window.setTimeout(function () { (confirmGotoCamp)() }, 5000);
	}
}

function confirmGotoCamp()
{
	if (!checkIsInCamp())
	{
		reloadWithMessage("Fail to click on camp button. Reloading...", false);
	}
}




function reloadPage(soundHorn)
{
	// reload the page
	if (fbPlatform)
	{
		// for Facebook only

		if (secureConnection)
		{
			if (soundHorn)
			{
				window.location.href = "https://www.mousehuntgame.com/canvas/turn.php";
			}
			else
			{
				window.location.href = "https://www.mousehuntgame.com/canvas/";
			}
		}
		else
		{
			if (soundHorn)
			{
				window.location.href = "http://www.mousehuntgame.com/canvas/turn.php";
			}
			else
			{
				window.location.href = "http://www.mousehuntgame.com/canvas/";
			}
		}
	}
	else if (hiFivePlatform)
	{
		// for Hi5 only
	
		if (secureConnection)
		{
			if (soundHorn)
			{
				window.location.href = "https://mousehunt.hi5.hitgrab.com/turn.php";
			}
			else
			{
				window.location.href = "https://mousehunt.hi5.hitgrab.com/";
			}
		}
		else
		{
			if (soundHorn)
			{
				window.location.href = "http://mousehunt.hi5.hitgrab.com/turn.php";
			}
			else
			{
				window.location.href = "http://mousehunt.hi5.hitgrab.com/";
			}
		}
	}
	else if (mhPlatform)
	{
		// for mousehunt game only
		
		if (secureConnection)
		{
			if (soundHorn)
			{
				window.location.href = "https://mousehuntgame.com/turn.php";
			}
			else
			{
				window.location.href = "https://mousehuntgame.com/";
			}
		}
		else
		{
			if (soundHorn)
			{
				window.location.href = "http://mousehuntgame.com/turn.php";
			}
			else
			{
				window.location.href = "http://mousehuntgame.com/";
			}
		}
	}
	
	soundHorn = undefined;
}

function reloadWithMessage(msg, soundHorn)
{
	// display the message
	displayTimer(msg, msg, msg, msg);
	
	// reload the page
	reloadPage(soundHorn);
	
	msg = undefined;
	soundHorn = undefined;
}

// ################################################################################################
//   Timer Function - Start
// ################################################################################################

function embedTimer(targetPage)
{
	if (showTimerInPage)
	{
		var headerElement;
		if (fbPlatform || hiFivePlatform || mhPlatform)
		{
			headerElement = document.getElementById('noscript');
		}
		else if (mhMobilePlatform)
		{
			headerElement = document.getElementById('mobileHorn');
		}
		
		if (headerElement)
		{
			var timerDivElement = document.createElement('div');
			
			var hr1Element = document.createElement('hr');
			timerDivElement.appendChild(hr1Element);
			hr1Element = null;
			
			// show bot title and version
			var titleElement = document.createElement('div');
			titleElement.setAttribute('id', 'titleElement');
			if (targetPage && aggressiveMode)
			{
				titleElement.innerHTML = "<a href=\"http://ooiks.com/blog/category/mousehunt-autobot\" target=\"_blank\"><b>MouseHunt AutoBot (version " + scriptVersion + ")</b></a> - <font color='red'>Aggressive Mode</font>";
			}
			else
			{
				titleElement.innerHTML = "<a href=\"http://ooiks.com/blog/category/mousehunt-autobot\" target=\"_blank\"><b>MouseHunt AutoBot (version " + scriptVersion + ")</b></a>";
			}
			timerDivElement.appendChild(titleElement);
			titleElement = null;
			
			if (targetPage)
			{
				nextHornTimeElement = document.createElement('div');
				nextHornTimeElement.setAttribute('id', 'nextHornTimeElement');
				nextHornTimeElement.innerHTML = "<b>Next Hunter Horn Time:</b> Loading...";
				timerDivElement.appendChild(nextHornTimeElement);
				
				checkTimeElement = document.createElement('div');
				checkTimeElement.setAttribute('id', 'checkTimeElement');
				checkTimeElement.innerHTML = "<b>Next Trap Check Time:</b> Loading...";
				timerDivElement.appendChild(checkTimeElement);
				
				if (pauseAtInvalidLocation)
				{
					// location information only display when enable this feature
					travelElement = document.createElement('div');
					travelElement.setAttribute('id', 'travelElement');
					travelElement.innerHTML = "<b>Target Hunt Location:</b> Loading...";
					timerDivElement.appendChild(travelElement);
				}
				
				var lastKingRewardDate = getStorage("lastKingRewardDate");
				var lastDateStr;
				if (lastKingRewardDate == undefined || lastKingRewardDate == null)
				{
					lastDateStr = "-";
				}
				else
				{
					var lastDate = new Date(lastKingRewardDate);
					lastDateStr = lastDate.toDateString() + " " + lastDate.toTimeString().substring(0, 8);
					lastDate = null;
				}
				
				kingTimeElement = document.createElement('div');
				kingTimeElement.setAttribute('id', 'kingTimeElement');
				kingTimeElement.innerHTML = "<b>Last King's Reward:</b> " + lastDateStr + " ";
				timerDivElement.appendChild(kingTimeElement);
				
				lastKingRewardSumTimeElement = document.createElement('font');
				lastKingRewardSumTimeElement.setAttribute('id', 'lastKingRewardSumTimeElement');
				lastKingRewardSumTimeElement.innerHTML = "(Loading...)";
				kingTimeElement.appendChild(lastKingRewardSumTimeElement);
				
				lastKingRewardDate = null;
				lastDateStr = null;
				
				if (showLastPageLoadTime)
				{
					var nowDate = new Date();
				
					// last page load time
					var loadTimeElement = document.createElement('div');
					loadTimeElement.setAttribute('id', 'loadTimeElement');
					loadTimeElement.innerHTML = "<b>Last Page Load: </b>" + nowDate.toDateString() + " " + nowDate.toTimeString().substring(0, 8);
					timerDivElement.appendChild(loadTimeElement);
					
					loadTimeElement = null;
					nowDate = null;
				}
			}
			else
			{
				// player currently navigating other page instead of hunter camp
				var helpTextElement = document.createElement('div');
				helpTextElement.setAttribute('id', 'helpTextElement');
				if (fbPlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='https://www.mousehuntgame.com/canvas/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='http://www.mousehuntgame.com/canvas/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
				}
				else if (hiFivePlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='https://mousehunt.hi5.hitgrab.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='http://mousehunt.hi5.hitgrab.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
				}
				else if (mhPlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='https://mousehuntgame.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> MouseHunt AutoBot will only run at <a href='http://mousehuntgame.com/'>Hunter Camp</a>. This is to prevent the bot from interfering user's activity.";
					}
				}
				else if (mhMobilePlatform)
				{
					if (secureConnection)
					{
						helpTextElement.innerHTML = "<b>Note:</b> Mobile version of Mousehunt is not supported currently. Please use the <a href='https://www.mousehuntgame.com/?switch_to=standard'>standard version of MouseHunt</a>.";
					}
					else
					{
						helpTextElement.innerHTML = "<b>Note:</b> Mobile version of Mousehunt is not supported currently. Please use the <a href='http://www.mousehuntgame.com/?switch_to=standard'>standard version of MouseHunt</a>.";
					}
				}
				timerDivElement.appendChild(helpTextElement);
				
				helpTextElement = null;
			}
			
			var showPreference = getStorage('showPreference');
			if (showPreference == undefined || showPreference == null)
			{
				showPreference = false;
				setStorage("showPreference", showPreference);
			}

			var buyDevCheeseLink = document.createElement('a');
			buyDevCheeseLink.setAttribute('id', 'buyDevCheeseLink');
			buyDevCheeseLink.setAttribute('href', 'http://ooiks.com/donate');
			buyDevCheeseLink.setAttribute('target', '_blank');
			buyDevCheeseLink.innerHTML = 'Buy some cheeses for developer';
			timerDivElement.appendChild(buyDevCheeseLink);
			buyDevCheeseLink = null;
			
			var showPreferenceLinkDiv = document.createElement('div');
			showPreferenceLinkDiv.setAttribute('id', 'showPreferenceLinkDiv');
			showPreferenceLinkDiv.setAttribute('style', 'text-align:right');
			timerDivElement.appendChild(showPreferenceLinkDiv);
			
			var showPreferenceSpan = document.createElement('span');
			var showPreferenceLinkStr = '<a id="showPreferenceLink" name="showPreferenceLink" onclick="if (document.getElementById(\'showPreferenceLink\').innerHTML == \'<b>[Hide Preference]</b>\') { document.getElementById(\'preferenceDiv\').style.display=\'none\';  document.getElementById(\'showPreferenceLink\').innerHTML=\'<b>[Show Preference]</b>\'; } else { document.getElementById(\'preferenceDiv\').style.display=\'block\'; document.getElementById(\'showPreferenceLink\').innerHTML=\'<b>[Hide Preference]</b>\'; }">';
			if (showPreference == true)
				showPreferenceLinkStr += '<b>[Hide Preference]</b>';
			else
				showPreferenceLinkStr += '<b>[Show Preference]</b>';
			showPreferenceLinkStr += '</a>';
			showPreferenceLinkStr += '&nbsp;&nbsp;&nbsp;';
			showPreferenceSpan.innerHTML = showPreferenceLinkStr;
			showPreferenceLinkDiv.appendChild(showPreferenceSpan);
			showPreferenceLinkStr = null;
			showPreferenceSpan = null;
			showPreferenceLinkDiv = null;
			
			var hr2Element = document.createElement('hr');
			timerDivElement.appendChild(hr2Element);
			hr2Element = null;
			
			var preferenceHTMLStr = '<table border="0" width="100%">';
			if (aggressiveMode)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Bot aggressively by ignore all safety measure such as check horn image visible before sounding it">';
				preferenceHTMLStr += '<b>Aggressive Mode</b>';
				preferenceHTMLStr += '</a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputTrue" name="AggressiveModeInput" value="true" onchange="if (document.getElementById(\'AggressiveModeInputTrue\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'disabled\';}" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputFalse" name="AggressiveModeInput" value="false" onchange="if (document.getElementById(\'AggressiveModeInputFalse\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'\';}"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time before sounding the horn (in seconds)">';
				preferenceHTMLStr += '<b>Horn Time Delay</b>';
				preferenceHTMLStr += '</a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMinInput" name="HornTimeDelayMinInput" disabled="disabled" value="' + hornTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMaxInput" name="HornTimeDelayMaxInput" disabled="disabled" value="' + hornTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Bot aggressively by ignore all safety measure such as check horn image visible before sounding it">';
				preferenceHTMLStr += '<b>Aggressive Mode</b>';
				preferenceHTMLStr += '</a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputTrue" name="AggressiveModeInput" value="true" onchange="if (document.getElementById(\'AggressiveModeInputTrue\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'disabled\';}"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="AggressiveModeInputFalse" name="AggressiveModeInput" value="false" onchange="if (document.getElementById(\'AggressiveModeInputFalse\').checked == true) { document.getElementById(\'HornTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'HornTimeDelayMaxInput\').disabled=\'\';}" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time before sounding the horn (in seconds)">';
				preferenceHTMLStr += '<b>Horn Time Delay</b>';
				preferenceHTMLStr += '</a>&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMinInput" name="HornTimeDelayMinInput" value="' + hornTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="HornTimeDelayMaxInput" name="HornTimeDelayMaxInput" value="' + hornTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (enableTrapCheck)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Enable trap check once an hour"><b>Trap Check</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputTrue" name="TrapCheckInput" value="true" onchange="if (document.getElementById(\'TrapCheckInputTrue\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'\';}" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputFalse" name="TrapCheckInput" value="false" onchange="if (document.getElementById(\'TrapCheckInputFalse\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'disabled\';}"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Trap check time different value (00 minutes / 15 minutes / 30 minutes / 45 minutes)"><b>Trap Check Time Offset</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeOffsetInput" name="TrapCheckTimeOffsetInput" value="' + trapCheckTimeDiff.toString() + '"/> minutes';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time to trap check (in seconds)"><b>Trap Check Time Delay</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMinInput" name="TrapCheckTimeDelayMinInput" value="' + checkTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMaxInput" name="TrapCheckTimeDelayMaxInput" value="' + checkTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Enable trap check once an hour"><b>Trap Check</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputTrue" name="TrapCheckInput" value="true" onchange="if (document.getElementById(\'TrapCheckInputTrue\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'\';}"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="TrapCheckInputFalse" name="TrapCheckInput" value="false" onchange="if (document.getElementById(\'TrapCheckInputFalse\').checked == true) { document.getElementById(\'TrapCheckTimeOffsetInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMinInput\').disabled=\'disabled\'; document.getElementById(\'TrapCheckTimeDelayMaxInput\').disabled=\'disabled\';}" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Trap check time different value (00 minutes - 45 minutes)"><b>Trap Check Time Offset</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeOffsetInput" name="TrapCheckTimeOffsetInput" disabled="disabled" value="' + trapCheckTimeDiff.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Extra delay time to trap check (in seconds)"><b>Trap Check Time Delay</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMinInput" name="TrapCheckTimeDelayMinInput" disabled="disabled" value="' + checkTimeDelayMin.toString() + '"/> seconds';
				preferenceHTMLStr += ' ~ ';
				preferenceHTMLStr += '<input type="text" id="TrapCheckTimeDelayMaxInput" name="TrapCheckTimeDelayMaxInput" disabled="disabled" value="' + checkTimeDelayMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (isKingWarningSound)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Play sound when encounter king\'s reward"><b>Play King Reward Sound</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputTrue" name="PlayKingRewardSoundInput" value="true" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputFalse" name="PlayKingRewardSoundInput" value="false" /> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Play sound when encounter king\'s reward"><b>Play King Reward Sound</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputTrue" name="PlayKingRewardSoundInput" value="true" /> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PlayKingRewardSoundInputFalse" name="PlayKingRewardSoundInput" value="false" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (reloadKingReward)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Reload the the page according to King Reward Resume Time when encount King Reward"><b>King Reward Resume</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputTrue" name="KingRewardResumeInput" value="true" onchange="if (document.getElementById(\'KingRewardResumeInputTrue\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'\'; }" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputFalse" name="KingRewardResumeInput" value="false" onchange="if (document.getElementById(\'KingRewardResumeInputFalse\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'disabled\'; }"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Duration of pausing the script before reload the King\'s Reward page (in seconds)"><b>King Reward Resume Time</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="KingRewardResumeTimeInput" name="KingRewardResumeTimeInput" value="' + kingPauseTimeMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Reload the the page according to King Reward Resume Time when encounter King Reward"><b>King Reward Resume</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputTrue" name="KingRewardResumeInput" value="true" onchange="if (document.getElementById(\'KingRewardResumeInputTrue\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'\'; }"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="KingRewardResumeInputFalse" name="KingRewardResumeInput" value="false" onchange="if (document.getElementById(\'KingRewardResumeInputFalse\').checked == true) { document.getElementById(\'KingRewardResumeTimeInput\').disabled=\'disabled\'; }" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="Duration of pausing the script before reload the King\'s Reward page (in seconds)"><b>King Reward Resume Time</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="text" id="KingRewardResumeTimeInput" name="KingRewardResumeTimeInput" disabled="disabled" value="' + kingPauseTimeMax.toString() + '"/> seconds';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			if (pauseAtInvalidLocation)
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="The script will pause if player at different location that hunt location set before"><b>Remember Location</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputTrue" name="PauseLocationInput" value="true" checked="checked"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputFalse" name="PauseLocationInput" value="false" /> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			else
			{
				preferenceHTMLStr += '<tr>';
				preferenceHTMLStr += '<td style="height:24px; text-align:right;">';
				preferenceHTMLStr += '<a title="The script will pause if player at different location that hunt location set before"><b>Remember Location</b></a>';
				preferenceHTMLStr += '&nbsp;&nbsp;:&nbsp;&nbsp;';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '<td style="height:24px">';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputTrue" name="PauseLocationInput" value="true"/> True';
				preferenceHTMLStr += '   ';
				preferenceHTMLStr += '<input type="radio" id="PauseLocationInputFalse" name="PauseLocationInput" value="false" checked="checked"/> False';
				preferenceHTMLStr += '</td>';
				preferenceHTMLStr += '</tr>';
			}
			
			preferenceHTMLStr += '<tr>';
			preferenceHTMLStr += '<td style="height:24px; text-align:right;" colspan="2">';
			preferenceHTMLStr += '(Changes only take place after user save the preference) ';
			preferenceHTMLStr += '<input type="button" id="PreferenceSaveInput" value="Save" onclick="	\
				if (document.getElementById(\'AggressiveModeInputTrue\').checked == true) { window.localStorage.setItem(\'AggressiveMode\', \'true\'); } else { window.localStorage.setItem(\'AggressiveMode\', \'false\'); }	\
				window.localStorage.setItem(\'HornTimeDelayMin\', document.getElementById(\'HornTimeDelayMinInput\').value); window.localStorage.setItem(\'HornTimeDelayMax\', document.getElementById(\'HornTimeDelayMaxInput\').value);	\
				if (document.getElementById(\'TrapCheckInputTrue\').checked == true) { window.localStorage.setItem(\'TrapCheck\', \'true\'); } else { window.localStorage.setItem(\'TrapCheck\', \'false\'); }	\
				window.localStorage.setItem(\'TrapCheckTimeOffset\', document.getElementById(\'TrapCheckTimeOffsetInput\').value);	\
				window.localStorage.setItem(\'TrapCheckTimeDelayMin\', document.getElementById(\'TrapCheckTimeDelayMinInput\').value); window.localStorage.setItem(\'TrapCheckTimeDelayMax\', document.getElementById(\'TrapCheckTimeDelayMaxInput\').value);	\
				if (document.getElementById(\'PlayKingRewardSoundInputTrue\').checked == true) { window.localStorage.setItem(\'PlayKingRewardSound\', \'true\'); } else { window.localStorage.setItem(\'PlayKingRewardSound\', \'false\'); }	\
				if (document.getElementById(\'KingRewardResumeInputTrue\').checked == true) { window.localStorage.setItem(\'KingRewardResume\', \'true\'); } else { window.localStorage.setItem(\'KingRewardResume\', \'false\'); }	\
				window.localStorage.setItem(\'KingRewardResumeTime\', document.getElementById(\'KingRewardResumeTimeInput\').value);	\
				if (document.getElementById(\'PauseLocationInputTrue\').checked == true) { window.localStorage.setItem(\'PauseLocation\', \'true\'); } else { window.localStorage.setItem(\'PauseLocation\', \'false\'); }	\
				';
			if (fbPlatform)
			{
				if (secureConnection)
					preferenceHTMLStr += 'window.location.href=\'https://www.mousehuntgame.com/canvas/\';"/>';
				else
					preferenceHTMLStr += 'window.location.href=\'http://www.mousehuntgame.com/canvas/\';"/>';
			}
			else if (hiFivePlatform)
			{
				if (secureConnection)
					preferenceHTMLStr += 'window.location.href=\'https://mousehunt.hi5.hitgrab.com/\';"/>';
				else
					preferenceHTMLStr += 'window.location.href=\'http://mousehunt.hi5.hitgrab.com/\';"/>';
			}
			else if (mhPlatform)
			{
				if (secureConnection)
					preferenceHTMLStr += 'window.location.href=\'https://mousehuntgame.com/\';"/>';
				else
					preferenceHTMLStr += 'window.location.href=\'http://mousehuntgame.com/\';"/>';
			}
			preferenceHTMLStr += '&nbsp;&nbsp;&nbsp;</td>';
			preferenceHTMLStr += '</tr>';
			preferenceHTMLStr += '</table>';

			var preferenceDiv = document.createElement('div');
			preferenceDiv.setAttribute('id', 'preferenceDiv');
			if (showPreference == true)
				preferenceDiv.setAttribute('style', 'display: block');
			else
				preferenceDiv.setAttribute('style', 'display: none');
			preferenceDiv.innerHTML = preferenceHTMLStr;
			timerDivElement.appendChild(preferenceDiv);
			preferenceHTMLStr = null;
			showPreference = null;

			var hr3Element = document.createElement('hr');
			preferenceDiv.appendChild(hr3Element);
			hr3Element = null;
			preferenceDiv = null;
			
			// embed all msg to the page
			headerElement.parentNode.insertBefore(timerDivElement, headerElement);
			
			timerDivElement = null;
		}
		headerElement = null;
	}
	
	targetPage = null;
}

function loadPreferenceSettingFromStorage()
{
	var aggressiveModeTemp = getStorage("AggressiveMode");
	if (aggressiveModeTemp == undefined || aggressiveModeTemp == null)
	{
		setStorage("AggressiveMode", aggressiveMode.toString());
	}
	else if (aggressiveModeTemp == true || aggressiveModeTemp.toLowerCase() == "true")
	{
		aggressiveMode = true;
	}
	else
	{
		aggressiveMode = false;
	}
	aggressiveModeTemp = undefined;
	
	var hornTimeDelayMinTemp = getStorage("HornTimeDelayMin");
	var hornTimeDelayMaxTemp = getStorage("HornTimeDelayMax");
	if (hornTimeDelayMinTemp == undefined || hornTimeDelayMinTemp == null || hornTimeDelayMaxTemp == undefined || hornTimeDelayMaxTemp == null)
	{
		setStorage("HornTimeDelayMin", hornTimeDelayMin);
		setStorage("HornTimeDelayMax", hornTimeDelayMax);
	}
	else
	{
		hornTimeDelayMin = parseInt(hornTimeDelayMinTemp);
		hornTimeDelayMax = parseInt(hornTimeDelayMaxTemp);
	}
	hornTimeDelayMinTemp = undefined;
	hornTimeDelayMaxTemp = undefined;
	
	var trapCheckTemp = getStorage("TrapCheck");
	if (trapCheckTemp == undefined || trapCheckTemp == null)
	{
		setStorage("TrapCheck", enableTrapCheck.toString());
	}
	else if (trapCheckTemp == true || trapCheckTemp.toLowerCase() == "true")
	{
		enableTrapCheck = true;
	}
	else
	{
		enableTrapCheck = false;
	}
	trapCheckTemp = undefined;
	
	var trapCheckTimeOffsetTemp = getStorage("TrapCheckTimeOffset");
	if (trapCheckTimeOffsetTemp == undefined || trapCheckTimeOffsetTemp == null)
	{
		setStorage("TrapCheckTimeOffset", trapCheckTimeDiff);
	}
	else
	{
		trapCheckTimeDiff = parseInt(trapCheckTimeOffsetTemp);
	}
	trapCheckTimeOffsetTemp = undefined;
	
	var trapCheckTimeDelayMinTemp = getStorage("TrapCheckTimeDelayMin");
	var trapCheckTimeDelayMaxTemp = getStorage("TrapCheckTimeDelayMax");
	if (trapCheckTimeDelayMinTemp == undefined || trapCheckTimeDelayMinTemp == null || trapCheckTimeDelayMaxTemp == undefined || trapCheckTimeDelayMaxTemp == null)
	{
		setStorage("TrapCheckTimeDelayMin", checkTimeDelayMin);
		setStorage("TrapCheckTimeDelayMax", checkTimeDelayMax);
	}
	else
	{
		checkTimeDelayMin = parseInt(trapCheckTimeDelayMinTemp);
		checkTimeDelayMax = parseInt(trapCheckTimeDelayMaxTemp);
	}
	trapCheckTimeDelayMinTemp = undefined;
	trapCheckTimeDelayMaxTemp = undefined;
	
	var playKingRewardSoundTemp = getStorage("PlayKingRewardSound");
	if (playKingRewardSoundTemp == undefined || playKingRewardSoundTemp == null)
	{
		setStorage("PlayKingRewardSound", isKingWarningSound.toString());
	}
	else if (playKingRewardSoundTemp == true || playKingRewardSoundTemp.toLowerCase() == "true")
	{
		isKingWarningSound = true;
	}
	else
	{
		isKingWarningSound = false;
	}
	playKingRewardSoundTemp = undefined;
	
	var kingRewardResumeTemp = getStorage("KingRewardResume");
	if (kingRewardResumeTemp == undefined || kingRewardResumeTemp == null)
	{
		setStorage("KingRewardResume", reloadKingReward.toString());
	}
	else if (kingRewardResumeTemp == true || kingRewardResumeTemp.toLowerCase() == "true")
	{
		reloadKingReward = true;
	}
	else
	{
		reloadKingReward = false;
	}
	kingRewardResumeTemp = undefined;
	
	var kingRewardResumeTimeTemp = getStorage("KingRewardResumeTime");
	if (kingRewardResumeTimeTemp == undefined || kingRewardResumeTimeTemp == null)
	{
		setStorage("KingRewardResumeTime", kingPauseTimeMax);
	}
	else
	{
		kingPauseTimeMax = parseInt(kingRewardResumeTimeTemp);
	}
	kingRewardResumeTimeTemp = undefined;
	
	var pauseLocationTemp = getStorage("PauseLocation");
	if (pauseLocationTemp == undefined || pauseLocationTemp == null)
	{
		setStorage("PauseLocation", pauseAtInvalidLocation.toString());
	}
	else if (pauseLocationTemp == true || pauseLocationTemp.toLowerCase() == "true")
	{
		pauseAtInvalidLocation = true;
	}
	else
	{
		pauseAtInvalidLocation = false;
	}
	pauseLocationTemp = undefined;
}

function displayTimer(title, nextHornTime, checkTime)
{
	if (showTimerInTitle)
	{
		document.title = title;
	}
	
	if (showTimerInPage)
	{
		nextHornTimeElement.innerHTML = "<b>Next Hunter Horn Time:</b> " + nextHornTime;
		checkTimeElement.innerHTML = "<b>Next Trap Check Time:</b> " + checkTime;
	}
	
	title = null;
	nextHornTime = null;
	checkTime = null;
}

function displayLocation(locStr)
{
	if (showTimerInPage && pauseAtInvalidLocation)
	{
		travelElement.innerHTML = "<b>Hunt Location:</b> " + locStr;
	}
	
	locStr = null;
}

function displayKingRewardSumTime(timeStr)
{
	if (showTimerInPage)
	{
		if (timeStr)
		{
			lastKingRewardSumTimeElement.innerHTML = "(" + timeStr + ")";
		}
		else
		{
			lastKingRewardSumTimeElement.innerHTML = "";
		}
	}
	
	timeStr = null;
}

// ################################################################################################
//   Timer Function - End
// ################################################################################################



// ################################################################################################
//   Horn Function - Start
// ################################################################################################

function soundHorn()
{
	// update timer
	displayTimer("Ready to Blow The Horn...", "Ready to Blow The Horn...", "Ready to Blow The Horn...");
	
	var scriptNode = document.getElementById("scriptNode");
	if (scriptNode)
	{
		// reset the attribute that we use to keep track if user sounded the horn
		scriptNode.setAttribute("soundedHornAtt", "false");
	}		
	scriptNode = null;
	
	if (!aggressiveMode)
	{
		// safety mode, check the horn image is there or not before sound the horn
		var headerElement = document.getElementById('envHeaderImg');
		if (headerElement)
		{
			// need to make sure that the horn image is ready before we can click on it
			var headerStatus = headerElement.getAttribute('class');
			if (headerStatus.indexOf("hornReady") != -1)
			{
				// found the horn image, let's sound the horn!
				
				// update timer
				displayTimer("Blowing The Horn...", "Blowing The Horn...", "Blowing The Horn...");
				
				// simulate mouse click on the horn
				var hornElement = document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild;
				fireEvent(hornElement, 'click');
				hornElement = null;
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// double check if the horn was already sounded
				window.setTimeout(function () { afterSoundingHorn() }, 5000);
			}
			else if (headerStatus.indexOf("hornsounding") != -1 || headerStatus.indexOf("hornsounded") != -1)
			{
				// some one just sound the horn...
				
				// update timer
				displayTimer("Synchronizing Data...", "Someone had just sound the horn. Synchronizing data...", "Someone had just sound the horn. Synchronizing data...");
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// load the new data
				window.setTimeout(function () { afterSoundingHorn() }, 5000);
			}
			else if (headerStatus.indexOf("hornwaiting") != -1)
			{
				// the horn is not appearing, let check the time again
				
				// update timer
				displayTimer("Synchronizing Data...", "Hunter horn is not ready yet. Synchronizing data...", "Hunter horn is not ready yet. Synchronizing data...");
				
				// sync the time again, maybe user already click the horn
				retrieveData();
				
				checkJournalDate();
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// loop again
				window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
			}
			else
			{
				// some one steal the horn!
				
				// update timer
				displayTimer("Synchronizing Data...", "Hunter horn is missing. Synchronizing data...", "Hunter horn is missing. Synchronizing data...");
				
				// try to click on the horn
				var hornElement = document.getElementsByClassName('hornbutton')[0].firstChild;
				fireEvent(hornElement, 'click');
				hornElement = null;
				
				// clean up
				headerElement = null;
				headerStatus = null;
				
				// double check if the horn was already sounded
				window.setTimeout(function () { afterSoundingHorn() }, 5000);
			}
		}
		else
		{
			// something wrong, can't even found the header...
			
			// clean up
			headerElement = null;
			
			// reload the page see if thing get fixed
			reloadWithMessage("Fail to find the horn header. Reloading...", false);
		}
		
	}
	else
	{
		// aggressive mode, ignore whatever horn image is there or not, just sound the horn!
		
		// simulate mouse click on the horn
		fireEvent(document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild, 'click');
		
		// double check if the horn was already sounded
		window.setTimeout(function () { afterSoundingHorn() }, 3000);
	}
}

function afterSoundingHorn()
{
	var scriptNode = document.getElementById("scriptNode");
	if (scriptNode)
	{
		// reset the attribute that we use to keep track if user sounded the horn
		scriptNode.setAttribute("soundedHornAtt", "false");
	}		
	scriptNode = null;

	var headerElement = document.getElementById('envHeaderImg');
	if (headerElement)
	{
		// double check if the horn image is still visible after the script already sound it
		var headerStatus = headerElement.getAttribute('class');
		if (headerStatus.indexOf("hornReady") != -1)
		{
			// seen like the horn is not functioning well
			
			// update timer
			displayTimer("Blowing The Horn Again...", "Blowing The Horn Again...", "Blowing The Horn Again...");
			
			// simulate mouse click on the horn again
			var hornElement = document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild;
			fireEvent(hornElement, 'click');
			hornElement = null;
			
			// clean up
			headerElement = null;
			headerStatus = null;
			
			// increase the horn retry counter and check if the script is caugh in loop
			++hornRetry;
			if (hornRetry > hornRetryMax)
			{
				// reload the page see if thing get fixed
				reloadWithMessage("Detected script caught in loop. Reloading...", true);
				
				// reset the horn retry counter
				hornRetry = 0;
			}
			else
			{
				// check again later
				window.setTimeout(function () { afterSoundingHorn() }, 1000);
			}
		}
		else if (headerStatus.indexOf("hornsounding") != -1)
		{
			// the horn is already sound, but the network seen to slow on fetching the data
			
			// update timer
			displayTimer("The horn sounding taken extra longer than normal...", "The horn sounding taken extra longer than normal...", "The horn sounding taken extra longer than normal...");
			
			// clean up
			headerElement = null;
			headerStatus = null;
			
			// increase the horn retry counter and check if the script is caugh in loop
			++hornRetry;
			if (hornRetry > hornRetryMax)
			{
				// reload the page see if thing get fixed
				reloadWithMessage("Detected script caught in loop. Reloading...", true);
				
				// reset the horn retry counter
				hornRetry = 0;
			}
			else
			{
				// check again later
				window.setTimeout(function () { afterSoundingHorn() }, 3000);
			}
		}
		else
		{
			// everything look ok
			
			// update timer
			displayTimer("Horn sounded. Synchronizing Data...", "Horn sounded. Synchronizing data...", "Horn sounded. Synchronizing data...");
			
			// reload data
			retrieveData();
			
			// clean up
			headerElement = null;
			headerStatus = null;
			
			// script continue as normal
			window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
			
			// reset the horn retry counter
			hornRetry = 0;
		}
	}
}

function embedScript()
{
    // create a javascript to detect if user click on the horn manually
    var scriptNode = document.createElement('script');
	scriptNode.setAttribute('id', 'scriptNode');
    scriptNode.setAttribute('type', 'text/javascript');
	scriptNode.setAttribute('soundedHornAtt', 'false');
    scriptNode.innerHTML = '														\
		function soundedHorn()														\
		{																			\
			var scriptNode = document.getElementById("scriptNode");					\
			if (scriptNode)															\
			{																		\
				scriptNode.setAttribute("soundedHornAtt", "true");					\
			}																		\
			scriptNode = null;														\
		}																			\
		';
	// find the head node and insert the script into it
	var headerElement;
	if (fbPlatform || hiFivePlatform || mhPlatform)
	{
		headerElement = document.getElementById('noscript');
	}
	else if (mhMobilePlatform)
	{
		headerElement = document.getElementById('mobileHorn');
	}
	headerElement.parentNode.insertBefore(scriptNode, headerElement);
	scriptNode = null;
	headerElement = null;
	
	// change the function call of horn
	var hornButtonLink = document.getElementsByClassName('mousehuntHud-huntersHorn-container')[0].firstChild;
	var oriStr = hornButtonLink.getAttribute('onclick').toString();
	var index = oriStr.indexOf('return false;');
	var modStr = oriStr.substring(0, index) + 'soundedHorn();' + oriStr.substring(index);
	hornButtonLink.setAttribute('onclick', modStr);
	
	hornButtonLink = null;
	oriStr = null;
	index = null;
	modStr = null;
}

// ################################################################################################
//   Horn Function - End
// ################################################################################################



// ################################################################################################
//   King's Reward Function - Start
// ################################################################################################

function isKingReward()
{
	
}

function kingRewardAction()
{
	// update timer
	displayTimer("King's Reward!", "King's Reward", "King's Reward!");
	displayLocation("-");
		
	// play music if needed
	playKingRewardSound();
		
	// focus on the answer input
	var inputElementList = document.getElementsByClassName('mousehuntPage-puzzle-form-code');
	if (inputElementList)
	{
		inputElementList[0].focus();
		inputElementList = null;
	}
	
	// record last king's reward time
	var nowDate = new Date();
	setStorage("lastKingRewardDate", nowDate.toString());
	nowDate = null;

	if (kingPauseTimeMax <= 0)
	{
		kingPauseTimeMax = 1;
	}
	
	kingPauseTime = kingPauseTimeMax;
	kingRewardCountdownTimer();
}

function playKingRewardSound()
{
	if (isKingWarningSound)
	{
		var browser = browserDetection();
		
		// music data file converted into base 64 string
		var AUDIO_DATA = 'data:audio/mp3;' + 'base64,' +
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AhAwAAABzSxdBjygABZACEDACAAG4RABPgIB25FwmHwdJYRPurL0EQsKnY1pvmjHK4+JvdEa5/6/m3GN///OYY7XfpNB93///9H//////72frEQoCBkgcB0uVSETdDfdydKLcyTo88Udqlr23/aXeyMtV5LNa+YgmrHlbeJjCBIRW9pGuQqNGC7MyIjHed9w8OBpu35OVYux31Ev//////m2XKttYLOmzCje8WQTt4uzqVdogGtN3GJemLTXi4xbEf/+1JkB4/xkBJbBzxgABnAGADgCAAGWKFuB4RpQGge4AAACXGTHNK0Z8STBlJSSGjCxQwD53NpS8LEnDRwu9NratXbxVDE6P//////7pFcuLllllpCANhw2GVDjTEQkK5hgEGesvzqu6hnCAYJDA4DSJ39ShEPEU/mfznQmsYq2Rky5Ii2Y+XlCJOs5v2v0IZRvn6P/////+tp09e+me7KkuVTOs7DdFI+Q6nZ7UUsFhhRtg8CEAQWCwyYtnLg51KD7x9BIQuLNFycH3B5QZY+ZP/7UmQRj/FVAlwBKxAAFuAYAAACAAZYgW4FhGlAXgAgQAAAAKh67FfxZ/9O///////677msE7EpDIo4YgfebDzMuPMQFya5s31UCGBOzt0Pz7nkWX9jStD6cybK2ikhJ4VChQFUCcFxciprGrQCqa3+FFqv+r///////6SKDa1DWIU5rQZCIw1AdoBYQW/4ZQmLk/fb/qI6E8cd0fV89lzFUER8igUSE5Z6BOAA0ABfqFw4pjRel6XQKeejolakXK//////61alq0o5tLJ4q39B//tSZCIA8ZwV26nhEcAZpvfwAAJcRdgHagSIYABlAGAAAAgAbYhBu+YIzy9+iJgIseAmHIYPlmPKqY5e8RLQZFCQLEoOhMoehMkSPFhYFgOqWLtWKM7kO4Lv+tX//////2ItN3IdNJSo2wHBcySHuQg9cVYLKhGFiXdll/rzeWUi+sOleTNdftyIjdKopaTtqVLDMG3BgPAd0XcbRIMNZqyrsZY4LZH//////16/00tLvokrWNdkRQVC2qgVyknReTHnzjOt8yEEYt10V0/PLpT/+1JkLY/xiCRaASEaUBen6BAAAlwFgJ1oBYRJQGcAIAAACXDTRbJqzvnc5VBNSolSzUla3nCCO+tHfd+7V//////99qluxwrJAQuJAlNhY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1ogmx7CzIllWKPbAjwrgmxUHa+MtDcZWVOahXBqUGeDO2IuEhK7aqzOZfwfRDniFHnEevHz+LA9oe+5TO2liv4jHK1y//tSZDGAA+5A1wZp4AANIApAwAgABcxzXh2RgABcgGBDgAAAe+LXxau26NA03Q2K9pM09t71j////ONygR+vnmfTV+3oWJffQd+T1meMC9Qc6rl1HwkmVnO/rmsKad4YcKFHMWPQzoyhjU4YlMvrZaZQ9hS/qqh0s7q//////9/y4vGPe5Z8LjCDCqSZRFdIBRU/7+grwA5ICgGVM4icJ+Ha0WoRaiXWJtQo4NdaKLFcV6lettekqwyNMlyDPMMAu9xZ70p///////u1M3S7kPD/+1JkH4DxmhxYywkaUBdgCBAAAlwGNElUDTDHAFqAIAAAAAD73uArQbabEQsbK0HzUG+CLjTcflpDpxpONMBdJCWidChL7S1gHdzJkrKPKcotRsokqATCFjB0UZYh9NH66///////5yPeoKi6UqLCGGWBwU7RmC4ylPzMQSFACvGmkkDN3CceDkijgSCosiUGbeQAqSCAb0cDDmppBRZoNihioezZcz5JX//////3fQMoGizRd5cWETSAICgQhPeIUCoRrckbbcbAAEcc2NBM0f/7UmQsgPGLE9QDjBnAGYAIAAACXAZMMXG08wA4UABggoAgAI61MxJ2LAjTvdMSiRmQUij0GO9cFO4Faxuc7+eqJf9SpvL/qb///////9rGLXVSsoIVOJiVYu96agBE22m5ZbLbbbbbQAAEenuP4W4mkk8Fwgp4c5uDwu0+ECD2yqGXujFK6irKaa6+bvxYzkXUPOZznGYEeCxaXalW1lqkZldDyX5401yVvtal0robcGRum+/Yt9q2NcoccO5SrVNZw/+0uese58x/dFVwys5j//tSZDoAA+sxWG5jAAYNoBgAwAgAD7DFb7mcABgAADSDAAAA0v/6bm6EbYDfX///////8RHlFXf8RBpA/3/fb////////8AAAFoKeZTeZ3A41GWCQx1EMuQZ4bFHlWLFR1I3BLsOv/KCkaCj1xzF+YrEnjLoI3zc3DVFHI1DvEF4rG5inopyU5Szlelsu9JJN3Gdndb7lYv1LGd/dTeFL9H27jW59ezb/DH+3cKvLneL/rpc/+aH16o4rMgwhBkzGHYwcA02iOUSGIxAF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kKj6/V72eJt5N//gssIm//////+jFjvlQ4NsfrLFyh55zw0c0wqZJeDAkcommbAZubaBrwv03IvWjWHLRi40kUsZ2LpYBy5EiHQ5xMRCjmxCZHlTZhqF97WvfGmKSMdLXVgJP//////z6q/jDikvYB0sa06Pq7CbtZdVSQnJbJrdtsNgAAAAP/7UmQGAAIJHNvuPeAGFyAIUMAAAAfwU3G5h4AQWABhQwAAAAABc2YTDLI8RjI3QhACXnerkcpWZQI5UV0AIwkaHtsLfqcagiOnFzeYt/dkeUxnFv//491t//////+9bv6ImjSgFAGJgEKXLy4xzOMaUrkml22w2GAAAAAAAM4IbTPeUWLI0PV3AaRdbulhoegeE56LAtJ15ni3HqhJrFuY876hgT3dMNI2OIAsBW5X//////2s/oRfNki4MMPC7T5h/lfLKRGtPCrN/cMGcNrm//tSZAWAAesUUQZp4AAUwAgwwAgACJhdQBm3gABTABiLACAAAQ0BM0PTKAWpAAagKAQt766KKAJvg1ZjiHl3TxzKA42xOtbCaTCyskaJ9xKEBKCieoO///////a/DPlAG0PA0ux/vMp1CYieFRhxCb3OiJSNJMzJzN/lICMnMKGwxHDCSLywhDiwAozojpSOAWidA0D3iRLlmW1IF7OBvpr9TwXj9ncIcf5oDBoH29QAEGCAH//////CYSPf1sFhct/2HVI06uHQw3ITA04cqDH/+1JkBgAB6xVQhm3gABfnyCDACAAIHHNCGbeACFsAIQMAIACmINpSp4wMKCSIYEKqDPc3Fe4GGUPm46nE5wgJ4PoT5Vq9nG8rWreLe7++1cAj2fTEX////////////73//7K7KR4sjPo+BQ+EDYXEw8OO6Ui048EApHBRwHBidjWgMFmFBRZdVR7oZMEAkBgYReZbAf4xe1WrIddMhpofDe21j/s81763r///xPh//////00u+qefZYKLJhCUL1J4AM+NITTK0MvjA0aFTLQfOP/7UmQGAAIJFM+GceAAFiAIUMAAAAecV0QZp4AIU4AhAwAAAGHsaJZkEQAECmHQ4CQZdn1AF4DQWLkyzovQbIZova7GCl7EGRSO1TssC21Ll7ImBjyAbCv0f//////101aENcmOW54oAsVb6n4Uao4PM6pA0bAwwIxvgaGmqECgQDHFJgwaXmRBQ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yMGZgHN/BKWTWx4nWNHojAD8JBFACqWJAM4AtCXS57yJEHPdlznWfndHihTzX9f+n/8uip760f//////bz2xMWsi5Ri+VF0cy3oFxY1hiHkE2xpNeDTsXf/+1JkBgACDRxRhm3gABamyADACAAH4FlIGbeAAFIAIMMAIAAoxJtaidaS5ioA8LuvtKYAFQQCg8KGqE0CeAWbS5WpZyoi4tv+dngUVx/KtZ//9Pv96UCX4Pf/////////6FRvT/+V1KgrbO+FgsS6zODYFIhsxyaYBnWl5pgK6a6S+aggCCk7Zp4Xxh8WBQSDK2AHOxDuDSl1hUObUcrcqs/+Iya2bt1azOYKBL96f///////uFG+0WQppRBj9A5bMKiaOIZAE6GvGJtQGe+fmv/7UmQGgAIFHdGGbgAAFyAYMMAIAAgoW0q5t4AAX4AhAwAAAHEL7wbDpbwmAUhrVMrA5wAEy/BPxBAnwFkSRB2J8ghmmK6JRtk+tONYnf6C3zE1Mre6gNf/////+hlakb1T5oJs0VvFlKBrywvwVG3/bAANaUAcqBFSNRALJjKA+ce5Jh51ogUCxrl/FIIlAgBxzITiYObGeyEvZkEPof2//Efv48POmLLvOBJp3uoq//////9o/+5bxqjgshJwUZC27LAdPigrNOPghsAToEMg//tSZASAAdoW0oZtgAASgBhQwAgACLRrRhm3gABRACFDAAAADHjCAtpTxJcAYLehHqLUrJ5gwUEUuZiA2SzYCNssWxEcJAIlnZmevlITo+vpJnCoh/p////////IbXiouip13RyzE9w05puM4ADICAyAIO/QAUCtQbmnAYeCgUYLIv/PgYLS7Zw57yIJgGASIxoW7E0OtRkhZmHP/W1BE02MMW3//fx9ggWAz9D9f//////79FChyrVVxWhKb6NX2LD6PCWAxoMuBFvH4uCl6x3/+1JkBwACIBvRBm3gABMgCFDAAAAIQGtGGbeAAF0AIMMCIACksTdgwEmMMG4YkrDF0Aodg5heAD8Q9FCFP80LGSxDCTG8XLe/1Q5wIj+zCrf//vN4nKjfyxL///////K9FSVlb0pvlWtX1r/IHZKAKITGg4HC55qMu5v48BhcyIKFQAQAtPPBwREE8QaAM+1EXwM0One8KAY6PRSlVP/+1Gzx9e3//9491iIce+kRf//////s/GUpH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j//+rAMJVCqE0Zsbjhpo9VocBgZuLAAgAEBmIv6gnTXS0duWOUJQv4/B5sU5LzwU7klkwwy6VbhDj1eR7wsbzq+/ufAaP/T////////////5zn///yAAjyN///7BxcPKq835EF4xb8e//tSZASAAc0X0gZp4AIXYAhAwAgACGhpe7j2ABhRoR9DACAAyMDRYcXLLiTlFaQ3U13ISRS3lVOErXQ+W/vSWI5DC4SKmlLODya61eFTOdYmu3get//////6ndlkLLH64fPirUGYuz3qZoMpbMktl2223//4AAAAAANkX4Ss+1BHYDHG1EksShGFtL1bIkLR/C5bUKzEtoaAZrresRrJUWdjr1tUN/fLtAp/PQT/R3/////////9fl///NMGAv//1mQwFTExwOuOm3BTY+RQ14P/+1JkBoACEhnRhmngABNACBDACAAIZFFGGbeACFwan4MCIAAzQoAgAU4LeIeQURAQcDUHgKLvqOUmwjRNX8QcCSUJlr6Kh10hbfCiPXGO8kx/S+90kaa5mn///////1z/+UWoE2AT8MP7hOBDL0k0EkNPPQCCC5CZmCgY8CAwBDBECF9GqAkDZ4LBaSFPgC2GofB64fCZotILSOSr29Hqpc3i3HeFxySoYDAr/9/+oT/8y////////0f/9d6G//+pQUS/8k9aM/QzDyw0U3JAYP/7UmQFAAHuFFIGbeAAEkAGMcAIAIisaUYZt4AAVQBggwAgANCQMjlyQUKrcCAFjT+F6kmFJKaSuOC9JueBe2B+QhgQ80Fwr8YurIUOAwQoYrEwsFQqW6gAQP///////T/9IgCIHBD/7pA0dPBBsayfgwMOWEQUrmBiaWpYAwACsuni6hf9GZuMphRdxwBqS/I94ONaPpDS4q6Te1tmZYzKrX1YETPfZxi8WwlZnH1/d//////ben+s4bC4dOlws36qOaD9NqpMsWOK1AAI/BUW//tSZAYAAggX0gZp4AAWwAhAwAgAB/BXSBmngAhcAGEDACAAdgZGBgQFFpGq/TrLgp7KUKDvpRCzEHTJ0Jp+XA4VEdbm4Z8RhbYkdnjRZ75+o1WAYJBXW2r//////68VK9q0iQchUxifQt/anlgEUN+TKKhr24QUPkrFjwCPA0UYkOutQNaaKatCoGLyODgjpmEmMl4sEvMpOq5DmG80NgevobZJHiTx5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/8+6hO8ugRosQXEiZV7knOif4CEir9nQ5BUIecAZY3F2GAYslyCAAACqkaYsl01uInC5nWXNjgEGVbJdQrSmQsvyqu8eUbqROpX0GKfoCcFQC76v//////q/ocgUV6CbjFJd3X8ujHCU5zpZgCMPimCxNEctgWyCAj/+1JkCYACDxZSBmngABQAGFDACAAJOHNGGbeAAFiAYUMAAAACMpypgMEZY5RbFfpxtRSFxJ6Li4Ierz9UD1UH6dMfV7tbze3jC9BCQOBwqGhL0f//////V2US1LKG2xxZiw2/1dEcZAJgEDNgbDCRo4VIBQWGA4CDEbFKDDhtAUwS8SACsyfSepfCcGmwCvCZIQtsCQLe1ramQ5kZ90qr2+VDq4hR9++9ZzTUGrjujK//////9dvbIYBxUmdLACdpodzqn9IyMcTMCFOI2MeIO//7UmQFAAHnFtKGaeACF2AYQMAAAAeUVUoZp4AIVYBhAwAgALIBzIMDoUI4BwNBlOaC3HUKcZIpIYfjpVn2bp0v1A4HkdCkcawe8p2qPuzDCfPhH72Qi///////X36CTChFapZbT6RVVvUURlCKzGHTDjTgIgU6OvMNOQDg7FU2A4WXyeFU7J012ts5d1KmmJofkBXIW4q9NIWq42Xsesfb9kpFrCKveXm6C///////9ytijUXHLS6IbYLn+fS7iWoxyExo82QIWxnLrGrLIRtV//tSZAgAAesaUoZp4AIb54gQwAgACEBnSBmngAhYAGEDACAAVVZgYkMwFMORroUisVhppo8XMlcaV4o7ItGOL2Ernk8CmqRKK6ta4p9ePt74v////////////TVDf/PRiUMoEKEgn9LinAAMBYyTMypc2gk6JM6uY2JZWpBOCRYGKAoFJGhtcSgbVcyYw6zcQwYja6MhiUBcFWpGJtZcvMx2BVxtRcva1v9+OfH6br//////7+2kFe2onc4VrDSwB1iYprqqMovMqNM4jOiZN7P/+1JkBYAB3RVShmmAAhbgCFDAAAAIgGlGGaeAAFKAYUMAIAAM2CcJAeYEKhCp28TRFcIzrPadERKCgIQbnR82Ph2GaIdzlqNXD9D9lf7Jwsxwft+P///////4E2wnQIyiSigcCVHKCxftPKNFHNKTM5pPynOLmElyAgeJo3gkSABcpLuN4vdLRhrERcESE2RhOoSWNctJN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96f///////2UPem80ldAAIt+z6VOQ0wVHIDWCZmpVOXrNLcsTVul0TZI5GLBAIRVN6t8Gx0Vk9oTRr9K3JBiXVZYQuWqXxGNn2EnEpgMBawuHwzcKtW1d0QVf//////72YpQ4IPT3qW0F0WZ63ylTZbbZJf/AF3K0birQn/+1JkBoDx4ingZzxgDBiACBDgAAAHGGlWDSTHCFsAIAAQCXBISK19DfNzVHY3jDNYKBnkMwJ2uR9wTkupKGZjbLLYUbHn/5cv7akcoo1sAwUGen///////xV40wKMDxFlyAubvSHXTLmIGmzhADmLQxi5aupa/sYZDhkROKqIA1ZZJdnEhRE+8VdSXBQBsUXjJLNovxScwwxsbtbi7cuUzs9f/7////////wXQcDrGHyF4dFh6BixzJZqlQIHge/eYY6kw9rN3AlsTmJOSCFEFP/7UmQKifGrHVWrSRpQGAAIEAAAAAYIVVANpMcAZgBgAAAIADrZByRt8Ud5Nu6hYQE7BCB55314Y+UQ4Obix6q7obfy3//////+l6SLmovUhoangsOJGSSCrmPih2HeJVxhwMkkqN3nKeoKAyhFiEUlyuICYmgUKte6Dl5is2a91+okOJG1oDg+qlXTX//////9fypW0i94bEoxiSrQeCpEwOoYIwmqMb1CsGIlAeEUAiFUvbZorBpbHHZdWNT0SkYJIlmwRY6QqWlUk0OYkz1A//tSZBUAAY4TU4VtIAAUwBgQoAgADBR7c7mcABAsACHDACAAVYBcAtW19S///////+1jqzSTFtBJ4pS1DljjsUAWj2u12u2222222AAAaTel9OLjVE0pChuyRlz7TNZpquy9UxRZm4CrGswBjLJbD7gNcXVKp69Sdwk0cilJUdmMRqmpr3OXKT6mFzVu9fyJGR5siksdEEosksVQFim3v/V//////9X/XXXStdUy0JIwUB04uJEiHYZIYDBUuJHdmDogUDUOdPFYlou3A9KsGhT/+1JkEgAC2ChPhnXgABQgGFDAAAAHpE1GGceAAE+AIQMAIACy+Uc9P8RSsJw4ZbXe54rjZTvN+FLFez43W8JjgU9JfWmdQtf4rfd8avH0AwueEy3sIomi1n0I//////+razXUxCmDEOpg3q7THVUcNTYECppc7FuTghMHigYaFStLgR6ozpbAcD3WeGnyBjFyYcw5x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sY5bkQAQngJZmxgzi70cmW/WT3KvqdEb8Q3o0GYVOez91aitF5ftaB9DrW3Tv//l//v///////+c9PrGkyXNFiI9d7TADFHVPrVfFUPNjIYONMPFYqgc4PLY7ErHEnAuDCxC4aKhUiEGi4P3mECU4dLC7jSVaBlf5Gyn//////p+vQrulmVmrq6KVWvIf/7UmQhgPGEA1sB6RgAGagoAAACXAX8DYmEmGAwYAAgABAJcJVMz4uzY0fJJJJJO5VAPg2AjwSOUlwkQsJEmHhqEI1tYGFDQME4QpVhHqY547AbioCf+vM9/Yj//////+42pgYoUiHECEuKFnQvFDes9UoUAa7yP4+szZobR/W3q65L9yekzorER1jLQQQMPgZL7VvNSCyORYd3o73RlSP///////LiqjN49U+JROITVKhZdM+dQRAgMi+QNSJti3KbMR9UnFyZ8RCY8scQJkzQ//tSZC8P8WYhWgEBElAW4AgAAAJcBZwPZgSwQABkHeAAAAlwKiNx8OtBVsKRMlGpCNGbTDj+r//////2996s+5a8q1uiMYGWYAzEEELvPrUgwLPzI7xNFZW5Pj9fpsqVRkZtCtOtzsemyM6iaig0WFywIuAp848JqCZKPutlCf1tT/////++fbn+9HBFhRovXS+kiWepyRev/+KDoFhxtOuJwqbfW/zPP2GsGvDM87UO8m2aHJ58K7ZH8GMhQomtK7xvJv1BofxydqSv//////7/+1JkQIDxjSRZAWESUBcmaAAAAlwGXK1kpYRpgGAAYAAACADt9VYN0uBxigKIcVQ8IEwzcBi6B5QbIptV0qkZTEv3y09OvOdVZ2urMjxJlzA+VSLCMDBwmIQCHDSfays5d1Y1Q7////////Km1HqjkMq3emzrRVfQP52NJzv/uAeBNChF9NKdXc6DaI3/fmVVg66pc4x0AjAZUhyQKutheIo+Ta7ra5F4epbWv/////7f/3RHIqE+xXiNFYqIpJUGFKC8GiO3bbbbWyttgGAWFf/7UmRNAPFyH1iBARJQGAg4EAACXEXodWSjhElAZZ+gAAAJcOEZB0zczkSWi7NsrJTLndm094M+4WPAwB5wIXcKdYtn00ZTdNvvWla////////qWWhGbPAyEyg5ABDxCEEG7LRgZC0ckN8OO85FLDO1ZiJV1Qgkt8FQvLN77Z19MyiRb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gDSojcg2LUmkbaXV1rAIBQcGJcplqXEkbJFev//////+5hwoiVjqhQtKVmC4dvJzKFhzS3TVyWRgAHyqDReqBDEVXuYOVI1MKCCDU7i2TTTpuiRJke1YfZ5Mv4ahu/SGhERmXlh6S1zblNpf0f//////st0E0iVz4oxzQks2sedQAGr1QE1VJ8ADQZhYHIUDlLoPuuU5T+09G/Lky3lV/T/+1JkDgABsBDVTWkgAhnACACgCAALTJlEGceAAE6AYUMAIAA0ikWFRr0RErPirF2TwYaKJ5a/1tVO/h5L6v//////7eyfTF0vBhAcACxQUGKFTQ9Quwwsx6WBYfHO1SPCk3qvDCICXev8x2AyEQAYFQ2/FsCAcLAJQJB5VsACIHFRXNDqKLCX0hBpZx2ylp0KZWBua3us5i+ssLz1lvaefP3r4/+P86l4bbF1WrPua//1f/////+V9+szMIYxTRKwomNN26U/hEHlk3iTHhEyMP/7UmQFgAHiHFIGbWAAGAAIQMAIAAhQX0QZx4AAXABhAwAgAPMjC1/w66kvBwWNBELtT3oB2n7jjx0g7Um1122VpOk5TKnNDzDnVb2fWeISPobss+N//////+rt1kyxYuGRc8dFG2YoZ9d+5IYO8mgwCDzLhKMBAM5IcygdGIA3EmXLwYJijaYAAs5STO8khgzQ4oR2dh+YtvQ5YcV7F/+qbzPxZZ1SAgOKOW4mLf+n///////s4rFBo0mpZZKT5poRC3H0eBkT//8AAxIuSOOn//tSZAUAAfgVUy5t4AAVYAhQwAAABmQzcbzBgDBonSBDgCAARxotNBGFSxEHAhb0wANgiu2FzxoAa1S6ZUPCGkwiZnfxzygr3+tXn25+SPQ8laQo9QWt9JH//////6v1bGOGOSpIpIVnfQp+gXGgyxSWSS60AAOdF52BM+LAsuICxwsVMzM/fcWwQACEJwQmyEQBhNqAgucGagihSTra576v////////////eyypd0/NdhIwDJmmsakA21KaAAMOlCarGpcu03OWTrThNkSoEUL/+1JkConxiBNSE28xyhigCAAAAlwGNEVEtaYAKFoAYEKAIADkSo4lFFbY/e15xIKJZ6qtakjZVChqkzDVv3Fy//////+xV4CyQowNvehjg7YdCRsWcxL8sUB4QR6kR10xjD6CBAm+riqrL4TzStRCW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gYvyCgEBQAqNgJIZSlNGJE6dIamHD5xr9xawsGCnfiZ83//////sLbvL0mztTTj4+96+g6LcmFFOLNYzADz6mFFgv/7UmQFAAHSHk2GcmAAF8AYQMAAAAhZMV4ZhQAISYAhQwAAACbKAhm0Mv01XsEgIHmPBhT9bfzEwmMPAQwc3cDmUPf75FBlxZf+VyoXzf/ypTNFej//////1HP1YwNNoDZ5oYApRNLdDuoRlR96Qym0yVyceHn9qfP9yx/95m9Tzf0M/48FQaf+SEZONyT/88GgkYeG//5OAwNCcGg0n///JCAkcxjCMn///9zydp///////+/ojmce9BfWdT9/OAiqO9HrJ5AonGfc9o99vN6g//tSZAeAAgAqXIY8wAAUoAhAwAAABgQZbBzxgAheACBDgAAAQ0bZme/e+oNKwskj4nMRa0yBQEJN9bj93+Pj0NjI97/n/vCOFqd2pfFTywFaop8Cj///////r/6Dog1itzTbg+tOopdtQ2kGEJRqtj0kxuk767BY+JEKzgXrOF7y+z0KRLz3x28DJfXqEDH7+/5v/3f93//vY///////6KjtLFEw+2AllljjREICAxVkqngs7LX61aJr1nAxveNn5yMrdatIZuVyVpUNcwJAcDr/+1JkD4/xkB7bgeMSUBcgCBAAAlwGdGluB4RHAF8AIEAAAAAuCigEgvJtCJXFGPF9RZi7xvor///////2LTx17ygwyhhUeCh8tHsdUkk/JiqoNK/ATAymQwBJlu2rKjMz6H39lQKjhwHJx+GT4bhw8EAKHQk9olmb1TT1vyiK+vSj///////LUNQytzSosWuPn1qSs6KixhaKtttttsbSRQCUJC3QVeYlxgyjDtCgbFg9JAZYb4w60Dq++5Fb2BIXYSttr8W+9LCya4/////////7UmQbgPGQCOTpghCsGQAIAAAiXAZocZOlhElwZaBgAAAJcaJRtKbjZgJyCBjRSVFAfRAZlkDJltottkkaSQCgpDk3LWM48KHFThoVT7/c2OW63YhVMPP2Dij3mVM0li1i+hd6R6rqe1H6P/////6+v/no89N10oQ6OCVTOR0hEG3DdTUmmAicY2axDUyNTCzlcj9lT7yfmZfGdWhlg4R6WbF22daKvBS3WFieDRX//6+9v37ra59X///////laLkHzhUE0vcJxCXGsYWJDhyR//tSZCYP8Z0e2gDBGlIX4AgAAAJcBaSjaAUEaUBogCAAAAAAiE0+x6+uboY//L8kMrtDvrkXNjWiemss2fXUzxB0LgrU0gh63rGVuLflettX//////+k+l5gSuADIsKsFSpBE2EoQlFuJDUPAoMy+CTh+WLBKeeYcnY8C0AVsebYLmFFRwVDaCoSHCkqfLHXP2vfv3GUPup3a////////qGsApwpa46aArkh4i4LpPEVwo0i1rHVE73F4/X6LRHq90T3W5kZBCXmUEg8H0hRYoX/+1BkMw/xeAJZgSwYABaACBAAAAAF9IlkBYRJQGgAIAAACXBHPGHD7gosKMjL5BFGvTV///////XepjBcXIqPg1AIAehygRaea4HliqoQiIgdcqq4mgf/+jHuXLmn5K50q7Qc9HOstUp+0wqyETig2E2usdQRPLQRMI0kj3TWr//////72ZytSxwuBVCLRIhIqJC4wUcB0UKBwYHyWatfPm5tff6eiylvndTK62c6wbpYc3S2ocTEXJGaFu1//9r/y/rdfrv8upr/////9rfq//tSZEEP8Ywp2IEhGmAZwAgAAAJcBfh9YgQESUhhoqAAAAlw+nWhd3/r5nKzMqqROWrDQnI1LhaspubV15rFc9Wqf/+/D8mjepU+8OlmqdzaaE1BBQQCRESvGSDH9TDdDmd9X//////96XU1Bo6MaIzgNk1qidQobJMI1oHpEgZqSxnn8Tzc+0tVKY+w/mR5HJAhwyapHvE16ZEZHB6cDpgxBcUxYKvuQ1KGiP0OsnU///////+KLgkF3sWUe9IxUmYYXJonZ8AKEAyPn93G2KX/+1JkTY/xaydYAWEaUBoAGAAAIgAGYJVeB4RpQGAAIEAAAAAdJkraIaUSCzCohbFFEbjAuXA58QEaiZxDecOKDSGtIneQ3MR9P///////SH3MFF7CosLPULJOyT1ZdCUCZCfPZJ8tqrhW1uTmFIEsMFIBFijrsZrsRZqe1Q58IrESH6KxGT3+qex+Kj0sKSDep64r//////+jO7bQnWydlCzGOQSBOFw5ElUFUw63B0sGESaOptX//2WdyMYW7CBSIhGgGDAsA1qFzwjbSAXsx//7UmRaj/FrBVeBKRAQFwAIEAACXAZwy1oEhGuAWQBgQACIAMoFBoohYNXY/VFv/////0/+0yV2MrWc15KsSbU1sqxKhPlRxAFA4KkbEd/+qDDPWZyzXmx/1jsyJyVCO/J2e44GGCpsBCMBChSEc6waq1SxMF3I1jF2cr//////1RKYmQaBoUBrdzu2sNQ6149jIlU3ioiRGWLXW8hNb6v6GSQVn37Z7XSZ36enbncl9Uv8tBEXCguOSsudcaQ1i8ow0kM/1////////9XpRTuS//tSZGmP8YQX1oEhEcAZyDgAAAJcBmSBWAYEaUBggF6AAIgAejaEodCEakILAZfdrEcgMmlXxmoRUXdj/Tt95d6Nq0VCohsWEAoYImTKloSdeAHvDJQtjPahLkWRlIpLf//////pT0rSJ2AupYyPYVeHzTSyii0CA+KkSSSUITbbbeilskTZkXX0ds0l9N4zIFllQy1I02osECR1QeGJRTUWeneflVaqV///////trpXVbp6OQrKgMo5r8nJFvOQA/BpIiYGNNaLbOMDA4pVMIX/+1JkdQ/xjylWAeEaYBfn9+AAAlwF7GNWBIhHAFqAYEAACAB5PmtZ9l7MVmsbsSxaCj3IoeBnFTh8oOB0HkKZi6X8b9+v//////+ToeZO8oG0nkEir1CqrxhKHygsIGMhEwFHh/S92F3Z2vSmt08vL+Up9bjHmk4qpdc6VKEqQs6UKUFoNqNiiCOp60vjbrV0KR//////+99VvN7FkYpCYIzHlkTVYsJRembXbbbW2NpgID2WFnn2DCAiK22wi+9iM+rsVbzJMrDyAGSPopf36P/7UmSDj/GPHlUBIRJQGcdIAAACXEYEhVIHhElAYIBgAAAIAMmjqr/r3tRc1Rn//////+ne5Irh9yxcbLsaGyh0DyJpYOB+AKaTdBIABMAPpOBKoBKn7Um0a9T0csGphaZZJpkmRKCpFWe8fJ8Lu6fdqezMRyw6YkdxSVTCCjQiTh0pk8EJxUPX4P8IuoZG/JAS6p2n+fH/AgSusd/pf///////rRxaaMlKVtFRR6ZG4iAW47I+RWAH2SQS5+mMpSgggMMQqFonMrDcdRcVIWDs//tSZJAA8aMr1AHiGmAX5xgAAAJcBhhjfaMMRzBjACBAAAAAiDOZZ7pTMqVs+mLJReIfMgHc7KUXCPZZE3fTZ4nCVzuREdmteVvx3ParFy+T3r///////S2tjJBi45cZYLPHJJmrFroAZmiSAAKCJpTMM2hLXPXeRrixJXGXEA4YNRk8fziyt8t45WYXTw+zKz8W2n0sULgAKDAQeBhSC1johQbWRhYsHRQhKQI4Dg9jkrNd2K8bpKSLo8hj7F1TA4SyZJrGPoxPc5X/////////+1Jkm4DyujfR6eka4hMgCCAAAAAJvFNJh7DHCFUAIEAAAAD+cpY3rtUZpAEAIAAIEMjQAFMXtV6+KA2Gom4bLayUwD6i4/PsTL1N4XF2JaxzkeU+X3Z2bLrI2WYSNpttzMQNL0solFHKvuSuRuaccfN2XFLhn+d9zlJ6/ftFM8W0TvWUnper6t103Jdf//////9PV9sXTdWmACQAADQZdZrMhIwXJTERuRpXItdkTivwEYOmSCUCAhLlJwvZe9YlefigtbMvuwZTdfFPDoNnVv/7UmSLAPMXRU7TDBrgDeAIMAAAAAw07zcssMuIMYBhAAAAAFaI2ZA1AWwheaAg5xUFG9KBaPGrbLVQuqpZdyMiznNIwsYN4tOJ5bv8///////kNEyoo4MkA6aaZdMnFWCBU+vADbHT2qzhmW0CGAGSLgBRMiNsBDrB/i5CSEQX0u5xp0v6rXlI8b2PMd/4ARw6k7IJXZlqqTMx1gJmZgJv2qwCFXIMBCm1ARuLGLIL/Tfi+FRvm6b8VCK+/xTZt///////rtou0JxUH0LpnxxR//tSZHII8wA+zTssGuIXABgAAAIAC3yjKi08aUhWACBAAAgAqlEJYZUwD1Y28KM1dE4ywRs2EDsz9JwSOMxaF4xjBkw/Jw8sU6TM0B4clmKEG1uGHVmYIig8xJJVM0x0KgAMSShUkIwI0WTRKAD5osgBYhdTwN1qgq00pzpjR3b147libh4rJ2wvf//////+usoqVQXEoxyg2GT4LtPD4VEpIi8CDDU9UzSibTS8hjSkVDP4NzNQpDHkUDCsuzAoOTGYbwuA5j+ABYCcxUBYqiT/+1JkVA/zCxxDg7p6UhugCAAAAlwMfG8SFdwACGgAX8KAIAAYCguYCByYKgQdjh/jyMIqYJIZCiWNhApWUCdNXi+IbaLPO1CoVOwJKo3HZianq07ev27NTVxLlrf///////ODXOWUY8sEzBkRCe6ZU1pYBsGKIAYDMRBWAgjOjjTZjya2l2pI1MXM5OuenwxMwI3MWKlwyOLKA6BA944coF9BawQbCQwRd8WMQeMoeAUcBhUF8w2D5IEXuwN1RTBO4socn9NNSBoshiBPEyYlX//7UmQtAANFMEyGbmAAOEl34MCUAEdcb1a5hIAAa4AgwwAgAOmmpuTRkfRJf8sLAL//Wp9DNiM6n0b/X////66/V0+tzdK3OlZGrEmECIRDDRGokZyqomJKKEHMxAgIjosX6AOw0VP9xQgPP//0AADwOKBphxVAF0OO/6W1iBKlqkXc8cYnFGA0ApPs4zFAVOQJ2/sMNkSMl819Yns+ITxMs84Udlf/////+1GqrY5BBwoaImAxFjE0YCp/jxKzIU0InLVH8w8FAhcx4kv63Kkb//tSZAgAAesd04ZpgAAeJ6gwwAgABxhjTBmmAABogGDDACAAKyhCN1oNqZK2M0HIRoYAQEk+sdTOBWYjuZM1a3ZlYblQ8ZWuzMzMykiXxA79P//////////6ffpVHWdCtVj6ToaswtlllOPdY5/BA3RhgBokikjxYygUJBS/7Z4fZJDjM2nS+JQfwCAoWlmzqk/OxxOjKZlll1cSkpiezMysQsfB4916f/////+tr91ynQoQPsIBI6+edEwqxuEbdIIKFVxKCOGAIhpvzT/rcYb/+1JkBwABzxrThmmAAhmACDDAiAAHsHNCGbgACHkeoMMAIAABjK3losyZRDjbsBYc1qxIAcG5VWnh/g9jQSqMrXD/59MdPHLS6z/z8xvR0f/////+7q5JgAERsuOSACDIyOJwcy4o7vHH5KgcGGdHQkEGiUJAjLdXU15oACIQUutW67tgeIwcCHCsbuGFAPXqTK7ByAaqEr9N1uOcJ+Hkt6/fJIqNK//////////2/833TMqyuhHsl0My4bWFnP1n2n8stVU70cM2NzoFwmTTgP/7UmQFgAHLGNCGbWAAHWAIMMCIAAbQU0gZt4AIX4BgwwAgANkeADDAgCA7fppqFzwOARUEkVSNZgQigmdhYAIwAS+fonkodRF+e+slHzVx0r0f/////+sC5vhoShgIEDBgPvOuM3hw4GXcgf586FTABBMI/MJMFMjITJI1kkXGkJN+LSaMTgQIpK/QlzLeEevrBxoYhg3mJfz+4KOPt5q7L/o0ggK//////6GdvH4xTG2HCxMHQ7FPSsNaBciqOfAkOF5lQ1CQfNauMRBFONeS//tSZAkAAfkd0IZxoAAeh+gwwAgABxxJOhnGAABwgGDDACAAKacYKMxjMFU9pyK6W5hIETckyEG6AZuSg8DEFGJSJb5ubqYYIpFIs+19E0N1f/////////6/zaa+lqERHmrREdOqIQE4CC3QV6Ug+dVZRh0AncnEROUyRFzMABMNCcuaUAthI8BWkhAVUWW5Ov78JleJDNASTH0z0/JV11jzBX3SPuRUn//////7bEsuOyghESyASMpLMA5Aoea3bdqDgM0xAvMpFT/YgWVjTiD/+1JkBgAByhTRBm3gAB3oGDDACAAHYFlEGceAAGoAYMMAIAAuCmuAREwwjBoA70VMPAYUgdHYP6APxjokhOOwOSGISwq3/qiNE72z59gMPQV//////////1v9Eb5/VEZ5VXacxiJufkGK3qWvUcSbyOZQQjKBsEIMOLnUysAVu7iJgwBBYIkgJl3uiwcw4AUMoV3BPpkTX/qt/HIEyz//7zfbYwyHsufWC3//////kxXafzuME5cVNnwMgONDglk3aWFvSiBJJJJJJJJJJAAAAP/7UmQGAAHhENXuZSAEHGAIMMAIAAdoX0AZx4AAZoBgwwAgAAADvGZaehzQA4VqCPCyFMaIvUiktyIxXBsz9jbRCgJ2fL54YYmIpmx10he0v21tCf//////1KoSlijYwqKhYqfisOBgwfNmethbmjyDKsNNHgU5Grgw3GmioHD0FCQxICl8InLPfUAiEWD4YAkybHRnmJSBvIh5OUHLCv/5orPAi4zX/+fJeGv//////rvKZa8GRkNtAMqLKMuHsuxE3oYDlTZS7aEZQKRg4WHW//tSZAWAAesWUIZx4AAY4AhAwAgAB1RZNhnWgABcAGEDACAAyoYKBqzn/FhIYPBJADAAB7/DBYHDgGxQEgSmxMDQLaxf9CC5s7GnlF//t48pHhWbn31///////UctT7w+0swVQeY8k1LGdcLcULEzCkcDCIIzsYaAMHZmwVgKCsaApRYIApWwKgCrct+xWzclNc4Uh3phvjkRa9ZuOc5/mhonRc6lp3Um5H//////uFv6IgKucgVapASU1ivYnQZLjbeFzB8bDaM0CUJTXQ6Acf/+1JkCAACLBjOBnYAABcgGEDACAAHfL9gGYUAAFMAJ4MCIABpgiAZiuFAGBkvqhtaMXADDhnQcXPCdABwXzJkZksGgGArQaZQMjbkePsgBfMUWV6jpxT+7q//////9arv0rsWHQ0y0GUj3MOdj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8dLE1jJIqWwo9RVQCLV/gAWsoVgVcv2RtUUfiGFE8z835I3N/LZKBQpmUJ2JkRErrA8eXKLzpD/+1JkOQHxfw1VUwkZPBaAB2AAAAAGJFFTNYSAOAAANIKAAASiRiWKvVVEXTWV27a7bAYAAAAAAyISEgkioGsgQFMOBAMNTZlISYoDHAt5g51OXkOIKGw7ZASUibixlwDL3gMsT2ELht46gM80AyQoAEMbrUgRAiCbgNDQs6GABcZ52efPOnEbDkj4KxL//mqKdB1IAAAAfEqKaNHuaClgYLBCcmCsYCAaZiD+YJBmXuh5IBoJh0GZhgF87ap5YH6gAaDkQPgdiziLrRoHkxCo5f/7UmRTgANDJVPuboAGAAANIMAAAApcgyhZ2AAIUR6gAwAgABEii67WuOULKKxNE87ra6S82zi1P////////////2t//+TUW4Cf/NFFIDaklkttttooAAAAAAOgkzRwUOGNGmFGz3RA4h1FECzsR4Cqm6KJTh2Slyhp8FDIYksOAOjJgceNELnBwauUfn+yqtPir/07Zocd+cmq3cae3/flVXtpy/elH///////92eT2u77PtfvqAOqrmTt222+GAAAAAACAkJDpjFBQMCvKqls//tSZEIAAtMbVO5nIAQPYAhwwAgAC+h5T7msgBA6gCHDAAAA5LEOyGeOCA3jkWfV+FhhrzVbJdc8iMJBc56lisboHXKFNhkS9nhkvR9HIhACFRKVOtH9479xIc1FOQYsVesEv69/gEwU////////yq0cd27/u+pKBSRSTkl1AAAMhDjvT6sOBOn+wptmbm5ycnzVYYSDpDK5u+gkG5DA0RAwogFQ0AWv0eFK///////+p72ha2fNmRdl8CmhYpNPSBjBUbkt22wBlqwhJfh5xi3/+1JkLIHxmhJW7zxgDBdgCADgAAAGJFdrtPSAOFaAIEKAAACrz5lLc/hnSxMzSaKqYlFSxsDMlCVFTwz4EytNIfiK8TcvY///////pc+yBBefve1UWGlJUYcTbVUA4OpWSy67bC0AAAAAABOISGgDDBAvgJQhtybP0kEfziQzinq1sMByMyooxYSm6c0mMJmqYI651CsDIUEQ4gKBZDOtWlKViC6x3nK2A7aZ7Br9rfMUiF0RRx4bcFu7puJScCcAI///////+pCBTsh85QZOhv/7UGQ6AAMmH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2vghMRiLOf8UsI2T4uX4c4Nw0CdUYqU6w7gRE9BZXv/7+Pdywl6P//////6tG5DKj1Kmatb9LQz3qo4ofQGGN4Rl5Ubbumo//tSZAaAAggWzoZt4AAU4AhQwAAACExzMhnJAAhZgGEDACAADDeOsZeRCIDMlBQENJCL0MGAwQAgYBTSEPFzLEhwwjLOMyIkKj48ENbtYpR9qvh7i2P16f//////o/1DgsufGjHuyIbT67NClmZSwMgE5gOAYFzZrbEq7DLITC4BAQzMxiQxmSoElaPD2GCwuChgqLYOeB1YWqUlUbFwMtiCw6W9k5BCKnD/32l5aH//////0f9MvLiqRecQ8eYAzcKCUM9NJMkccb1G222AAAD/+1JkBYACAxdW7mHgBBOACFDACAAH5Fc6GbeAAFMAYUMAAAAAAADCqbnEylyOE6eTngAOM3ag3B0jRWTG34ag4O+31SIYPweqsL/xE4yaObwn2afTw5S+rV//////9HV0WFKhrEip//ixviAaZtGmxoplmQt85OdNwEwcZmChogIy7Zho0g0JCapGUoDQgOQmgNZdECZK7HCWBiVD6HZMPWK81923iseEHtGS///////1biNdweQ9aVak3t5pPDplG37YAAMHIC+J5BEZsQHOl//7UmQIAAIoF04ubgAAFqAIUMAIAAeoX2O49gAYWoAhQwAAABnSm4EqIgkywaM6FQYE2+CQRD5hgeNArQCwWwLJQbYpXL4nQqCfRyRzfk4aIE7RLvBByh4d///////7typB5kLBlpMLKaitHtU/RKgGSORyW3///gAAAAAAEpQshTkOjQP8OMC7elEe8Tp0+5bYZPX5ChceQbl5k7Dw7PxKaeZ6k0b8S43yLt/R///////sV3QAPOJW0zQhCkBB+gq9mYUyXFM7NDgp4mVTrT01//tSZAaAAggVzoZt4AAUABhQwAAAB0RVNhm3gABtgCDDACAAgzM2AAg0R2LUAIUMEETCQlIxTdpY8AoCgMQ/TnVZyoovaXVDGr9nVCVz+Wmff+ex465OHf//////jdG+cpXzeXBU4g3+vUKJMKJAcQndCJkBMcvrGomj/dMUADJxMy0cIAPuACB0czBgMtDjgFBkGELl/1Qq8EKbVD//q7+6tER7DH//////UtLaSfZgy4HojYF4Eg6NHj+xZ/Kg6PUEpxJpyy3bbYAAAAAAAYH/+1JkB4ACHxjW7mHgBBboB4DACABH1Fc8GbeAAF4mn0MAIAC34CE84kyZUEZMtWIjQ3PaZK8Kail6yzwtmW1F8JshD2ulQqIavZXbx9bPn3q76LHzI0uRHf//////////KX//UqBSlUKA///oBByU2mBNEFjmFwyAQOhGDDA8DLZioUUACOBigunMAAVF5FB5HfR5MIr4zAT5CjxQ2AyM87exPo77NPe+43LAJvJf////////////sr///kU7Tq5////WsIoyQMgMNTNTHNFnc//7UmQFgAH0FU0GceAAFmAYQMAIAAgYV2u5p4AQXgAhAwAgAB7EDJIaY9GDK4dBQxCwZC4Ct8MNhsHB9CIQAHXEdATzKZ/+eZprY+cvf/3jnAiMoKswYo//////7elTKqpB8i5wh1kBV5/tDXpS5ZbHbfd//xwAAAAAAAVDbOjDhHbOUODhCkG0bBEofTUcuUdxgOBzqVOcErFzc54kudI8ubOr4Mld/WNs58Nu4P//////+u310UmkXLUxbJsALXly87i5lNUPNzRkk7YeMKFD//tSZAUAAeAVToZtgAIX5qfgwIgACBRpNBnHgAhLgGEDACAArWQxsCARoYQMgoUMPA031Mg4REIEXbZuqZE4AUTgaHgSgdA9h1F0g1aXPWtafmV0U2X+/X//////////9nUN//ysxB0DN/5oWDxnAcAYQmL5GaDCxmJvGHAu5TrmZBgVRAAAEhIilswEDQcK0clo12AnhJCwqHVOhJSnGkmyP/+rG6DPrG8//+ehf///////n9XyqeXFwJ+BFmNSg6pFtxOsWj7f/8AAAAAAAKz/+1JkB4ACHhhX7mXgBBbAGEDACAAH+Fc2GbeAAFsAYQMAIADo8OVdE0DAATLUxjnQhwzxZJQ80ZoqI6davwwC4G+pWD/joY1Gh8d1H+cfdonZnuJmsH7lp///////78VMG59zThgNwgojUzmbMsBTzaAz8GPuRSsRPXsDXzYvuDQCy2IyMiLmlpjAQRAIrABgEuSI6GCDfFzTzkJqplEcaETVkfK6r2vpSj7LhFL6P/////+j/MOWko6ocIbSgAgj73MyrhQ1wUAEETa8tM4Ho//7UmQFgAIEFUyGcwAAFcAIUMAAAAewVzgZvAAAWhsgQwAgAH84DHQLkSdBlEmgoXobp7vG640VBIZs0XPC7xrAW1YfEJfF8FpMqf+ilmfP/4cltNd88jJAb//////6n/2mKHuAynzCki6VaG/DZo2/FNiEhGPIDTSmU0c7ASuYmFPk/pmomZUEAQFQIYZsJQHt2anh0IJCXldmY1r37cSzbpquH//25wTgLwij///////1//tpp//lU1kdwVsSu9YMhao3mwNNIDsJ00MpOdlD//tSZAaAAeUUTgZt4AIXJ+gAwAgACKxZNBnMAABcAGEDACAAURoICkyjIwcBGiPy8gEBIPNxUvLxKDLonQMRNNxzGlh8zoRMh2Hz7Ft3icOhcf7P/////////t///T//9GsOyHI4P/5soGTXxeFjAcFJ5poznJFUCjCYTAbDTABEMNCMIEYQDy273lUHBweZcyRAfAQNEhU1yQPxUli8X+jtPZz5Sc7FatLh23oxgrR//////9Vlu5QDpO0lKDJVD2MfmaNBBNU5VpNqGTFhwHD/+1JkBIAB7xbOBm3gABfACEDACAAH5GdluZWAGEYAYUMAIABpiuebqAmDkTCHvhZlxEY6CAIOQ60l4HFBadCh6XWQLIgacTsm98nB1NEaFav/7PBtER4RN//////+m1f7xZgWFUuVRIkBzegud5gXVAdJpdJttsMAAAAAAAAFclO2Uy9d0nByqlK31B0TarcFdPm7jDXdG43GY7ETpNmAMDYZB+hJ/UE86f3Rt/8+I//////+v+j6rKyJEhR0NVl61ZJ/+AADlDg0ZAOzWgcHnv/7UmQHgAInFk6ubeAAFEAYUMAAAAg4WzYZt4AAV4AhAwIgANJQKKDJAQxMFMIHQKGNfDARZ8OGEgRcZ6WngOYualVLac5xmQrEUpVats7+Jf9Wwn1tx7p20///////R3V60NZDagpl1NFg12IJj8UaYfmnFgCDTm/cyBmEjwwgZaUjgYecmBD4OFRkAfuUAwSBISF6oEIfhsiEE6gwvTIubOlGb2tvf25sz21icGwxv//////16/SMAC0MUscYsSxdH35yNWDnMnm9ZrtsAAAA//tSZAWAAgIaV25lgAYXAAhAwIgAB3BJOhm2AABagGEDACAAAAADWoQpQZhaY0bAoCc5aBS5SL+tAmIEjdSmD09HU3tt07gBBGNazm1zD+G1L7XJn5lzX8W///////6qvKCsAoKuELgoLTa9CL9TxUzYtMhHTlYw00iPiDDDhQxcBMcDjFxKcEghcgKCGSKZF3kxGSEIAAcSyI7QeD+xAytcJ69x+QCJQ3L+U//////7qO3brFmPSXD7CZDap25vUgDKPLZhURN0SgEgnzvJyh7/+1JkBwACIBZNhm3gABLAB/DAiAAIEFVZuYYAEAAANIMAAACZIXgkIAw+YGAmEoCvEakJrNmmGJiAqEhxCZKRCAcwnqqfPsqiGXgtrgxQYuo8feldZ8fK8stP/////+Lmg279QbQIDX/EIKiEAZLFZvS7XbDAAAAAABABISoWAnauozJaJ4MceiNRuOw/KL+IBx8CYq5Y3VePw/IBdW9vToDzcsGekiiIOH1r+uoxG9TV5BNErgxOEzqBNMACowsGghDmGgyIgCYeABicLmEAwP/7UmQRgAJpFk0GcwAAEQAEssAIAAk4XTIZzAAAUgAgwwAgAPAhCEucYNApfsHEUbgJxi7CxFY33jUE7pX4f+Nw5cxt4flu3SYDQYZlzYAQAIAH/////4FAgb/u/+gCHAWgZnFRpw3Gci0dbOxhgeoE1MgMZC/hkwtmCxEw4t0YCBAcCAUJhgDrlYiW/e8KiLRMNiUaljE3/V1lWlWOOM/Y58NSmls6ZDH///////dp/lAIMFTgmf+GCHAJMnUA9rp5vyfb//gAAAAAAvROozuw//tSZAmAAkccVu5l4AQWwAhAwAAAB7BXOBm3gABIgB8DAiAA8FKqkEoBUNPWMUSKbiPpDe6QXjGvqybxmRrOud1TXjz5nQZ1K1qmi+kf/7RT9kixoinZMqVT//////+zX1pUk6kqYw40GB9Ql1T3VInA7YBWCRkAAGfBEiQmYAMmRC4yAPspeWwMJBB4Bkr1AIASQAQRSmK4J8l5qHCqpLdziv3T2NXH/jxHBJvMf////1/1A0o9+VDRWJf+VBYGlTp6Q2U0M4BS25+NsbGhGQn/+1JkCAACEhZNhm8AAAAADSDAAAAJTGtVuZeAGEIAH8MAIAAheUMDzCAozc2CgGXZVKYYFBgQW9YjbhkFLYPMs5dmtTT82/67ZqXZayyl8s/PurR7BAA0qp1yyW22gAAAAAAAIklpcNfiEhroHDGm1xruU3XWpo19mLgOg/BC080FiCsRaEIRKT1SrKrQuFHj00hyec3FwZK71//BpPaPn/////////6SAgDIIf/PlAwqO0v03AIzUS4BR9OYUcy6WTLpQMPj554+ZRDpjYCExf/7UmQPgAJhF0wGcwAAFgAIQMCIAAjwaTIZvAAIUYAhAwAAAHMLAmVzQNBIKDYAaUEpOhGGxopMCbbHnFrs0j767ltBzffjdFT28SJHWHz/9X//////1P1enHuct5wkee8EPWOc7bSdTeG4kBmuqdy3nv5hooCpeX2EjYzUfMiM0tQEHKXAICMSBAECtQdpdwkotY6MUh65LpawSPsqmpdnruMDzdqku/jz///ysTf//////sznAVdBJomN63LhD2NZ6kVnMppddthsAAAAAAAA//tSZAcAAh4V2G5l4AQW6EcQwAgAB8xbabmXgBBZAGCDACAA0SlXu2qXilhugmKGodOr0LiLeYJGptdEgUh0IcpRMCWZVENGJ2Y4EMQyO/3pXYfXZLiDLPh//////////9VYyKn//MqtmB///lYxlDMnV4P+cbj8cAAAAAAADVygLLLK0Y2eUcRkXaN3woCAgf+1LE8OWPRpZAMp/O/+6UEFOsTNv/9VwZ4gNHuDCP//////6VMtF/RCAiakUb/EYBRpBAUqNPbBJXOR4zPU40n/+1JkBYAB3xVNhm3gABHAGFDACAAIPFc2GceAAHOhHMMCcABiKoiYkHtdJnEIWSEKVWQddUFF5gwE88sRbQHcLuxOSHRrHsXJWtuffee5M0WfPhw3///////V7HHSidtViLACrv9AehDAQENOiAxMNzBgGMKAqCTBgAFiKYCCYQDAgLtZZOAgym5LqRGJ8IaYqnJ2q8vzeVsyFnQoL5vt9XVnBnflXS6IfIvYf////+n//X///T//0NLAujwLv//x4lHSw9VkyRhyyi8bjgAAAP/7UmQFgAH/HVjuZSAEAAANIMAAAArsdVe5rIAQQgAggwAgAAAAA71C0SFE6jLJzDAZDR2wUQmM5L+/8HQ+Ig0xYIjwAo5/wMHFZKikU//m21LSal///2X4QLH9tZvv//+AAAAAAAltAYGDr8bpVTLAycXBGhTU9UwT4IRkN02jZqDlPuysBImCFW6pozjorar8zAbNXBh7W6koFQIAV0zG3y3YlHM/7bf25S5cre1aP///////tac/0sNgJ3/wGFkD6TgAAAXebCtCT3h9e74x//tSZAgB8YgTUz9hIA4ZAAgA4AgABiBjWVTzADBdgCACgiAAaNz8d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9guhT72oYETOAIMETn/+1JkBQAB1xZMBm3gABhAGEDAAAAH3FMsGcwAAGAAYQMAIACj80UtMgMTAxKXzagRjYGYaBLe5mgUEAhfidX0QYkg9SlVv/V6UV8X/P/+49Bgi5Qn//////0q7WsU1y7GIEEmsDDiLj7+iM6lDxYAwXN7w0RH4yGTgQCTDgXDgSOjsxALSAAbLwrkEIaHAPDMFNmpgAVMrW4lKL7VWUwRc/7PMcondpLemkya//////+qWby1CnoecWpKTZAYPZ2OZwKZBUAAAGMWCJjFwVKke//7UmQGifGRFE6fZMAOFMAYIOAIAAXEX0DsJGc4VYAgAAAAAH5TjYy3qwkkZo2CEuRWhAkkTQORMZAvbdbtuPqbp915znv6nn7///////plSW0mjNCjSbmF1ubvYpWSnAYsAcQc4eElcuZmTdAWVBgSAYcTicJkyp1NUhiKohUGDVSNohW1YOngOqsn///////+xwuYXtEpmqkiSdkgmVrCagYgilLtgAAAgsXYElokizzcF0m6g8gAcGBMyGiFIPm2G0JwKBJmDSUkjyB6qo2k//tSZBeB8ZsTUesJMcoVQBcpBAAABjRdNm08xygAADSAAAAECVJyu5AAAABWYX//////Uwz/mhXjG08U/0hSgEXQQDGoZgzbTx4ul6jpCBfjZP5BloVDieCuSVEYvG4PF6rT3W8Nl5WQz/SoqfK/KgAACU2AAAMljyAM0s6WrhUtYaHJIKo8jyc0OEx07FSwoU0GDApgwZElGEkwaYIg6BRL+gAGA+U//////SZMP80aNGzJkyZg5aDPYigHaAAV+Nu1BUwNx/MAbCsiLzEvI/X/+1JkMInhmhPOUwwZyBMAFJIAAgAF3F8y7DBnKFqAX0AACACnUaspMdRgqOJDI5M6ykJYcVE3/X//////4IXyAgdlz4ZKAgc5PLlHILh+AG3gAAAF7SqiNToLp8IyQlrpak4dny5ptZTmGGI4WflkoQaGnj3QKllNb9szDOp2KP///////6odqSPsnad10TZGBvrLrAumyIKAHQIeYZskokE0izDSCLETLeK00lQgThK43HIzXHUESVuBjlEcA0QD0GxfJI8P//////07HquDjv/7UmRBCfGIF8w7LzHKGEfoAAACXEXQNyhsvYToaYAgAAAAACqnDaBRAFOk2sSOPCAVc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AAAAAgASwwN4YcAWYBgQAAAAJEBkewhGkijk+ZVedu7DG17QGLXjh3////69FLtH///////3Jp32ttKAV4HCiFGjCiYuWM826KMgIQomGYAYNJgckmDhAuUeyNKDqJ5A5DfltH3RMeJab1N3GoeSEYl4tFNUlRsx1jsZMmTKEf/////T0W///////6pIXfRBYugmo+tkdU8sxwSPN0OS4BqgDEAw4JHRo6CjIdkFOFnF8k+mnPNnMwy5TvOs6wu//tSZBIP8eITQoNYYcAZ4BfwAAIACIRPCg3h5wBhnWAAAAlxFxRQTdQeLFixhhhhvRcXJO/////+s3p69O3/////8ky/tUFK4qVcD4BE7UiMgQGOBcuaS8Gm2w1FmfqAkFGXliCYyEUGRHQ6HoLCQBEmocR4KMqoUtmpK3PmPppLdOc2FbhltFjTT7muExoTHPf////t0j0s+j/////9vqm2tX20X3fVjjEruZqZ577dKYowehOMWDMQ80YoFiYzICMJBChABKA8xA0ukKnWGCr/+1JkDw/iERLDA3hhwBeAGAAAAAAIZEcKDb0nAEcdmkQACXMYMQfhxSx3mKOEEI1E0eEpL4/qjZjhswUQQINff/////926TR//////+vXcrllmdYFWEgoJgMo0DTVHkGpGgDBhazM/DzNw0ysLARuJC4qx2gmwEsAjAxiZnmxHYSsfZfznLskgkEgnPtJKKKQYCAYWH3f///++4/5mqxI0+6rn////////p//0KYGDh2ppiDqMrhjKbQa7zAU4ycbMGGhUtCCQwJSgILkIHpyIf/7UmQOD/JbFUIDeXnAAAANIAAAAQg4SwwN4YcAAAA0gAAABD0WCqCjCkq1N9HLbVFklT6BZ3NUw1TuLG0+9aXkuDYoOf///9q5Shbx6EzrLny9Ri7aHjBqooZgQmCkANGQgIJiswDAxRAZ1xZCE5NVCZmnwyFpzI7AzJJKTnh6fIeK2Y25iFQyEmjCn///7f+76r201RJ0OnDzfwcWnzIxQVIgsSBQQLrIWBmB5CmqZaPa75pnCx3/vOoEA+jyPZfgVq0bTFAGEDYGFGf///od//tSZB2P8hcRQoN4YcAVAAeQACIAB1hLCg1hhwBon9/AAAlw3K+lzkKdXzH///////5/D7KonAgASsocGnwx6CYJxGOyHXQgLoFVYOiorJ4nticaEIXArGKgUPgRfKtLaNbZLWMQShMi+rSL3ZdXS1QcBTVv/////92/T//////+Tvy0+7q/yMjqcrsruzA4VHggtlBBALsToMOdOElM+UMCVLShx4GpYCNGTIfNTVwmJspD4CZVHUkHxVoblP1cGu2C4HJJa+n7/9zrOvCrez//+1JkHYzyAw/Em1hhMBagCBAAAAAHDEEODb0nAG0AYAAACACuZerNcf///////ZsZc06gNvY4iKAYe8Sttp2rMWETgxUHTQFHAAOI+AEBAQGowGMJ4P4Hwfg/yTq4uB9pg3JAbH1iBxRTW2gQE6Rxxqf///////0f//////0LrWLr1ooBI4FjgsAGC5YVLgIMKFxiBk45iQ27s4AERkEOplxwgAk2SzhfctKkc8qmy01eQHksV3sgOAcdImB0sbhbLRQMnVGrn////7FU8Xu/X//7UmQej/HlEUKDWEnAG8eIAAACXEcwSQwNYScAagAgAAAJcP/////9EXtZqFMzvIqFRFZ7oqIG3wE12vbt70Am5wt4CFD4sEqwQDMaGSbBzQaERBV0i0ravRRaULNdN+XoiQMgwIkZC4yo0nGT7Hk0Cif/////7tP/////+39uBZeF5YYDIxx1gSMk0oAZETFSYvUwgxOJATHzAxoeIAcwURfkMIABSADCMg23oXAmor6KIJgvCGnOWCjYuWRpKNvIC4fCLXD/////8d6PX/////tSZB6P8dUQQwNvScAawBgAACIABwRFCg1hJwBqACAAAAlw///60pSzNJe8+IgeXiQLpEM+DqD1ILBpRjHAb0MmbMIXMeuRlDko0bpiAZZ5tyJLLmBtyjLNGKtgffM2EBEI2UL7Umy0DihgOsMLu////r6v//////Q+dU+k9HER5wJSrjDRRgPgY+plBSsx0MBEGYUXmWgQCYkdQw1MIBhG6EipEZlYS/McTOV2wmLNFdGeA1IGRw4ZQFtVT1pLwAwXX////9v9n6v/////177/+1JkIQ/x3hHCg3hJwBqHx/AAAlxHfEMKDWGHAGYAX8AAiABOvyvPeZGIiWa7MUtSiNXkH9tXfEGRz8jDGPjMDTLozEBAxaYcGIxF4y+CuU+1FnAV3DzQGjUTX4gHo5pDwtnL7Ex4C5kaUSxP///+r+/XzP93/////nJw5XDjp47DzwK4w14VAsscDRRSMOHAe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oDxH0JOaI5qlhOo60KPd0nlR1EjZTiit0gdFTwz////b2qBxovkYODAwOMuQLyaBb///////VkQ1zpYSxEDSg6WJBQ9liwdLDJtTf4xgeZQ8CDAcDMKNVtBSET0zEFH6S7d9ijQJE1aWve/RAOlTZEvI5S4kDJw2Ysr///9HeWLobAZa2Fgo1wstsl////////7UmQkD/IZEEGDWEnAFOAXsAAAAAaoPwgMPSTAip7fgACJcf/ieUBMHw/WNPiB2JygIAc/PDbB/QQktkKEAZx6wCg3geBBxYjoMHiAJlQaCghJxB0btZtIuGHvan////+ZpOpdRXu244t///////////fpXqtZGc5VYy33OkxAocrTOPHgkendzp7VJeD8lA2hshAUUtCFADiJSLcqSargxjfHUajIlHx6iajhdgBYGRg9d/////7tD2W7U1knvrsuv/////+1Fr6pRKLXlCHb//tSZCKP8aQNwoMvYTAhiEfgBAJcRsQ/CAzh5MCGoh+AAAlxepTEZAR7Mr3M6qjBqyNm8wI15z1nDNBcwu+HPFUzJRkcwj/ZVocFs5MmA32w84ywpX7VAj6jwqC4YAqk////6NvKfXduPJT//////rVLHZ60aW7kmd3MjnUpjHLud5mGOinczkEAVGcNNyMRDB7pnlmOANIExGUXcWAL9yMhLIYEoRjwWm3xIhP4rwR0CRc4lj/////q9pe7tJfaj//////uqWvfIvypWc5JUKr/+1JkIg/xnA7CAy9hMBxoV/AAAlxF2D8KDT0kwHwjX4AACXH6nWzLdXdxCMFz6iYikGcLhF1RYOHDwcHqDFF0FlSJvD60WEStA0SER8uVisi7UuyMNiy/////+3+7V//////ulErI2/X1UqHmRZChghFdiqpu5aNMrsGONEI4YSeINwMyFFMwBmThlkZFFmUJ5q3PKvsiAxJ4coY+IZkkVvOIUx0FxoHANLE////voo29Xa7dlxq////////Rl22+Zp6SuQyId0WR4NFmmDMMnv/7UmQpj/HHD8GDOGEwHufX4AQCXEYwPQYM4STAf5yfgBAJcQAuA/Ks3OzSeBeBrhxsZDDjF+KFNNczNNrkbuDcQNgObVFyTDjLdKRHha9X/////m9bbvYhRD/1/////7fZJUcxWTciTTnU85sWDOWSDUlJvKxrwJ3N1TAUlNQVNBSFOFH4CkE0QcfQ/jbJ+XU/TIeBYPpoiItTLLKDAQDqmf////9ysEdn0Wv/////0/t9bWSnShCIhBUjsRLOzKpVoiKslz1CqM10idKJp0Ad//tSZCsP8X8NwgNPSTAgyIfgBAJcRxA7Bgy9hMBsHF/AAAlxUAthDgENFiBaAvwNqEBol7JAcYAzgfk8hXHZYfsHOqmAsC40UcN////5fvHuo5VqX6mV/////9/0/Ukh7JeqLZHUW08o3xptCUbvz/yGqjHQzLIjSAEhgccRTTgWsS5hCAI9DDDSxBF7pgnXIauFfjcPg+Jy7Caf////533mXt4Em1pmv/////s+9EK10+juU1rMZYyWKoQxhnRTmLEKcMeCUvSqmMvGTFBwQMP/+1JkLw/xqg7CA09hMCDoR+AAAlxGrDsGDT0kwISh38AQCXGhCUFCQDEtq7LyKEdItJwoTTQaCIMgyeclJpplkABAGjyNn///9XpMajCr3f6j//////+v1f13+zzuiO5GKjMoZVdVPUhSqplUyLhOhzNdGyyHgLKoAjMBU3EopppMLwXO6DMZQw2QpVoJoZqENQloyCwbDY0YOt///9X39IvY1GoqaZVJI/5//////9/20dlZbLVyI6SLclGMd4A/wTyrCkrtXnCnjRgBkoEGVv/7UmQvDPG2DcGDOGEwHse38AQCXEZUMw5svSTAhKOfQAAJcJVkRoeIOhuFwnJW5H+0rsfTJ6JOgxTAwTJpyne/+z9W7SKubSpd1f/9dX/////eiFtXVmtO86jI2yIRp5RSJKlTWR1MzHO1DKc8KlUzkwz6IKliqEHAShgnhKC+IWh8dztCWOHBGdLnV00000hQUFP////++uuJuvevp0uH9L/////vSs10m17KdndZ0d3UrozMwweKdkYpRUZzVHFod1AE2wa0QY6AZ8aBCBgw//tSZDCP8X0OQYNPSTAmyNfQBAJcR8hDBA08xwCAAB/AAAlwZaAu+hAFWG8SgLo5A6mQcUUuTMhrcpQIDAjzELVaOnTp5jEo///t66bo+t9CnvKUXOQwt//////+m9DEgI6cEwoHw8FQ4IgcPvYFA+IUOAgxAjCKC18ACACVSuC4tGMQlSjS3Va0ZxX6fV7yCDMpixpRG6fwn+uIHhc+6n///9GnrpbqUkkhqP0f/////ttVTjo1yzTn2M91OiyK4mRzb14MLqjkEQgomaiAaU//+1JkLI/xqw5Bg1hhMB9Il+AAAlwGQDMGDTEkwJAf30AQCXEYssDQhc5bQqEgYDIIgZBEOxGEyNtI4siWRSeDQNBS43/////ppEhVrdrjqJ5f+X/////nvlOt9UlKRWtWxWa6mRTIcIewQhJjOoRQbneyVzxFOvA2KD/GIgDVSWmF0Itp6F0Ysia/DRWgn4BYA6QUg7cSn0JV60VMhImWV///37c77bzkHT4kE8iFBdhl75Ptf//////sd+ayI9nZGMDVYtnZWAiCmMp5kdrKyP/7UmQtj/HwDsCDOGEwJOg30AQCXEYAOQYNPSTAc6DfgAAJcWecGXC1IAE2M1Y6Z06rGAhamCuATHg6yWJIfjEjQbD4TWITZdqKmKUUQF3k/////9/ezRF0r+0p//////6O6GRdJtmqrzWo4KfRgxTOhbVEJDw58208KjdGDkn9IAU9RHRvm2Vg8DwLYfiKA6CpoirHHnKJRaImIf////suXlLFBlc8pRVDMylVf/////029t/ao51K53KSR0EoQqoztYx73cpFFjAJixo5glAN//tSZCwP8aMOQQMvSTAeyGfQAAJcB8A/Ag09hMB4oh/AAAlxqsLVjAYBHh2hQgdQsQ3ToH8fphBE6HSA+JLj5jA+6zT2TISSSX///0db3UXiqyp9hPAQVOAc0xLF/////9P2y0Q17WStyEvZmuohyqytZEdmYkqKIQ6CVQDZEYM041BRJYWIF6ChjOXhH1UqyEQiaL0Mqozs4pEv20YWAAXNN////+3krtZgyyPTNabCf/FX////9bau1r3aciu5Ssq7Wc4dAMiNvY90We52ODf/+1JkKo/xqw5Bg09hMCSop9AEAlxGcDsEDL0kwIijX0AACXEsobrM+z2SHlwCiMAoyl0wdRrkzSBpl/O030GJkZ02Kzp1tqVxbmdHGHf////8RqrYgWLHRe4Xsq//////7rVGOjlfvYl7NKU4QpDqUpnYIxnu8xkODuqpBBk6MnYMUJMSiBy4vKqQJUElCCnKbAmSLRqeOwIuVJSM5ceWu5ltdSdPLd////1oxxlR0VO5IfpW5T0l9X//////6WretjqQ1pWIeJlWLiEIrZLu5f/7UmQpD/HDD8EDT2EwI4jH0AQCXEdkQwYNPMcAiCEfQAAJcXQqFZaIcjHEsA4Fooghy4MULyGQq5qAQAkh8FChU5kKNfTzTdQXFkkFE8PShCwsMCIWDB9qF///9VWuYWKIAj2UNsF/Ff/////XX7tKR52c9hLI6kIoNocQHsKO5kEpiKIDwx6apWsfES3GUUA61oPO1kJATtCm6K6UggZKsMwStOZ4Oi4UMVIT///+r1PSgjhu02Kf/////2v9D1aTsVbvMiKuHdHMUlEQ5TK7//tSZCMP8WsMwYMvSTAeiIfwAAJcRkgvBA09JMCVIN9AEAlxmZnBv+gYAaRUFpiAEEpMtiCdO5VHsly+kJeJ42yUDLJEimMBkOhrIf///+tNK5yS1FUMY0DlM9X8v/////N+6Msu+1yNo2ZHooyKHDC1MQc4m5Y4JEMFQvxBdACg1TKzVyhcoBjqQa3hYjN2BqVxx6G4v1UBkJsisUaXOYmiynaUPsX/////uYyo7Li0VE0c2RJD6v////9/2RV8zMW1WRdHRqOGodTJaRHoUGL/+1JkJ4/xsA9BA1hJMB6IF+AAAlxGiDEEDLxkwIeiX4AQCXFPCtGaqnOoMYDKpIOXQjXQAsD0HKSgkioVafhgRiao5iAg0HC58hOf///q/WQbrUoaaSk1Wlw9ARSj6///////3rm3nV3V3mKXokhwq2GVmMMiKYhIMMwu8S5hOhW8AhZggqULvLqOQlNB5A6ejkDYfiEAopXFJLSJoHToa/////mKsugANW1Zraq+5dyRnLv/X/////////99i3c91RjrVKWdVDvC+uwKRASoGf/7UmQoj/GTDEEDTEkwJgan4AQiXEZcNQYMvSTAlKEfQBAJcU+KX0yXhvEGvyHEBQ4VNUeZAELIxooCrXmw90xY2MLQLlOupMTnAceZu////2188Wcve/WNFD0i5wF/l/////+1XorJdXcHVXVn7MUjqT0OdHYSoYO4KhlU4ZG0RAxElTodIA6Jjz8wwDcFxmtAOAsfKAABBkjDBJa70tE58h/////ZVsVay98VgUMbXK//////+69PpqW05TuUssro7XZ2RmYyDHFHy6HClQiT//tSZCaP8WwLQQMsSSAb6DfwAAJcRYgxBg08ZMCSI9+AAIlwBYOAiJa2kE+FyH9c/k8tRpgqiQx0BAVEQcV/////qU277LWj76ERzF7//////////12/peaa3cxTMrIhHMpnUxCuNQzXQoN2GnV2tBIqCfiAQN+QdxYgkNCxtxCABA8jIA9kj3xYXcsVW82JlQ2tmvr+vo+/10fo6//7h//3////7//uqXXdUoh9SpSUKLQqlWgPcpmMoYz1dSBrGGsBJtEUGialcayYY/BUNgH/+1JkL4zxcQzCmwxJMCJIl+AEAlxFfC0MbCRkgH+cn4AACXHFlyd2EUDcg4vUXk/aNr7rtFLq6rO/boRXX29n+n/////9Ufu7OS5bMlmMUh2BnIrBTBsksXurYhXZzW7L1QAACSlZAgClgcUwtTVOmGSjLwDIhkhpZpq0HREbxR+rR6kct9XfYi1XaqnY8qt6+5rHp//////9jjEw9p8LijEickKhk68JJFmmihAw5ZYWNHGmTupeDUQORdYM4KUehQoQSYuOUUC4kRGQ0hikjf/7UmQ3iPGWCcJTJkkgHiAX4AAiAAc8MwAMvSTAeCNfgAAJcMWPEnq///+/nk5c2XIJtEZgCrCKzhxJZIwR2lP////+vSXaVbfczo6mspqIjSJnYxqhlPUlyJu4QiEyLTFBSmMABHB4y2HAUFwDiJGsCBIm2u2kwAxA4u//////TbHB5yRU2pgmKoQWF32Ff////6/Xf3Q5CrM+ulos6g2ZiDLc4tEoQOiIyUYUAOu2YqIBhyLsdZRDonpKUotH8ngsWgQPEpLYoOlFEVM///////tSZDmP8YoLQQMsSSAgqJfgAAJcRfgtAg08xICTn5+AAIlxsSl+TW16Qqg65SyTXWCuf//////////ZPklui9A6mOUp2djo87pPaiIyhAQgEvi1GdySVRccPRARJjmMzbqESDehFQRZwqU+EuZCoPOwVKxxEEwKp4s9n///9Z5UWQwAHXOODQTSFxj3Nh5VNX/y////1/0+lTMVpEf5b32dDMdXKiLKzkPOaQjKOOqvTA1EjwQQLAO22QJAoXZKzjYF2db5QDHnlEH0zBw5P///+1JkPI/xyQzAAy9JMCAop+AEAlxGCDMEDLzEwJQgX0AQFXH//qdrrUskcoaVQtCY5C05r91//////6c9c6xycpRhnYdNGtVAwxR4mV3IMh1hFoM5Z5EGVbUzLi50hTyXFLAQTCeVFr5s8sAlpokXeVDWpez////lH9tzRCdxIQywAWtSHHMb9f//////1QzmLSVZUep2M5XLypczKbSxyXWFIV1ZUmKGfBP4iOJiuFAKiLrCRlKN0dqBP0wksxAqLWITEyJvFQySHPJf///pFP/7UmQ7j/FvDEEDLDEwIqjH0AQCXEeYMwAMPSTAbx7fQAAJcXhQAvbASECigcKi8FTgTlzrmgBDAkR//////6abfOdKvSRGzocjaFeEB25Jal6scP4QCnIkEAiFU2JKwALJQeA0Kp8IiVMGE0ieC7eL6A3Df////+somgZc0Ve5u9A5hKHy/////+n7/c6yKqrOyOdWoaZEV1Kt1U9QA50ciMoJTFsEVggaEAyMgwnUzdixDlEXZFp9hMGB1yZ2DGg+F0G1f////YW+cKYFaRqF//tSZD2P8XIMwQMsSTAk6NfgBAJcRcgrBAy9JICQIh+AEBVxhMubc6Ui/P//////6aa5ryqdlVUR0YTuyqLK1J1Ody2qFGPspyoOngk0yjzoHMLExbqialiSTYlYn6pF3FwfAJFoLRoWFIkqWGyDZZzo7W/////////0+iLayGZpDnQ4Rzer50EuR3zWq6r///////PdaslJj2Ii0E5EQxkOjIYS7VVzMEIEKQXUpA8sAU2TAIltGclXdAFoJDHfAoycdqCyILlwOD4IBgQIXe3/+1BkQQzx9kBAAwcS4iMoF+AEAlxGBCMObDEigIwin4AQCXGGCnf9HX/KKU73o/bxQh3pmf9f/////9ElpR51v63O1HcghVOjOUGWJRmMp7upmIgqpdQKR1CYjMKlvEl46JwBAEBg8HjF0eb//+n/6qrMzMzMyqqkqqrMzMzcqqqqv/G/54P1Lv7M3xfX////wMAKJAAUAZEoDDyjSHCFoiFQeAIPB4WMXv0/1N0eYxSlKUpSlN+hlKWUpSlQ36KWUrVL/Q3/38QYk79npBlh//tSRDyP4dpEQAGFGuA7h1gXJKJcCukYtAtSq4kKn5TBcNlxv////uxWAADA7sSBgN06////Wkkak8JRAxuRwJIEW4tJrUtX//1pDpCAFh8QoELhQMFhoDqV2Az+CgGgKKWIiVmUv///rMiGgoXAPjcgBoLDhJ41CQYUvf//5//////////////MyYTLgoMLhAMAIAwMCgGAMIIWQMfTLgP3iGwMagbAMHgVgMOoPAMKYGwsMFBkUL5cTHUcUIAAGJb/////BwTsVT3////WcGv/+1JECozhe0U1Gqqi4Cxn5gNUFVwFtRTOSraLgKEfmE1QVXGGil/////UShncuAZUQIYbt////6iTA0pUquAAAKADOl////////////SSMTIjRrBbUA1gAaZOoXSHkEQPAOUwXtGSIibHnEhAAY7P////6gQyG3////Y2EEBMm////uZnnMhTwALIoMwWr////rHABzDRJMBwAZlv///////////92PlQkxRAWF4KsICwfDkxIQKiYMGi1EaUjqCqECDAABiW/////wyEzIH////7UkQIDOF2RTUaqqLgKifGAlQVXMV9FNBKqouAoB6XxWBVc//1lgNcYf///6JGl5ExHUBhlAn41S////9RfAOtlpwACAGdL////////////WcMyGCvggAAArBA0qdgbDh84LA0CxwEPHgtnkhGAADGZ/////lwSeU////2ctDFFU////9RKLUkWgYnC8i2z////9ZQCokl2IDELf///////////qRRSLpFhzQt+Aw0kQPFFQEQdEgBuYAcGRmidCZAAYzP////6w7i11f///9R//tSRAgM4WNFNAqtouQpJ6XhWBVcRdUS1Gq2i4CqH5gNUFVw0JhTFX///9Z1B1DPgZB6HvlxP////1EaBwwBLOAgMTJ///////////+rTLg54hQG0wMTKwD4RrAw4AgbQAOBwDALIIXwMMYMAAGJb////+sVUd2////uaETGZG+3///9ExKyJiPoBDIc5FX////rJoDVCS2BQAZ0v///////////6SRiZEaNYLagGsADTJ1C6Q8giB4BymC9oyRETY89FEBAABiA/////wxG+Rv/+1JEBw3hZUS1mqqa4Con5hNUFVxFRRLWap5rgKCfGAlQVXF////Usjg6ht////qLCKSRdA3lElNm////9RFQPrjwAAA4AMy3///////////+7HyoSYogLC8FWEBYPhyYkIFRMGDRaiNKR1BUQYAxAf////41BuV////2NyCC5h4f///+ssoZNganijmj////+sgwHbJuGAM6X///////////+s4ZkMFfBAAABWCBpU7A2HD5wWBoIiQKOSB9liAQAGRL////+oKwUmnf///+ov/7UkQJDOGCRLMSraLgKIfmc1QUXIW5Es4qtouAoh6XhWBVcYghGjIpf///2QLaJREqAjsFcOqX////rMBHoG5rFQAAAUAGKr////////////0Ui6QIBCED8ChRSgMwB2D4BQISiOcRUvMgQAY7P////6gPhS/////QMwviKO3///9RYRSLwxoGhehcknkX////6YnIDPUzcgMTJ///////////+rTLg54hQG0wMTKwD4RrAw4AgbQAOBwDALIIXwNQAY7P////6gYhs1f///9Z//tSRAgM4W1Es4qtouAsZ+YDVBVcBVES2Goei4CZH9nNUFVzSAoEGkj////WSqlsRMDXBQoHLTt////0BOIGLsGAAAAoAM6X///////////9JIxMiNGsFtQDWABpk6hdIeQRA8A5TBe0ZIiJsecYUQAAGbv////8VB2KE////0yGCeiQ////0Cgb1kYAacHAn////+O4EkawMADFV////////////7sfJAODB0mD7kDI0BJUBADwx4WkfRZMEFkjIABjM/////wowSyn///+ikT/+1JECQ3xe0S0Eqqi4CtnxeFYFVzFSRLWaqqLgJ2el8FgVXM0LdjRf///+kUiqkZC0gYeKI9LyP////oCfQFphkAgMTJ///////////+7LOFMdAjMCgIAwLAwNlqIDAoHC4cFBKCIkCjkgfZYUQAxAf////4PjXOb////QI8PxJP////WSpktEvAKIBMjz/////HcAKpRBiFv///////////1IopF0iw5oW/AYaSIHiioCIOiQA3MAODIzROhKkABkS/////rDWkT02////0TIP/7UkQJDOF/RTMKsKLgKSel4VgVXEWtEtZqnouAnB9YzVBRcbEBJm////qJRNkxXANTIBEAJ9BP////sIaBqMBPIgIDEyf///////////q0y4OeIUBtMDEysA+EawMOAIG0ADgcAwCyCF8DGFGAABiA/////wqG8Vm////1GY6A1Iqf///7l4eXSHyCasmVL////+QoGRPmoHABky////////////1LOHSOD+gP8Ad+KI6LQbWAXGBEBFiIiVjzdRIAAGMz/////FQE8r////op//tSRAiM4X9FNBKqouQoJ/ZzVBVcxbUU1Eqqi5CcnxiNUFVxEVD4xUX////rLKSJdHKAzyQNCKqTf///9Y2ANgwKzAAADAAxVf///////////+7HyQDgwdJg+5AyNASVAQA8MeFpH0WTBBYyEABiW/////wcE7GJ////9ZwfYaKX////9RKGdy4BlRAhhu3////qJMDSlSq4FABlg////////////1qMygOsOIASjwM2lQLQxQYXaBY4CHjwWzyRBEBAABjs/////qBDIbf///3/+1JECIzhhEUzmq2i4CVH5rNQFFyF8RTOKraLkI8fGc1QUXOc1IkIICZN////czPOZCngAWRQZgtX////WOADmGiSYAAAYAGWP////////////0S8BQOAV4Hk4TgHYPgFAhKI5xFS8yEABjs/////qCiEQ8w////6zgTFEwv///+ssmyJdFeAy0gN+LqSP////URcDohSRcCAAxVf///////////+gmXCBgIQAfgaIAEAHEBpQolAi5cTAyMAAGMz/////Lgk8p////s5aGKKp//7UkQKjOFfRTQSqqLgJAe2MlQUXMUxEthKHmuQi57YzVBVcf///6iUWpItAxOF5Ftn////6ygFRJLsAAQAyZf///////////6lnDpHB/QH+AO/FEdFoNrAs6FtKxqsZEAAzd/////geMY8Z////WolRE0f///9MjzSojwAMjJof////UYgM6PAUAGTL////////////s5oVxsA4LguFgRAsUmLSDUBDVKR2lUUAYlv////6xVR/////ZMZkb7f///5ibImI+gEMhzkVf///+sm//tSRBKN4UlEtQqtouQkZ8ZSVBRcxOES2koeS5CMHplNUFVxgNUJLYABgDHJ////////////1LMCmJ4AjXA4LAQXHPENAtcEnJA+eWMgGXP////8DRnH2////1lISw2////1FhGkXQBrGC7f///+ougfoeAoAMcn////////////SRSLoywAgzA1IFhDSMFkAHBkZonQlQhAQAAZO/////yhuv///+xuOYQItf///6zqGZgAEbbf////WXgPdwAAFwAZn////////////00CbAr/+1JEHQzhOES3GoWK5CLnxzNIFFzE5RLaShZrkIse2MlQUXMIAG6jgJgngNKFEoEXLiYGJEAAy5/////hAN1////6iiKHNf///9kD7LJQGuigv////6idAywQCAGTL////////////Us4dI4P6A/wB34ojotBtYFnQtpWNVkCAABlz/////BQ7////9AzGNJP////nEaRMgAtGil////9ZEgALpgAACgAyZf///////////9nNCuNgHBcFwsCIFikxaQagIapSO0kQDLn////+P/7UkQpjeE1RLaSh5rkJMe2M1QVXESZEtpKHmuQjJ8ZSVBRcxxDT////rKQngrf///86qxuA0kYbP////8iIC+FBgDHJ////////////1LMCmJ4AjXA4LAQXHPENAtcEnJA+eWVBEDAABm7/////FQdp////0yYE9Eh////qKBvWRgBpwcCf////47gSRrAAAFABjk////////////6SKRdGWAEGYGpAsIaRgsgA4MjNE6EigDEt/////hGDNP////MQ9seX////zhqkZDpABXi//tSRDYM4UpEthqHouAk56ZTVBVcRQ0S1Cqei4CEHxzNIFFz4Ukf////jRAg0SC4AMz////////////6aBNgUEADdRwEwTwGlCiUCLlxMDUYUIAAGXP////8DyOc3///+gR4nkr////6yyqibANIGEz/////JIBOUQACAGTL////////////Us4dI4P6A/wB34ojotBtYFnQtpWNVhRQDLn////+Cp+e3///+iTQxhJf///6iwnWUAAWDQT/////JEACiQFABky/////////////+1JEQI3hSES2moea4CQHtjJUFFzE5RLaah5rgIue2M1QVXH7OaFcbAOC4LhYEQLFJi0g1AQ1SkdpBAGLD/////CaG+v////WcC2xEE////7pGqRkNUEL8dJxf////xtAZ9iauAAYAxyf///////////9SzApieAI1wOCwEFxzxDQLXBJyQPnlgIAAGJb/////Hgd1////2SLorcbL////1nUkUSHAcKCHGr/////IQD942YCgAxyf///////////9JFIujLACDMDUgWENIwWQP/7UkRLjOFVRTSKqqLkJGfGUlQUXMVhFNRKqmuQjB6ZTVBVcQcGRmidCRQwgAAYgP////8MBtkL////6imHVN////9RKJ3LgG8gkh9v////USYH15q4AAC4AMz////////////6aBNgUEADdRwEwTwGlCiUCLlxMDEHEAABlz/////BQzb///+zmpEiCEu3///9zM9USoEMkXV////+aADkPhADJl////////////qWcOkcH9Af4A78UR0Wg2sCzoW0rGqyFBCAABm7/////A4W//tSRFOM4V1FNZqqmuAi58czSBRcxS0S2moea4CLHtjJUFFzY4/////OCJIf///6yykiiQ4ADAySP////1F8BnZ4AAAUAGTL////////////s5oVxsA4LguFgRAsUmLSDUBDVKR2kSAABjM/////y4JPT////ueGKKp////6iUWpItAxOF5Ftn////6ygFRJLsGAMcn////////////UswKYngCNcDgsBBcc8Q0C1wSckD55ahAAQAAYlv////8MxNyL////zoa8x////1nUHUP/+1JEXIzhTkS2Goea4CTHtjNUFVxFXRTQSqqLgIyfGUlQUXOsDDKRY0E/////UUQCrRacAAAUAGOT////////////pIpF0ZYAQZgakCwhpGCyADgyM0ToSIGJb////+sVUf////2TGZG+3///+YmyJiPoBDIc5FX////rJoDVCS2FwAZn////////////00CbAoIAG6jgJgngNKFEoEXLiYHVEBAAABiA/////wxG+e3///+s4HUNv///9RxaSRdA3lElNm////9RFQPrjwABAP/7UkRkjeFeRTUaqqLgJOemU1QVXEUREtQqtouQhB8czSBRczJl////////////qWcOkcH9Af4A78UR0Wg2sCzoW0rGqwEAxLf////49Duv////TLgrYbD////1nUKBNgZAqIeaP////6ZBgM8hNwKADJl////////////2c0K42AcFwXCwIgWKTFpBqAhqlI7SFAGLD/////CYG2v////UUQtuRFX///9kD7GI3AQvh0HVf///+gMyBnWBoAAYAxyf///////////9SzApieAI//tSRG2N4VlEtZqqmuAkB7YyVBRcxT0S1Eqqi5CLntjNUFVx1wOCwEFxzxDQLXBJyQPnlhBQDN3////+DBNmv////oE2LNJNv///6jiKSRMgY4i2pN////6yJAYupgUAGOT////////////pIpF0ZYAQZgakCwhpGCyADgyM0ToTQAGLD////+oPxA1f///+ZBfgdzf///1llS2K4AzkODPO3////QGRAwbxAAABcAGZ////////////9NAmwKCABuo4CYJ4DShRKBFy4mBgJAD/+1JEdg3hVUS0iqqi5CRnxlJUFFzFPRLYaiprgIwemU1QVXEMWH////+IIOaf///9ZgGQhsP////QKBuyxqAYNwKUTQ////9MWICkFYQAyZf///////////6lnDpHB/QH+AO/FEdFoNrAs6FtKxqsBjM/////wowS0////8xC3Y0X////zhqkZC0gYeKI9LyP////oCfQFphkAAAKADJl////////////2c0K42AcFwXCwIgWKTFpBqAhqlI7SgGLD////+sP5R1f///+Zhfkd//7UkR+jOFURLSKraLkIufHM0gUXMV5EtJKqouAix7YyVBRc7f///1llSKJPADOA4I87f///9xbgMK9NQwBjk////////////6lmBTE8ARrgcFgILjniGgWuCTkgfPLVRABiw/////rDCb/////ol4PQG03///9RYTrHQBk1AfQ3Q////+NkDJODZgAABQAY5P///////////+kikXRlgBBmBqQLCGkYLIAODIzROhMAAxYf////4TQ31////6zALbEQT////ukapGQ1QQvx0nF//tSRIcN4U9EtAKqouAkx7YzVBVcRU0S0iq2i4CMnxlJUFFz/////G0Bn2Jq4XABmf////////////TQJsCggAbqOAmCeA0oUSgRcuJgagIAAGJb/////Hgd1////2SLorcbL////1nUkUSHAcKCHGr/////IQD942YAAgBky////////////1LOHSOD+gP8Ad+KI6LQbWBZ0LaVjVYUMIAAGID/////DAbZC////+oph1Tf////USidy4BvIJIfb////1EmB9eauBQAZMv/////+1JEjw7hVkU0iq2i5CTnplNUFVxFWRTSSqqLgIQfHM0gUXP///////+zmhXGwDguC4WBECxSYtINQENUpHaaEAGOz////+oEMh////+xsIICZN////nTzmQp4AFkUGYLV////1jgA5hokmAAMAY5P///////////+pZgUxPAEa4HBYCC454hoFrgk5IHzywoIQAAM3f////4HCzHH////5wRJD////WWUkUSHAAYGSR////+ovgM7PAUAGOT////////////pIpF0ZYAQZgakP/7UkSXjOFYRTUSqprkJAe2MlQUXMV1FNZqqmuAi57YzVBVcSwhpGCyADgyM0ToTRIAAGMz/////Lgk9P///+54Yoqn////qJRaki0DE4XkW2f////rKAVEkuwAAC4AMz////////////6aBNgUEADdRwEwTwGlCiUCLlxMDEABAABiW/////wzE3Iv////OhrzH////WdQdQ6wMMpFjQT////9RRAKtFpwgBky////////////1LOHSOD+gP8Ad+KI6LQbWBZ0LaVjVZUUAYlv//tSRJ8M4VxFM4qtouAkZ8ZSVBRcxTkS2Goea4CMHplNUFVx////6xVR/////ZMZkb7f///5ibImI+gEMhzkVf///+smgNUJLYAAAoAMmX////////////ZzQrjYBwXBcLAiBYpMWkGoCGqUjtIgIAAAMQH////+GI3z2////1nA6ht////qOLSSLoG8okps3////qIqB9ceDAGOT////////////qWYFMTwBGuBwWAguOeIaBa4JOSB88sqAgAAYlv////8eh3X////plwVsNj/+1JEpwzhV0U0Eqqi4CLnxzNIFFzFeRTUaqqLgIse2MlQUXN////6zqFAmwMgVEPNH////9MgwGeQm4AAAoAMcn////////////SRSLoywAgzA1IFhDSMFkAHBkZonQkBIABiw/////wmBtr////1GIW3Iir///+yB9jEbgIXw6Dqv////QGZAzrA0C4AMz////////////6aBNgUEADdRwEwTwGlCiUCLlxMDhBQQAAZu/////wYJs1////9AmxZpJt////UcRSSJkDHEW1Jv//7UkSvDOFJRLUKraLkJMe2M1QVXEVlEtZqqmuAjJ8ZSVBRc////WRIDF1MAAgBky////////////1LOHSOD+gP8Ad+KI6LQbWBZ0LaVjVZAAYsP////6g/EDV////5kF+B3N////WWVLYrgDOQ4M87f///9AZEDBvEAKADJl////////////2c0K42AcFwXCwIgWKTFpBqAhqlI7TVASAAYsP////8QQc0////6zAMhDYf///+gUDdljUAwbgUomh////6YsQFIKwADAGOT/////tSRLcM4VlEtRKqouQk56ZTVBVcRXkS0kqqi4CEHxzNIFFz/////////qWYFMTwBGuBwWAguOeIaBa4JOSB88sDGZ/////hRglp////5iFuxov////nDVIyFpAw8UR6Xkf////QE+gLTDICgAxyf///////////9JFIujLACDMDUgWENIwWQAcGRmidCUABiw/////rD+UdX////mYX5He3///9ZZUiiTwAzgOCPO3////cW4DCvTUAABcAGZ////////////9NAmwKCABuo4D/+1JEvwzhXkS2Goqa4CQHtjJUFFzFURLSKraLkIue2M1QVXGYJ4DShRKBFy4mBhiAgAAxAf////4Ok+f////0SaFID03///9RYTrJgDDmBPibf////HkDDJDYIAZMv///////////9Szh0jg/oD/AHfiiOi0G1gWdC2lY1WUBIABiw/////wmhvr////1mAW2Ign////dI1SMhqghfjpOL////+NoDPsTVwAABQAZMv///////////+zmhXGwDguC4WBECxSYtINQENUpHaQIAP/7UkTGjOFeRLSSqqLgJGfGUlQUXMU9EtAKqouAjB6ZTVBVcQGJb/////Hgd1////2SLorcbL////1nUkUSHAcKCHGr/////IQD942YMAY5P///////////+pZgUxPAEa4HBYCC454hoFrgk5IHzywUMIAAGID/////DAbZC////+oph1Tf////USidy4BvIJIfb////1EmB9eauAAAKADHJ////////////0kUi6MsAIMwNSBYQ0jBZABwZGaJ0JEAGOz////+oEMh////+xsI//tSRM6M4VhEtIqtouAi58czSBRcxX0S1mqqi4CLHtjJUFFzICZN////nTzmQp4AFkUGYLV////1jgA5hokmC4AMz////////////6aBNgUEADdRwEwTwGlCiUCLlxMDFBCAABm7/////A4WY4/////OCJIf///6yykiiQ4ADAySP////1F8BnZ4AAgBky////////////1LOHSOD+gP8Ad+KI6LQbWBZ0LaVjVYQAZov////7EcBgdZxX///9nLQXmDAAfb///84LosmRWGCFH/+1JE1ozhYEU0kqqi4CTHtjNUFVxFYRTUSqprkIyfGUlQUXOMDAwQpadv///6imMYDpyMI84FABky////////////7OaFcbAOC4LhYEQLFJi0gJKgIAeGPC0j6LJggtUQAEAAGJb/////DMTci////86GvMf///9Z1B1DrAwykWNBP////1FEAq0WnAAMAY5P///////////+pZgUxPAEa4HBYCC454hoFrgk5IHzywkAyef////1hFLu7f///3YrhtocGef///9EolY1JkP8Bv/7UkTdjOFdRTWaqprgJOemU1QVXEVxFM4qtouAhB8czSBRcyPQfMTKS////9RmLOA9S0hWAoAMVX////////////opF0gQCEIH4FCilAZgDsHwCgQlEc4ipeZCeFFAABmv////6weRb47zX///9aRiIYfH////rJwMQ4dEJGUX/////RAvmAQGJk////////////Vplwc8QoDaYGJlYB8I1gYcAQNoAHA4BgFkEL4GJgAAyJf////3HCGtp3////ZMigYCECO3///6yVQWgMuB//tSROWM4U5EthqHmuAkB7YyVBRcxqUWxiq2q4CmH9jNUFVzsHIKByomz////1GYnYDjSSTYCgAzpf///////////0kjEyI0awW1ANYAGmTqF0h5BEDwDlMF7RkiImx56hQBiw/////wmBtr////1FELbkRV////ZA+xiNwEL4dB1X////oDMgZ1gaAAACgAyZf///////////9nNCuNgHBcFwsCIFikxaQagIapSO0hCAGOz////+oD4UtF////6aBAwviKO3///9RKF1IvDGj/+1JE5Y3hXkU1Gqqi4CRnxlJUFFzGPRTKSsKLgJqfmc1QUXIaF6FySeRf////picgM9TNwwBky////////////1qMygQ8PwAX8gd2MGKxc4byBMQHbHgrmgZVMwAAY7P////6gYhs0H////pGI6gKBBpI////1kqpbETA1wUKBy07f///9ATiBi7BgAAAuADJf////////////SRJoCA0AMgPJwnANkLDEwzJFi6kQgMnn////9AQIIR5Ur////TJgB4gRom3///6BQN2Oh/AM//7UkTnjOFWRLmabWrkKSel4VgVXEZdFMxKtouAqh+YDVBVcDyC6gvoJq////0w34Az+dUQGJk////////////Vplwc8QoDaYGJlYB8I1gYcAQNoAHA4BgFkEL4GgZPP////6IgYQr1f///9IxAeJElS////pFI1NiaD8QMzzC+pNIpf///9AONAE/F5EAAAcAGTL////////////Us4dI4P6A/wB34ojotBtYBcYEQEWIiJWPNoBiw/////rD+UdX////mYX5He3///9ZZUiiT//tSROUN4VVEtIqqouQkx7YzVBVcRh0Szmq2i4CXnxjJUFFzwAzgOCPO3////cW4DCvTUCgAyZf///////////9nNCuNgHBcFwsCIFikxaQagIapSO01BEAAABkS/////rDWkT02////RSLoywWICTN////USibJiuAamQCIAT6Cf////YQ0DUYCeRA4AFABmW//9/////////+tRmUBnwvwASpwNAmQG4xKYLAUCSIDtjwVzQMASAAYsP////8Job6////9ZgFtiIJ////3SNX/+1JE6A3hhUSzkq2i4CNH1yNMFFyGSRTKSraLgKIel4VgVXEjIaoIX46Ti/////jaAz7E1cGOT////////////pIpF0ZYAQZgakCwhpGCyADgyM0ToSoccQAAGJb/////Hgdw9X///1qSRLwuUVuNl////5iL0mkUSHAcKCHGr/////IQD942YBAYmT///////////9WmXBzxCgNpgYmVgHwjWBhwBA2gAcDgDhGMwX0AxAAZPP////6gIQOLMX////1FMEipB0P///6h+M1Hxf/7UkTnDeGCRTKCraLgKOfWM1QUXEVNEtIqtouAi57YzVBVccgHBWAsUJM0dv///9Qo4HjhjtGBgDELf///////////0kjEpEaLUDQBgCt4DWaJCyYeQLBcCReEakSKpsrVEAGOz////+oEMh////+xsIICZN////nTzmQp4AFkUGYLV////1jgA5hokmAAAFABky////////////7OaFcbAOC4LhYEQLFJi0g1AQ1SkdpBk8/////oAagpHq////6ywEJQmF////1kaXjUmRCI//tSROoM8aRFMxqwouAqx8YTVBVcRYEU0kqqi4CEnplBUFVxDTZgs0TqSP///+s4OeB8R42VggBnS////////////1nDMhgr4IAAAKwQNKnYGw4fOCwNAscBDx4LZ5IqAAY8MAABkBamdBamZ67/otndPcM0/v///sWy1////zi7sF5jedv////oAynBj5amdBNVv////////7v/uyalmQN6gMTCWLiB4QAAQFBrUc5+YaoaSjnaW5XGFBQTorVHEssI1a4MBkMmWOR2zjerZxv/+1JE6gzhjEU1Gqqa4CoHteFYFVzGPRLKKraLmKcfF8lgVXHdcZ1uuM7rbKti43rOPrecfWsZ+9WzjW64zS8V83JMI6gXJ7bNNbrjP3q2M63rGcb3W2abisRmiHKtwjRSoGOCg1qNnfmGqGkn52lrVxA4kMDQhSgnJlaOTLHJmqGrWPuuM03W2b6tXF9Wrmm62zTeq4zTdbZpq1cX1auKbraWk8WFJeaNBkhzRnzW8c1ScwyQAyVipT0OYJlBZUURYkOCaREEhpKh+sbMAwICPv/7UkTkjeFcRTOKraLgJMe2M1QVXEYhEsoKtouIo58YCVBVcwy5QQKhl1nFW4sLsxUW/ULCuKijcWFf//6gkLipkACw////////+LM/iragkLitYqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tSROWI8WJEt8qFkuAcR4bQUBRcDPkY4MwN64mKnluBgb1xqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+1Jkso/xRAosAYYZIBLgBhIAAlwAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg=='; // end of track
	
		var embedAudioElement = document.getElementsByName('embedAudioElement');
		if (embedAudioElement.length > 0)
		{
			// remove any same element if found
			document.body.removeChild(embedAudioElement[0]);
			embedAudioElement = null;
		}

		embedAudioElement = document.createElement('audio');
		embedAudioElement.setAttribute('id', "embedAudioElement");
		embedAudioElement.setAttribute('name', "embedAudioElement");
		embedAudioElement.setAttribute('autoplay', "autoplay");
		embedAudioElement.setAttribute('loop', "loop");
		embedAudioElement.setAttribute('src', AUDIO_DATA);
		document.body.appendChild(embedAudioElement);
		
		AUDIO_DATA = null;
		embedAudioElement = null;
		
		if (browser == "opera")
		{
			// since opera cannot loop the king reward music, then we play it again.
			window.setTimeout(function () { playKingRewardSound() }, 214000);
		}
		
		browser = null;
	}
}

function stopKingRewardSound()
{
	var embedAudioElement = document.getElementsByName('embedAudioElement');
	if (embedAudioElement.length > 0)
	{
		// direct remove the element from source to stop the sound
		document.body.removeChild(embedAudioElement[0]);
		embedAudioElement = null;
	}
}

function kingRewardCountdownTimer()
{
	var dateNow = new Date();
	var intervalTime = timeElapsed(lastDateRecorded, dateNow);
	lastDateRecorded = null;
	lastDateRecorded = dateNow;
	dateNow = null;

	if (reloadKingReward)
	{
		kingPauseTime -= intervalTime;
	}
	
	if (lastKingRewardSumTime != -1)
	{
		lastKingRewardSumTime += intervalTime;
	}
	
	intervalTime = null;
	
	if (kingPauseTime <= 0)
	{
		// update timer
		displayTimer("King's Reward - Reloading...", "Reloading...", "Reloading...");
		
		// back to camp
		gotoCamp(true);
	}
	else
	{
		if (reloadKingReward)
		{
			// update timer
			displayTimer("King's Reward - Reload in " + timeformat(kingPauseTime), 
				"Reloading in " + timeformat(kingPauseTime), 
				"Reloading in " + timeformat(kingPauseTime));
		}
			
		// set king reward sum time
		displayKingRewardSumTime(timeFormatLong(lastKingRewardSumTime));
		
		if (!checkResumeButton())
		{
			window.setTimeout(function () { (kingRewardCountdownTimer)() }, timerRefreshInterval * 1000);
		}
	}	
}

function checkResumeButton()
{
	var found = false;
	
	var linkElementList = document.getElementsByClassName('mousehuntPage-puzzle-form-complete-button');
	if (linkElementList)
	{
		fireEvent(linkElementList[0], 'click');
		linkElementList = null;

		// reload url if click fail
		window.setTimeout(function () { reloadWithMessage("Fail to click on resume button. Reloading...", false); }, 6000);
					
		// recheck if the resume button is click because some time even the url reload also fail
		window.setTimeout(function () { checkResumeButton(); }, 10000);
		
		found = true;
	}
	linkElementList = null;
	
	try 
	{
		return (found);
	} 
	finally 
	{
		found = null;
	}
}

// ################################################################################################
//   King's Reward Function - End
// ################################################################################################



// ################################################################################################
//   Trap Check Function - Start
// ################################################################################################

function trapCheck()
{
	// update timer
	displayTimer("Checking The Trap...", "Checking trap now...", "Checking trap now...");
	
	// back to camp
	gotoCamp(true);

	// reload the data
	retrieveData();

	// trap check now do not refresh the whole page
	// must call back count down timer
	window.setTimeout(function () { countdownTimer() }, timerRefreshInterval * 1000);
}

// ################################################################################################
//   Trap Check Function - End
// ################################################################################################


// ################################################################################################
//   General Function - Start
// ################################################################################################

function browserDetection()
{
	var browserName = "unknown";

	var userAgentStr = navigator.userAgent.toString().toLowerCase();
	if (userAgentStr.indexOf("firefox") >= 0)
	{
		browserName = "firefox";
	}
	else if (userAgentStr.indexOf("opera") >= 0)
	{
		browserName = "opera";
	}
	else if (userAgentStr.indexOf("chrome") >= 0)
	{
		browserName = "chrome";
	}
	userAgentStr = null;
	
	try
	{
		return (browserName);
	}
	finally
	{
		browserName = null;
	}
}

function setStorage(name, value)
{
	// check if the web browser support HTML5 storage
	if ('localStorage' in window && window['localStorage'] !== null)
	{
		window.localStorage.setItem(name, value);
	}
	
	name = undefined;
	value = undefined;
}

function removeStorage(name)
{
	// check if the web browser support HTML5 storage
	if ('localStorage' in window && window['localStorage'] !== null)
	{
		window.localStorage.removeItem(name);
	}
	name = undefined;
}

function getStorage(name)
{
	// check if the web browser support HTML5 storage
	if ('localStorage' in window && window['localStorage'] !== null)
	{
		return (window.localStorage.getItem(name));
	}
	name = undefined;
}

function getCookie(c_name)
{
	if (document.cookie.length > 0)
	{
		var c_start = document.cookie.indexOf(c_name + "=");
		if (c_start != -1)
		{
			c_start = c_start + c_name.length + 1;
			var c_end = document.cookie.indexOf(";", c_start);
			if (c_end == -1) 
			{
				c_end = document.cookie.length;
			}
			
			var cookieString = unescape(document.cookie.substring(c_start, c_end));
			
			// clean up
			c_name = null;
			c_start = null;
			c_end = null;
			
			try
			{
				return cookieString;
			}
			finally
			{
				cookieString = null;
			}
		}
		c_start = null;
	}
	c_name = null;
	return null;
}

function fireEvent(element, event)
{
	if (document.createEventObject)
	{
		// dispatch for IE
		var evt = document.createEventObject();

		try 
		{
			return element.fireEvent('on' + event, evt);
		} 
		finally 
		{
			element = null;
			event = null;
			evt = null;
		}
	}
	else
	{
		// dispatch for firefox + others
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(event, true, true ); // event type,bubbling,cancelable
		
		try 
		{
			return !element.dispatchEvent(evt);
		} 
		finally 
		{
			element = null;
			event = null;
			evt = null;
		}
	}
}

function getPageVariableForChrome(variableName)
{
	// google chrome only
	var scriptElement = document.createElement("script");
	scriptElement.setAttribute('id', "scriptElement");
	scriptElement.setAttribute('type', "text/javascript");
	scriptElement.innerHTML = "document.getElementById('scriptElement').innerText=" + variableName + ";";
	document.body.appendChild(scriptElement);
	
	var value = scriptElement.innerHTML;
	document.body.removeChild(scriptElement);
	scriptElement = null;
	variableName = null;
	
	try 
	{
		return (value);
	} 
	finally 
	{
		value = null;
	}
}

function timeElapsed(dateA, dateB)
{
	var elapsed = 0;

	var secondA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate(), dateA.getHours(), dateA.getMinutes() , dateA.getSeconds());
	var secondB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate(), dateB.getHours(), dateB.getMinutes() , dateB.getSeconds());
	elapsed = (secondB - secondA) / 1000;
	
	secondA = null;
	secondB = null;
	dateA = null;
	dateB = null;
	
	try
	{
		return (elapsed);
	}
	finally
	{
		elapsed = null;
	}
}

function timeformat(time)
{
	var timeString;
	var hr = Math.floor(time / 3600);
	var min = Math.floor((time % 3600) / 60);
	var sec = (time % 3600 % 60) % 60;
	
	if (hr > 0)
	{
		timeString = hr.toString() + " hr " + min.toString() + " min " + sec.toString() + " sec";
	}
	else if (min > 0)
	{
		timeString = min.toString() + " min " + sec.toString() + " sec";
	}
	else
	{
		timeString = sec.toString() + " sec";
	}
	
	time = null;
	hr = null;
	min = null;
	sec = null;
	
	try 
	{
		return (timeString);
	} 
	finally 
	{
		timeString = null;
	}
}

function timeFormatLong(time)
{
	var timeString;
	
	if (time != -1)
	{
		var day = Math.floor(time / 86400);
		var hr = Math.floor((time % 86400) / 3600);
		var min = Math.floor((time % 3600) / 60);
		
		if (day > 0)
		{
			timeString = day.toString() + " day " + hr.toString() + " hr " + min.toString() + " min ago";
		}
		else if (hr > 0)
		{
			timeString = hr.toString() + " hr " + min.toString() + " min ago";
		}
		else if (min > 0)
		{
			timeString = min.toString() + " min ago";
		}
		
		day = null;
		hr = null;
		min = null;
	}
	else
	{
		timeString = null;
	}
	
	time = null;
	
	try 
	{
		return (timeString);
	} 
	finally 
	{
		timeString = null;
	}
}

// ################################################################################################
//   General Function - End
// ################################################################################################