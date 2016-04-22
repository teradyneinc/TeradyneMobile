//Copyright Teradyne Inc. 2016
//Author: Corbin Champion

var timeoutReference = null; //this keeps track of whether we have a setTimout that has not yet expired for recalculating formulas
var timeout2Reference = null; //this keeps track of whether we have a setTimout that has not yet expired for recalculating formulas
var lastElement = null; //the last element what was updated
var lastScenario = 1; //the scenarios that the last element belongs to
var numScenarios = 8; //the number of scenarios 
var costOfTestEn = 0;

//check if the entry is valid
function validateElement(element) {
    if (element.attr('type') == "number") {
        element.removeClass("error");
        if (element[0].validity.valid == false) {
            element.addClass("error");
        } else if (element.attr('id').match("^depreciationTime")) {
            var depreciationTimeStr = element.val();
            if (depreciationTimeStr != "") {
                var depreciationTime = parseFloat(depreciationTimeStr);
                if (isNaN(depreciationTime) || (depreciationTime < 1)) {
                    element.addClass("error");
                }
            }
        } else if (element.attr('id').match("^efficiency")) {
            var efficiencyStr = element.val();
            if (efficiencyStr != "") {
                var efficiency = parseFloat(efficiencyStr);
                if (isNaN(efficiency) || (efficiency > 100) || (efficiency < 0)) {
                    element.addClass("error");
                }
            }
        } else if (element.attr('id').match("^siteCount")) {
            var siteCountStr = element.val();
            if (siteCountStr != "") {
                var siteCount = parseFloat(siteCountStr);
                if (isNaN(siteCount) || (siteCount <= 0)) {
                    element.addClass("error");
                }
            }
        } else if (element.attr('id').match("^yield")) {
            var yieldStr = element.val();
            if (yieldStr != "") {
                var yield = parseFloat(yieldStr);
                if (isNaN(yield) || (yield > 100) || (yield <= 0)) {
                    element.addClass("error");
                }
            }
        } else if (element.attr('id').match("^utilization")) {
            var utilizationStr = element.val();
            if (utilizationStr != "") {
                var utilization = parseFloat(utilizationStr);
                if (isNaN(utilization) || (utilization > 100) || (utilization < 0)) {
                    element.addClass("error");
                }
            }
        } else {
            var otherStr = element.val();
            if (otherStr != "") {
                var other = parseFloat(otherStr);
                if (isNaN(other) || (other < 0)) {
                    element.addClass("error");
                }
            }
        }
    }
    element.closest("td").removeClass("dollarLabel");
    element.closest("div.ui-input-text").removeClass("dollarLabel");
    if ((element.hasClass("dollar") == true) && (element.hasClass("error") == false) && (element.val() != "")) {
        element.closest("td").addClass("dollarLabel");
        element.closest("div.ui-input-text").addClass("dollarLabel");
    }
    element.closest("td").removeClass("percentLabel");
    element.closest("div.ui-input-text").removeClass("percentLabel");
    if ((element.hasClass("percent") == true) && (element.hasClass("error") == false) && (element.val() != "")) {
        element.closest("td").addClass("percentLabel");
        element.closest("div.ui-input-text").addClass("percentLabel");
    }
}

