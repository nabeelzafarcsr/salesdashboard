sap.ui.define([
	"sap/ui/unified/CalendarDateInterval"
], function(oCalendar) {
	"use strict";

	return sap.ui.unified.CalendarDateInterval.extend("com.csr.salesdashboardsalesdashboard.model.CalendarWeek", {

		metadata: {
			properties: {
				text1: {
					type: "string"
				},
				text2: {
					type: "string"
				},
				text3: {
					type: "string"
				}
			},
			events: {
				pressNextWeek: {
					enablePreventDefault: true
				},
				pressPreWeek: {
					enablePreventDefault: true
				}
			}
		},

		renderer: function(oRm, oControl) {
			sap.ui.unified.CalendarDateIntervalRenderer.render(oRm, oControl);
		},

		onAfterRendering: function() {
			if (oCalendar.prototype.onAfterRendering) {
				oCalendar.prototype.onAfterRendering.apply(this);
			}
			var sThat = this;
			//this.setNewTextValues(this);
			var oHeader = this.getAggregation("header");
			oHeader.attachPressNext(function(oEvent) {
				sThat.firePressNextWeek(oEvent);
			});
			oHeader.attachPressPrevious(function(oEvent) {
				sThat.firePressPreWeek(oEvent);
			});

			var monthId = this.getId() + "--Head-B1";
			$('#' + monthId)[0].disabled = true;
			$('#' + monthId)[0].setAttribute('style', 'font-weight: bold; font-size:100%;width:30rem;');
			
			var yearId = this.getId() + "--Head-B2";
			$('#' + yearId)[0].setAttribute('style', 'font-weight: bold; font-size:100%;');

			var preMonthButton = this.getId() + "--Head-prev";
			$('#' + preMonthButton)[0].setAttribute('style', 'font-weight: bold; font-size:1.5rem;');

			var nextMonthButton = this.getId() + "--Head-next";
			$('#' + nextMonthButton)[0].setAttribute('style', 'font-weight: bold; font-size:1.5rem;');

		},
		setNewTextValues: function(sThat, sThis, oDateArr) {
			var oCtrId = sThis.getId();
			var oCurrDate = sThis.getStartDate();
			var weekStart = this.getSunday(oCurrDate);
			// this.setMonthText(this,weekStart);
			this.setStartDate(weekStart);
			var oCurrYear = oCurrDate.getFullYear();
			var currMonth = ("0" + (oCurrDate.getMonth() + 1)).slice(-2);
			for (var index = 0; index < 7; index++) {
				var bDate = false;
				//var sCalDate = new Date(weekStart.getTime() + (index * 24 * 60 * 60 * 1000));
				var day = weekStart.getDate() + index;
				var sCalDate = 	new Date(weekStart.getFullYear(),weekStart.getMonth(),day);
				currMonth = ("0" + (sCalDate.getMonth() + 1)).slice(-2);
				oCurrYear = sCalDate.getFullYear();
				var sDate = ("0" + sCalDate.getDate()).slice(-2);
				var divId = oCtrId + "--Month0" + "-" + oCurrYear + currMonth + sDate;
				$('#' + divId).children(':eq(0)').addClass('lineHeightForNum');
				//var sCalDate = new Date(weekStart.getTime() + (index * 24 * 60 * 60 * 1000)); //new Date(oCurrDate);
				if (oDateArr && oDateArr.length) {
					for (var dIndex = 0; dIndex < oDateArr.length; dIndex++) {
						var rDate = oDateArr[dIndex].StartDate;
						rDate = new Date(rDate.getUTCFullYear(),rDate.getUTCMonth(),rDate.getUTCDate(),rDate.getUTCHours(),rDate.getUTCMinutes(),
							rDate.getUTCSeconds()); 
						if (sCalDate.getDate() === rDate.getDate()) {
							var revenue = sThat.formatter.formatNumericValues(oDateArr[dIndex].Revenue);
							var count = sThat.formatter.formatCount(oDateArr[dIndex].Count);
							
							bDate = true;
							var commStartNode = "<span class='sapUiCalItemText calendarBlockFont'>";
							var revenueV = "Revenue: " + revenue;
							var commEndNode = "</span>";
							var gpV = "Margin: " + oDateArr[dIndex].Margin;
							var countV = "Count: " + count;
							var jsText = commStartNode + revenueV + commEndNode + commStartNode + gpV + commEndNode + commStartNode + countV + commEndNode;
							$('#' + divId).children(':eq(0)').after(jsText);
							$('#' + divId).removeClass("disabledbutton");
							var totalSpan = $('#' + divId).children().length;
							if (totalSpan > 4) {
								$('#' + divId).children(':eq(4)').remove('span');
								$('#' + divId).children(':eq(4)').remove('span');
								$('#' + divId).children(':eq(4)').remove('span');
							}
							break;
						}
					}
				}
				if (!bDate) {
					var commStartNode1 = "<span class='sapUiCalItemText calendarBlockFont'>";
					var revenueV1 = "- ";
					var commEndNode1 = "</span>";
					var gpV1 = " -";
					var countV1 = " -";
					var jsText1 = commStartNode1 + revenueV1 + commEndNode1 + commStartNode1 + gpV1 + commEndNode1 + commStartNode1 + countV1 +
						commEndNode1;
					//$('#' + divId).children(':eq(0)').addClass('lineHeightForNoData');
					$('#' + divId).children(':eq(0)').after(jsText1);
					$('#' + divId).addClass("disabledbutton");
					var totalSpan = $('#' + divId).children().length;
					if (totalSpan > 4) {
						$('#' + divId).children(':eq(4)').remove('span');
						$('#' + divId).children(':eq(4)').remove('span');
						$('#' + divId).children(':eq(4)').remove('span');
					}
				}
			}
			this.setMonthText(this,weekStart);
		},

		setMonthText: function(sThat, sWeekStDate) {
			var monthId = sThat.getId() + "--Head-B1";
			var titleId = $('#' + monthId)[0].id;
			var sCalDate = new Date(sWeekStDate.getTime() + (6 * 24 * 60 * 60 * 1000));
			var monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];
			
			var datepostFix = null;
			if(sWeekStDate.getDate() === 1){
				datepostFix ="st ";
			}else if(sWeekStDate.getDate() === 2){
				datepostFix ="nd ";
			}else if(sWeekStDate.getDate() === 3){
				datepostFix ="rd ";
			}else{
				datepostFix ="th ";
			}

			var endDatepostFix = null;
			if(sCalDate.getDate() === 1){
				endDatepostFix ="st ";
			}else if(sCalDate.getDate() === 2){
				endDatepostFix ="nd ";
			}else if(sCalDate.getDate() === 3){
				endDatepostFix ="rd ";
			}else{
				endDatepostFix ="th ";
			}
			
			var startDate = sWeekStDate.getDate()+datepostFix + monthNames[sWeekStDate.getMonth()];
			var endDate = sCalDate.getDate()+endDatepostFix+ monthNames[sCalDate.getMonth()];
			
			var displayText = startDate + " to " + endDate;
			$("#" + titleId).text(displayText);
		},

		getSunday: function(fromDate) {
			// length of one day i milliseconds
			var dayLength = 24 * 60 * 60 * 1000;
			// Get the current date (without time)
			var currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
			// Get the current date's millisecond for this week
			var currentWeekDayMillisecond = ((currentDate.getDay()) * dayLength);
			// subtract the current date with the current date's millisecond for this week
			var sunday = new Date(currentDate.getTime() - currentWeekDayMillisecond); //for Monday: + dayLength etc.
			if (sunday > currentDate) {
				// It is sunday, so we need to go back further
				sunday = new Date(sunday.getTime() - (dayLength * 7));
			}
			return sunday;
		}
	});

});