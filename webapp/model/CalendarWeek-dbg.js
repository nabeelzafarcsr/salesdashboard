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
			var oHeader = this.getAggregation("header");
			oHeader.attachPressNext(function(oEvent) {
				sThat.firePressNextWeek(oEvent);
			});
			oHeader.attachPressPrevious(function(oEvent) {
				sThat.firePressPreWeek(oEvent);
			});

			var monthBtn = sap.ui.getCore().byId(oHeader.getId() + "-B1");
			if (monthBtn && typeof monthBtn.setEnabled === "function") {
				monthBtn.setEnabled(false);
				var monthDom = monthBtn.getDomRef();
				if (monthDom) {
					monthDom.setAttribute('style', 'font-weight: bold; font-size:100%;width:30rem;');
				}
			}

			var yearBtn = sap.ui.getCore().byId(oHeader.getId() + "-B2");
			if (yearBtn && typeof yearBtn.setEnabled === "function") {
				yearBtn.setEnabled(false);
				var yearDom = yearBtn.getDomRef();
				if (yearDom) {
					yearDom.setAttribute('style', 'font-weight: bold; font-size:100%;');
				}
			}

			var preMonthButton = sap.ui.getCore().byId(oHeader.getId() + "-prev");
			if (preMonthButton && typeof preMonthButton.setEnabled === "function") {
				preMonthButton.setEnabled(false);
				var prevDom = preMonthButton.getDomRef();
				if (prevDom) {
					prevDom.setAttribute('style', 'font-weight: bold; font-size:1.5rem;');
				}
			}

			var nextMonthButton = sap.ui.getCore().byId(oHeader.getId() + "-next");
			if (nextMonthButton && typeof nextMonthButton.setEnabled === "function") {
				nextMonthButton.setEnabled(false);
				var nextDom = nextMonthButton.getDomRef();
				if (nextDom) {
					nextDom.setAttribute('style', 'font-weight: bold; font-size:1.5rem;');
				}
			}

		},
		setNewTextValues: function(sThat, sThis, oDateArr) {
			var oCtrId = sThis.getId();
			var oCurrDate = sThis.getStartDate();
			var weekStart = this.getSunday(oCurrDate);
			this.setStartDate(weekStart);
			var oCurrYear = oCurrDate.getFullYear();
			var currMonth = ("0" + (oCurrDate.getMonth() + 1)).slice(-2);
			for (var index = 0; index < 7; index++) {
				var bDate = false;
				var day = weekStart.getDate() + index;
				var sCalDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), day);
				currMonth = ("0" + (sCalDate.getMonth() + 1)).slice(-2);
				oCurrYear = sCalDate.getFullYear();
				var sDate = ("0" + sCalDate.getDate()).slice(-2);
				var divId = oCtrId + "--Month0" + "-" + oCurrYear + currMonth + sDate;
				var $div = $('#' + divId);
				if ($div.length === 0) {
					continue;
				}
				$div.children(':eq(0)').addClass('lineHeightForNum');
				if (oDateArr && oDateArr.length) {
					for (var dIndex = 0; dIndex < oDateArr.length; dIndex++) {
						var rDate = oDateArr[dIndex].StartDate;
						rDate = new Date(rDate.getUTCFullYear(), rDate.getUTCMonth(), rDate.getUTCDate(), rDate.getUTCHours(), rDate.getUTCMinutes(),
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
							$div.children(':eq(0)').after(jsText);
							$div.removeClass("disabledbutton");
							var totalSpan = $div.children().length;
							if (totalSpan > 4) {
								$div.children(':eq(4)').remove('span');
								$div.children(':eq(4)').remove('span');
								$div.children(':eq(4)').remove('span');
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
					$div.children(':eq(0)').after(jsText1);
					$div.addClass("disabledbutton");
					var totalSpan1 = $div.children().length;
					if (totalSpan1 > 4) {
						$div.children(':eq(4)').remove('span');
						$div.children(':eq(4)').remove('span');
						$div.children(':eq(4)').remove('span');
					}
				}
			}
			this.setMonthText(this, weekStart);
		},

		setMonthText: function(sThat, sWeekStDate) {
			var oHeader = sThat.getAggregation("header");
			if (!oHeader) {
				return;
			}
			var monthBtn = sap.ui.getCore().byId(oHeader.getId() + "-B1");
			if (!monthBtn) {
				return;
			}
			var titleDom = monthBtn.getDomRef();
			if (!titleDom) {
				return;
			}

			var sCalDate = new Date(sWeekStDate.getTime() + (6 * 24 * 60 * 60 * 1000));
			var monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];

			var datepostFix = null;
			if (sWeekStDate.getDate() === 1) {
				datepostFix = "st ";
			} else if (sWeekStDate.getDate() === 2) {
				datepostFix = "nd ";
			} else if (sWeekStDate.getDate() === 3) {
				datepostFix = "rd ";
			} else {
				datepostFix = "th ";
			}

			var endDatepostFix = null;
			if (sCalDate.getDate() === 1) {
				endDatepostFix = "st ";
			} else if (sCalDate.getDate() === 2) {
				endDatepostFix = "nd ";
			} else if (sCalDate.getDate() === 3) {
				endDatepostFix = "rd ";
			} else {
				endDatepostFix = "th ";
			}

			var startDate = sWeekStDate.getDate() + datepostFix + monthNames[sWeekStDate.getMonth()];
			var endDate = sCalDate.getDate() + endDatepostFix + monthNames[sCalDate.getMonth()];

			var displayText = startDate + " to " + endDate;
			$(titleDom).text(displayText);
		},

		getSunday: function(fromDate) {
			var dayLength = 24 * 60 * 60 * 1000;
			var currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
			var currentWeekDayMillisecond = ((currentDate.getDay()) * dayLength);
			var sunday = new Date(currentDate.getTime() - currentWeekDayMillisecond);
			if (sunday > currentDate) {
				sunday = new Date(sunday.getTime() - (dayLength * 7));
			}
			return sunday;
		}
	});

});