function updateScenario(scenario) {

    var systemCost = 0;
    var manipulatorCost = 0;
    var handlerCost = 0;
    var fixtureCost = 0;
    var totalCost = 0;
    var totalCostValid = 0;
    var depreciationTime = 0;
    var yearlyCost = 0;
    var yearlyCostValid = 0;
    var deviceVolume = 0;
    var testTime = 0;
    var efficiency = 0;
    var siteCount = 0;
    var totalTestTime = 0;
    var totalTestTimeValid = 0;
    var yield = 0;
    var handlerTime = 0;
    var effectiveTotalTestTime = 0;
    var effectiveTotalTestTimeValid = 0;
    var utilization = 0;
    var availableTime = 0;
    var availableTimeValid = 0;
    var effectiveUtilization = 0;
    var effectiveUtilizationValid = 0;
    var devicesPerHour = 0;
    var devicesPerHourValid = 0;
    var goodPerHour = 0;
    var goodPerHourValid = 0;
    var badPerHour = 0;
    var badPerHourValid = 0;
    var operatingCosts = 0;
    var operatingCostPerHour = 0;
    var operatingCostPerHourValid = 0;
    var testCellCostPerHour = 0;
    var testCellCostPerHourValid = 0;
    var enteredHourlyRate = 0;
    var costPerGood = 0;
    var costPerGoodValid = 0;
    var goodPerMonth = 0;
    var goodPerMonthValid = 0;
    var cellsPerMonth = 0;
    var cellsPerMonthValid = 0;
    var totalCapital = 0;
    var totalCapitalValid = 0;
    var overallCost = 0;
    var overallCostValid = 0;
    var hourlyRate = 0;
    var hourlyRateValid = 0;

    var systemCostStr = $("#systemCost" + scenario).val();
    var manipulatorCostStr = $("#manipulatorCost" + scenario).val();
    var handlerCostStr = $("#handlerCost" + scenario).val();
    var fixtureCostStr = $("#fixtureCost" + scenario).val();
    var depreciationTimeStr = $("#depreciationTime" + scenario).val();
    var deviceVolumeStr = $("#deviceVolume" + scenario).val();
    var testTimeStr = $("#testTime" + scenario).val();
    var efficiencyStr = $("#efficiency" + scenario).val();
    var siteCountStr = $("#siteCount" + scenario).val();
    var yieldStr = $("#yield" + scenario).val();
    var handlerTimeStr = $("#handlerTime" + scenario).val();
    var utilizationStr = $("#utilization" + scenario).val();
    var operatingCostsStr = $("#operatingCosts" + scenario).val();
    var enteredHourlyRateStr = $("#enteredHourlyRate" + scenario).val();

    if (systemCostStr != "") {
        systemCost = parseFloat(systemCostStr);
    }

    if (manipulatorCostStr != "") {
        manipulatorCost = parseFloat(manipulatorCostStr);
    }

    if (handlerCostStr != "") {
        handlerCost = parseFloat(handlerCostStr);
    }

    if (fixtureCostStr != "") {
        fixtureCost = parseFloat(fixtureCostStr);
    }

    $("#totalCost" + scenario).removeClass("error");
    $("#totalCost" + scenario).children("span:first").html("-");
    if ($("#systemCost" + scenario).hasClass("error") || $("#manipulatorCost" + scenario).hasClass("error") || $("#handlerCost" + scenario).hasClass("error") || $("#fixtureCost" + scenario).hasClass("error")) {
        $("#totalCost" + scenario).children("span:first").html("Invalid Input");
        $("#totalCost" + scenario).addClass("error");
    } else if ((systemCostStr != "") || (manipulatorCostStr != "") || (fixtureCostStr != "")) {
        totalCostValid = 1;
        totalCost = systemCost + manipulatorCost + handlerCost + fixtureCost;
        $("#totalCost" + scenario).children("span:first").html("$" + totalCost.toFixed(0));
    }

    if (depreciationTimeStr != "") {
        depreciationTime = parseFloat(depreciationTimeStr);
    }

    $("#yearlyCost" + scenario).removeClass("error");
    $("#yearlyCost" + scenario).children("span:first").html("-");
    if ($("#totalCost" + scenario).hasClass("error") || $("#depreciationTime" + scenario).hasClass("error")) {
        $("#yearlyCost" + scenario).children("span:first").html("Invalid Input");
        $("#yearlyCost" + scenario).addClass("error");
    } else if ((totalCostValid == 1) && (depreciationTimeStr != "")) {
        yearlyCostValid = 1;
        yearlyCost = totalCost / depreciationTime;
        $("#yearlyCost" + scenario).children("span:first").html("$" + yearlyCost.toFixed(0));
    }

    if (deviceVolumeStr != "") {
        deviceVolume = parseFloat(deviceVolumeStr);
    }

    if (testTimeStr != "") {
        testTime = parseFloat(testTimeStr);
    }

    if (efficiencyStr != "") {
        efficiency = parseFloat(efficiencyStr) / 100;
    }

    if (siteCountStr != "") {
        siteCount = parseFloat(siteCountStr);
    }

    $("#totalTestTime" + scenario).removeClass("error");
    $("#totalTestTime" + scenario).children("span:first").html("-");
    if ($("#testTime" + scenario).hasClass("error") || $("#efficiency" + scenario).hasClass("error") || $("#siteCount" + scenario).hasClass("error")) {
        $("#totalTestTime" + scenario).children("span:first").html("Invalid Input");
        $("#totalTestTime" + scenario).addClass("error");
    } else if ((testTimeStr != "") && (efficiencyStr != "") && (siteCountStr != "")) {
        totalTestTimeValid = 1;
        totalTestTime = ((1 - efficiency) * (testTime * (siteCount - 1))) + testTime;
        $("#totalTestTime" + scenario).children("span:first").html(totalTestTime.toFixed(3));
    }

    if (yieldStr != "") {
        yield = parseFloat(yieldStr) / 100;
    }

    if (handlerTimeStr != "") {
        handlerTime = parseFloat(handlerTimeStr);
    }

    $("#effectiveTotalTestTime" + scenario).removeClass("error");
    $("#effectiveTotalTestTime" + scenario).children("span:first").html("-");
    if ($("#totalTestTime" + scenario).hasClass("error") || $("#handlerTime" + scenario).hasClass("error")) {
        $("#effectiveTotalTestTime" + scenario).children("span:first").html("Invalid Input");
        $("#effectiveTotalTestTime" + scenario).addClass("error");
    } else if ((totalTestTimeValid == 1) || (handlerTimeStr != "")) {
        effectiveTotalTestTimeValid = 1;
        effectiveTotalTestTime = totalTestTime + handlerTime;
        $("#effectiveTotalTestTime" + scenario).children("span:first").html(effectiveTotalTestTime.toFixed(3));
    }

    if (utilizationStr != "") {
        utilization = parseFloat(utilizationStr) / 100;
    }

    $("#availableTime" + scenario).removeClass("error");
    $("#availableTime" + scenario).children("span:first").html("-");
    if ($("#utilization" + scenario).hasClass("error")) {
        $("#availableTime" + scenario).children("span:first").html("Invalid Input");
        $("#availableTime" + scenario).addClass("error");
    } else if (utilizationStr != "") {
        availableTimeValid = 1;
        availableTime = 8 * 21 * utilization;
        $("#availableTime" + scenario).children("span:first").html(availableTime.toFixed(0));
    }

    $("#effectiveUtilization" + scenario).removeClass("error");
    $("#effectiveUtilization" + scenario).children("span:first").html("-");
    if ($("#availableTime" + scenario).hasClass("error")) {
        $("#effectiveUtilization" + scenario).children("span:first").html("Invalid Input");
        $("#effectiveUtilization" + scenario).addClass("error");
    } else if (availableTimeValid == 1) {
        effectiveUtilizationValid = 1;
        effectiveUtilization = availableTime / (7 * 24);
        $("#effectiveUtilization" + scenario).children("span:first").html((effectiveUtilization * 100).toFixed(0) + "%");
    }

    $("#devicesPerHour" + scenario).removeClass("error");
    $("#devicesPerHour" + scenario).children("span:first").html("-");
    if ($("#effectiveTotalTestTime" + scenario).hasClass("error") || $("#siteCount" + scenario).hasClass("error")) {
        $("#devicesPerHour" + scenario).children("span:first").html("Invalid Input");
        $("#devicesPerHour" + scenario).addClass("error");
    } else if ((effectiveTotalTestTimeValid == 1) && (effectiveTotalTestTime > 0) && (siteCountStr != "")) {
        devicesPerHourValid = 1;
        devicesPerHour = 3600 / (effectiveTotalTestTime / siteCount);
        $("#devicesPerHour" + scenario).children("span:first").html(devicesPerHour.toFixed(0));
    }

    $("#goodPerHour" + scenario).removeClass("error");
    $("#goodPerHour" + scenario).children("span:first").html("-");
    if ($("#devicesPerHour" + scenario).hasClass("error") || $("#yield" + scenario).hasClass("error")) {
        $("#goodPerHour" + scenario).children("span:first").html("Invalid Input");
        $("#goodPerHour" + scenario).addClass("error");
    } else if ((devicesPerHourValid == 1) && (yieldStr != "")) {
        goodPerHourValid = 1;
        goodPerHour = devicesPerHour * yield;
        $("#goodPerHour" + scenario).children("span:first").html(goodPerHour.toFixed(0));
    }

    $("#badPerHour" + scenario).removeClass("error");
    $("#badPerHour" + scenario).children("span:first").html("-");
    if ($("#devicesPerHour" + scenario).hasClass("error") || $("#yield" + scenario).hasClass("error")) {
        $("#badPerHour" + scenario).children("span:first").html("Invalid Input");
        $("#badPerHour" + scenario).addClass("error");
    } else if ((devicesPerHourValid == 1) && (yieldStr != "")) {
        badPerHourValid = 1;
        badPerHour = devicesPerHour * (1 - yield);
        $("#badPerHour" + scenario).children("span:first").html(badPerHour.toFixed(0));
    }

    if (operatingCostsStr != "") {
        operatingCosts = parseFloat(operatingCostsStr);
    }

    $("#operatingCostPerHour" + scenario).removeClass("error");
    $("#operatingCostPerHour" + scenario).children("span:first").html("-");
    if ($("#utilization" + scenario).hasClass("error") || $("#operatingCosts" + scenario).hasClass("error")) {
        $("#operatingCostPerHour" + scenario).children("span:first").html("Invalid Input");
        $("#operatingCostPerHour" + scenario).addClass("error");
    } else if ((utilizationStr != "") && (operatingCostsStr != "") && (utilization > 0)) {
        operatingCostPerHourValid = 1;
        operatingCostPerHour = operatingCosts / utilization;
        $("#operatingCostPerHour" + scenario).children("span:first").html("$" + operatingCostPerHour.toFixed(2));
    }

    $("#testCellCostPerHour" + scenario).removeClass("error");
    $("#testCellCostPerHour" + scenario).children("span:first").html("-");
    if ($("#availableTime" + scenario).hasClass("error") || $("#yearlyCost" + scenario).hasClass("error")) {
        $("#testCellCostPerHour" + scenario).children("span:first").html("Invalid Input");
        $("#testCellCostPerHour" + scenario).addClass("error");
    } else if ((availableTimeValid == 1) && (yearlyCostValid == 1) && (availableTime > 0)) {
        testCellCostPerHourValid = 1;
        testCellCostPerHour = yearlyCost / (availableTime * 365 / 7);
        $("#testCellCostPerHour" + scenario).children("span:first").html("$" + testCellCostPerHour.toFixed(2));
    }

    $("#hourlyRate" + scenario).removeClass("error");
    $("#hourlyRate" + scenario).children("span:first").html("-");
    if ($("#testCellCostPerHour" + scenario).hasClass("error") || $("#operatingCostPerHour" + scenario).hasClass("error")) {
        $("#hourlyRate" + scenario).children("span:first").html("Invalid Input");
        $("#hourlyRate" + scenario).addClass("error");
    } else if ((testCellCostPerHourValid == 1) || (operatingCostPerHourValid == 1)) {
        hourlyRateValid = 1;
        hourlyRate = testCellCostPerHour + operatingCostPerHour;
        $("#hourlyRate" + scenario).children("span:first").html("$" + hourlyRate.toFixed(2));
    }

    if (enteredHourlyRateStr != "") {
        enteredHourlyRate = parseFloat(enteredHourlyRateStr);
    }

    $("#costPerGood" + scenario).removeClass("error");
    $("#costPerGood" + scenario).children("span:first").html("-");
    if ($("#goodPerHour" + scenario).hasClass("error") || $("#hourlyRate" + scenario).hasClass("error") || $("#enteredHourlyRate" + scenario).hasClass("error")) {
        $("#costPerGood" + scenario).children("span:first").html("Invalid Input");
        $("#costPerGood" + scenario).addClass("error");
    } else if (((hourlyRateValid == 1) || (enteredHourlyRateStr != "")) && (goodPerHourValid == 1)) {
        costPerGoodValid = 1;
        if (enteredHourlyRateStr != "") {
            costPerGood = enteredHourlyRate / goodPerHour;
        } else {
            costPerGood = hourlyRate / goodPerHour;
        }
        $("#costPerGood" + scenario).children("span:first").html("$" + costPerGood.toFixed(4));
    }

    $("#goodPerMonth" + scenario).removeClass("error");
    $("#goodPerMonth" + scenario).children("span:first").html("-");
    if ($("#availableTime" + scenario).hasClass("error") || $("#goodPerHour" + scenario).hasClass("error")) {
        $("#goodPerMonth" + scenario).children("span:first").html("Invalid Input");
        $("#goodPerMonth" + scenario).addClass("error");
    } else if ((availableTimeValid == 1) && (goodPerHourValid == 1)) {
        goodPerMonthValid = 1;
        goodPerMonth = goodPerHour * availableTime * 52.14 / 12;
        $("#goodPerMonth" + scenario).children("span:first").html(goodPerMonth.toFixed(0));
    }

    $("#cellsPerMonth" + scenario).removeClass("error");
    $("#cellsPerMonth" + scenario).children("span:first").html("-");
    if ($("#deviceVolume" + scenario).hasClass("error") || $("#goodPerMonth" + scenario).hasClass("error")) {
        $("#cellsPerMonth" + scenario).children("span:first").html("Invalid Input");
        $("#cellsPerMonth" + scenario).addClass("error");
    } else if ((deviceVolumeStr != "") && (goodPerMonthValid == 1) && (goodPerMonth > 0)) {
        cellsPerMonthValid = 1;
        cellsPerMonth = deviceVolume / goodPerMonth;
        $("#cellsPerMonth" + scenario).children("span:first").html(cellsPerMonth.toFixed(1));
    }

    $("#totalCapital" + scenario).removeClass("error");
    $("#totalCapital" + scenario).children("span:first").html("-");
    if ($("#totalCost" + scenario).hasClass("error") || $("#cellsPerMonth" + scenario).hasClass("error")) {
        $("#totalCapital" + scenario).children("span:first").html("Invalid Input");
        $("#totalCapital" + scenario).addClass("error");
    } else if ((totalCostValid == 1) && (cellsPerMonthValid == 1)) {
        totalCapitalValid = 1;
        totalCapital = cellsPerMonth * totalCost;
        $("#totalCapital" + scenario).children("span:first").html("$" + totalCapital.toFixed(0));
    }

    $("#overallCost" + scenario).removeClass("error");
    $("#overallCost" + scenario).children("span:first").html("-");
    if ($("#costPerGood" + scenario).hasClass("error")) {
        $("#overallCost" + scenario).children("span:first").html("Invalid Input");
        $("#overallCost" + scenario).addClass("error");
    } else if (costPerGoodValid == 1) {
        overallCostValid = 1;
        overallCost = costPerGood;
        $("#overallCost" + scenario).children("span:first").html("$" + costPerGood.toFixed(4));
    }

}

function saveElement(element) {
    localStorage.setItem(element.attr('id'), element.val());
}

function restoreScenario(scenario) {
    if (localStorage.getItem("name" + scenario) != null) {
        $('#name' + scenario).val(localStorage.getItem("name" + scenario));
    }
    if (localStorage.getItem("flow" + scenario) != null) {
        $('#flow' + scenario).val(localStorage.getItem("flow" + scenario));
    }
    if (localStorage.getItem("device" + scenario) != null) {
        $('#device' + scenario).val(localStorage.getItem("device" + scenario));
    }
    if (localStorage.getItem("tester" + scenario) != null) {
        $('#tester' + scenario).val(localStorage.getItem("tester" + scenario));
    }
    if (localStorage.getItem("systemCost" + scenario) != null) {
        $('#systemCost' + scenario).val(localStorage.getItem("systemCost" + scenario));
    }
    validateElement($('#systemCost' + scenario));
    if (localStorage.getItem("manipulatorCost" + scenario) != null) {
        $('#manipulatorCost' + scenario).val(localStorage.getItem("manipulatorCost" + scenario));
    }
    validateElement($('#manipulatorCost' + scenario));
    if (localStorage.getItem("handlerCost" + scenario) != null) {
        $('#handlerCost' + scenario).val(localStorage.getItem("handlerCost" + scenario));
    }
    validateElement($('#handlerCost' + scenario));
    if (localStorage.getItem("fixtureCost" + scenario) != null) {
        $('#fixtureCost' + scenario).val(localStorage.getItem("fixtureCost" + scenario));
    }
    validateElement($('#fixtureCost' + scenario));
    if (localStorage.getItem("depreciationTime" + scenario) != null) {
        $('#depreciationTime' + scenario).val(localStorage.getItem("depreciationTime" + scenario));
    }
    validateElement($('#depreciationTime' + scenario));
    if (localStorage.getItem("deviceVolume" + scenario) != null) {
        $('#deviceVolume' + scenario).val(localStorage.getItem("deviceVolume" + scenario));
    }
    validateElement($('#deviceVolume' + scenario));
    if (localStorage.getItem("testTime" + scenario) != null) {
        $('#testTime' + scenario).val(localStorage.getItem("testTime" + scenario));
    }
    validateElement($('#testTime' + scenario));
    if (localStorage.getItem("efficiency" + scenario) != null) {
        $('#efficiency' + scenario).val(localStorage.getItem("efficiency" + scenario));
    }
    validateElement($('#efficiency' + scenario));
    if (localStorage.getItem("siteCount" + scenario) != null) {
        $('#siteCount' + scenario).val(localStorage.getItem("siteCount" + scenario));
    }
    validateElement($('#siteCount' + scenario));
    if (localStorage.getItem("yield" + scenario) != null) {
        $('#yield' + scenario).val(localStorage.getItem("yield" + scenario));
    }
    validateElement($('#yield' + scenario));
    if (localStorage.getItem("handlerTime" + scenario) != null) {
        $('#handlerTime' + scenario).val(localStorage.getItem("handlerTime" + scenario));
    }
    validateElement($('#handlerTime' + scenario));
    if (localStorage.getItem("utilization" + scenario) != null) {
        $('#utilization' + scenario).val(localStorage.getItem("utilization" + scenario));
    }
    validateElement($('#utilization' + scenario));
    if (localStorage.getItem("operatingCosts" + scenario) != null) {
        $('#operatingCosts' + scenario).val(localStorage.getItem("operatingCosts" + scenario));
    }
    validateElement($('#operatingCosts' + scenario));
    if (localStorage.getItem("enteredHourlyRate" + scenario) != null) {
        $('#enteredHourlyRate' + scenario).val(localStorage.getItem("enteredHourlyRate" + scenario));
    }
    validateElement($('#enteredHourlyRate' + scenario));
}

function doneTyping(scenario, element) {
    if ((scenario != null) && (element != null)) {
        //var start = new Date().getTime();
        lastElement = null;
        validateElement(element);
        updateScenario(scenario);
        saveElement(element);
        //var end = new Date().getTime();
        //var time = end - start;
        //alert('Execution time: ' + time);
    }
}

//if user stops typing for a while or switches their selection update scenario
$(function () {
    $('#costoftest *').on('input', function (event) {
        var timeout = 1e3; //1sec
        lastScenario = event.target.id.substr(event.target.id.length - 1);
        lastElement = $(event.target);
        if (timeoutReference) {
            clearTimeout(timeoutReference);
        }
        timeoutReference = setTimeout(function () {
            doneTyping(lastScenario, lastElement);
        }, timeout);
    });
})

$(function () {
    $('#costoftest *').blur(function (event) {
        var timeout = 1; //1ms
        lastScenario = event.target.id.substr(event.target.id.length - 1);
        lastElement = $(event.target);
        if (timeoutReference) {
            clearTimeout(timeoutReference);
        }
        timeoutReference = setTimeout(function () {
            doneTyping(lastScenario, lastElement);
        }, timeout);
    });
})

//match scroll between divs
$(function () {

    var ignoreScrollLeft = 0;
    var ignoreScrollTop = 0;
    var ignoreScrollMain = 0;

    function mainScrollFunction() {
        if (ignoreScrollMain == 0) {
            ignoreScrollTop = 1;
            ignoreScrollLeft = 1;
            $('#leftTableDiv').scrollTop($('#mainTableDiv').scrollTop());
            $('#topTableDiv').scrollLeft($('#mainTableDiv').scrollLeft());
        } else {
            ignoreScrollMain = 0;
        }
    }

    function leftScrollFunction() {
        if (ignoreScrollLeft == 0) {
            ignoreScrollMain = 1;
            $('#mainTableDiv').scrollTop($('#leftTableDiv').scrollTop());
        } else {
            ignoreScrollLeft = 0;
        }
    }

    function topScrollFunction() {
        if (ignoreScrollTop == 0) {
            ignoreScrollMain = 1;
            $('#mainTableDiv').scrollLeft($('#topTableDiv').scrollLeft());
        } else {
            ignoreScrollTop = 0;
        }
    }

    $('#mainTableDiv').on('scroll', function () {
        mainScrollFunction()
    });
    $('#leftTableDiv').on('scroll', function () {
        leftScrollFunction()
    });
    $('#topTableDiv').on('scroll', function () {
        topScrollFunction()
    });

});

$(function () {
    $('#main').on('pageshow', function(){
        costOfTestEn = 0;
    });
    $('#teradynelinks').on('pageshow', function(){
        costOfTestEn = 0;
    });
    $('#costoftest').on('pageshow', function(){
        var thePlatform = device.platform.toLowerCase();
        if (thePlatform.indexOf("iphone") > -1 ||
            thePlatform.indexOf("ipad") > -1) {
            thePlatform = "ios";
        }
        $('#contentDiv').addClass(thePlatform);
        costOfTestEn = 1;
        for (scenario = 1; scenario <= numScenarios; scenario++) {
            restoreScenario(scenario);
            updateScenario(scenario);
        }
        matchRows(1);
    });
    $('#remotecontrol').on('pageshow', function(){
        costOfTestEn = 0;
	$('#remoteControlInput').focus();
        cordova.plugins.Keyboard.show();
    });
});

var keyboardHeight = 0;
var app = {

    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        window.addEventListener('native.keyboardshow', this.keyboardShowHandler, false);
        window.addEventListener('native.keyboardhide', this.keyboardHideHandler, false);
        window.addEventListener('resize', this.resizeHandler, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        navigator.splashscreen.hide();
        cordova.plugins.Keyboard.disableScroll(true);
        app.receivedEvent('deviceready');
    },
    //resize for keyboard changes
    keyboardShowHandler: function (e) {
        if (costOfTestEn == 1) {
            keyboardHeight = e.keyboardHeight;
            matchRows(0);
        }
    },
    keyboardHideHandler: function (e) {
        StatusBar.hide();
        if (costOfTestEn == 1) {
            matchRows(0);
        }
    },
    //resize for orientation changes
    resizeHandler: function (e) {
        if (costOfTestEn == 1) {
            matchRows(0);
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
    }
}

$('#costoftest input').focus(function (event) {
    scrollIntoView($(this).closest('td').closest('div'), $(this).closest('td'));
});

$('#costoftest input').on('input', function (event) {
    scrollIntoView($(this).closest('td').closest('div'), $(this).closest('td'));
});

function matchRows(firstTime) {
    //adjust height used based on keyboard
    var windowOuterHeight = $(window).outerHeight();
    if (cordova.plugins.Keyboard.isVisible) {
        windowOuterHeight = windowOuterHeight - keyboardHeight;
    }
    //make the contentDiv fill the remaining page space
    $('#contentDiv').height(windowOuterHeight - $('#contentDiv').position().top);
    $('#contentDiv').width($(window).outerWidth() - $('#contentDiv').position().left);
    if (firstTime == 1) {
        //make the topLeftDiv and topDiv have the same height
        if ($('#topLeftTable tr').eq(0).height() > $('#topTable tr').eq(0).height()) {
            $('#topTable tr').eq(0).height($('#topLeftTable tr').eq(0).height());
        } else {
            $('#topLeftTable tr').eq(0).height($('#topTable tr').eq(0).height());
        }
        //make top topLeftTableDiv and topTableDiv match row height
        $('#topLeftTableDiv').height($('#topLeftTable').eq(0).outerHeight());
        $('#topTableDiv').height($('#topTable').eq(0).outerHeight());
        //make leftTableDiv match column width
        $('#leftTableDiv').width($('#leftTable').eq(0).outerWidth());
        //set topTableDiv with respect to topLeftTableDiv
        $('#topTableDiv').css('left', $('#topLeftTableDiv').eq(0).outerWidth() + 'px');
        //set the leftTableDiv with respect to the topLeftTableDiv
        $('#leftTableDiv').css('top', $('#topLeftTableDiv').eq(0).outerHeight() + 'px');
        //set the mainTableDiv with respect to the topLeftTableDiv
        $('#mainTableDiv').css('left', $('#topLeftTableDiv').eq(0).outerWidth() + 'px');
        $('#mainTableDiv').css('top', $('#topLeftTableDiv').eq(0).outerHeight() + 'px');
    }
    //make leftTableDiv and mainTableDiv have the same height = remaining height
    $('#mainTableDiv').height(windowOuterHeight - $('#contentDiv').position().top - $('#topLeftTable tr').eq(0).outerHeight());
    $('#leftTableDiv').height(windowOuterHeight - $('#contentDiv').position().top - $('#topLeftTable tr').eq(0).outerHeight());
    //make topTableDiv and mainTableDiv have the same width = remaining width
    $('#mainTableDiv').width($(window).outerWidth() - $('#contentDiv').position().left - $('#leftTable tr').eq(0).outerWidth());
    $('#topTableDiv').width($(window).outerWidth() - $('#contentDiv').position().left - $('#leftTable tr').eq(0).outerWidth());
    if (firstTime == 1) {
        //match up the row heights
        $('#leftTable tr').each(function (rowCnt) {
            if ($('#leftTable tr').eq(rowCnt).height() > $('#mainTable tr').eq(rowCnt).height()) {
                $('#mainTable tr').eq(rowCnt).height($('#leftTable tr').eq(rowCnt).height());
            } else {
                $('#leftTable tr').eq(rowCnt).height($('#mainTable tr').eq(rowCnt).height());
            }
        });
    }
    if ($(document.activeElement).is('input')) {
        scrollIntoView($(document.activeElement).closest('td').closest('div'), $(document.activeElement).closest('td'));
    }
};

function scrollIntoView(divElem, inputElem) {
    var divTop = 0;
    var divBottom = divTop + divElem.outerHeight();
    var divLeft = 0;
    var divRight = divLeft + divElem.outerWidth();
    var inputTop = inputElem.position().top;
    var inputBottom = inputTop + inputElem.outerHeight();
    var inputLeft = inputElem.position().left;
    var inputRight = inputLeft + inputElem.outerWidth();
    if (inputTop < divTop) { //scroll up
        divElem.scrollTop(divElem.scrollTop() - (divTop - inputTop));
    } else if (inputBottom > divBottom) { //scroll down
        divElem.scrollTop(divElem.scrollTop() + (inputBottom - divBottom));
    }
    if (inputLeft < divLeft) { //scroll left 
        divElem.scrollLeft(divElem.scrollLeft() - (divLeft - inputLeft));
    } else if (inputRight > divRight) { //scroll right
        divElem.scrollLeft(divElem.scrollLeft() + (inputRight - divRight));
    }
}

$("#manipulatorCostTitle").click(function () {
    navigator.notification.alert(
        'Manipulator Cost may already be bundled in the Test System Cost.  If so, leave this blank.', //message
    alertDismissed, // callback
    'Info', // title
    'Dismiss' // buttonName
    );
});
$("#fixtureCostTitle").click(function () {
    navigator.notification.alert(
        'DIB, probe tower, contactors, amortized NRE.', //message
    alertDismissed, // callback
    'Info', // title
    'Dismiss' // buttonName
    );
});
$("#deviceVolumeTitle").click(function () {
    navigator.notification.alert(
        'Volume of devices that are planned to ship per month. This is used to determine the number of systems required for the scenario.', //message
    alertDismissed, // callback
    'Info', // title
    'Dismiss' // buttonName
    );
});
$("#utilizationTitle").click(function () {
    navigator.notification.alert(
        'This parameter can be used as \"the total utilization of the tester is X%\" to include OEE and avaialbility.', //message
    alertDismissed, // callback
    'Info', // title
    'Dismiss' // buttonName
    );
});
$("#operatingCostsTitle").click(function () {
    navigator.notification.alert(
        'Power cost\nFacility cost\nOperator cost\nAnnual contract costs\n\nTo convert costs/year (annual costs) to Costs/hour enter the follwing equation into the cell:\n\n  = # / (365*24)\n\n where: # = the annual cost\n\nTo enter hourly costs and annul costs then enter the following:\n\n   = ## + # / (365*24)\n\nwhere: ## = Hourly cost and # = Annual cost', //message
    alertDismissed, // callback
    'Info', // title
    'Dismiss' // buttonName
    );
});
$("#operatingCostPerHourTitle").click(function () {
    navigator.notification.alert(
        'Based on the effective hours available for testing.', //message
    alertDismissed, // callback
    'Info', // title
    'Dismiss' // buttonName
    );
});
$("#testCellCostPerHourTitle").click(function () {
    navigator.notification.alert(
        'Based on the effective hours available for testing.', //message
    alertDismissed, // callback
    'Info', // title
    'Dismiss' // buttonName
    );
});

function alertDismissed() {}

$(function () {
    FastClick.attach(document.body);
});

$("#remoteControlButton").click(function (e) {
    cordova.InAppBrowser.open('http://' + $('#remoteControlInput').val(), '_blank', 'location=yes');
});
