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

			// Style header buttons using the same ID pattern as Neo: this.getId() + "--Head-<suffix>"
			// B1 = week display button (disable it like Neo does), B2 = year button (style only)
			var monthId = this.getId() + "--Head-B1";
			var monthEl = document.getElementById(monthId);
			if (monthEl) {
				monthEl.disabled = true;
				monthEl.setAttribute('style', 'font-weight: bold; font-size:100%;width:30rem;');
			}

			var yearId = this.getId() + "--Head-B2";
			var yearEl = document.getElementById(yearId);
			if (yearEl) {
				yearEl.setAttribute('style', 'font-weight: bold; font-size:100%;');
			}

			var prevId = this.getId() + "--Head-prev";
			var prevEl = document.getElementById(prevId);
			if (prevEl) {
				prevEl.setAttribute('style', 'font-weight: bold; font-size:1.5rem;');
			}

			var nextId = this.getId() + "--Head-next";
			var nextEl = document.getElementById(nextId);
			if (nextEl) {
				nextEl.setAttribute('style', 'font-weight: bold; font-size:1.5rem;');
			}

			// If we have pending data from an OData call that arrived before rendering,
			// apply it now that the DOM is ready.
			if (this._pendingTextValues) {
				var pending = this._pendingTextValues;
				this._pendingTextValues = null;
				this._applyTextValues(pending.sThat, pending.sThis, pending.oDateArr);
			}
		},

		_findDayElement: function(calDomRef, year, month, day) {
			// Build the YYYYMMDD string for the data-sap-day attribute
			var sDay = year + ("0" + month).slice(-2) + ("0" + day).slice(-2);

			// Method 1: Use data-sap-day attribute (works across UI5 versions 1.38+)
			var el = calDomRef.querySelector('.sapUiCalItem[data-sap-day="' + sDay + '"]');
			if (el) {
				return el;
			}

			// Method 2: Fallback to old ID-based lookup
			var oCtrId = this.getId();
			var divId = oCtrId + "--Month0-" + sDay;
			el = document.getElementById(divId);
			return el;
		},

		setNewTextValues: function(sThat, sThis, oDateArr) {
			this._pendingTextValues = {
				sThat: sThat,
				sThis: sThis,
				oDateArr: oDateArr
			};

			var self = this;
			setTimeout(function() {
				self._tryApplyTextValues();
			}, 0);
			setTimeout(function() {
				self._tryApplyTextValues();
			}, 200);
			setTimeout(function() {
				self._tryApplyTextValues();
			}, 500);
		},

		_tryApplyTextValues: function() {
			if (!this._pendingTextValues) {
				return;
			}
			var pending = this._pendingTextValues;

			// Check if the calendar DOM is ready
			var calDomRef = pending.sThis.getDomRef();
			if (!calDomRef) {
				return; // DOM not ready yet, will retry
			}

			// Check if at least one day cell exists
			var testEl = calDomRef.querySelector('.sapUiCalItem[data-sap-day]');
			if (!testEl) {
				// Fallback: try old ID pattern
				var oCurrDate = pending.sThis.getStartDate();
				var weekStart = this.getSunday(oCurrDate);
				var oCurrYear = weekStart.getFullYear();
				var currMonth = ("0" + (weekStart.getMonth() + 1)).slice(-2);
				var sDate = ("0" + weekStart.getDate()).slice(-2);
				var testId = pending.sThis.getId() + "--Month0-" + oCurrYear + currMonth + sDate;
				testEl = document.getElementById(testId);
				if (!testEl) {
					return; // DOM not ready yet, will retry
				}
			}

			this._pendingTextValues = null;
			this._applyTextValues(pending.sThat, pending.sThis, pending.oDateArr);
		},

		_applyTextValues: function(sThat, sThis, oDateArr) {
			var oCurrDate = sThis.getStartDate();
			var weekStart = this.getSunday(oCurrDate);
			this.setStartDate(weekStart);

			var calDomRef = sThis.getDomRef();
			if (!calDomRef) {
				return;
			}

			for (var index = 0; index < 7; index++) {
				var bDate = false;
				var day = weekStart.getDate() + index;
				var sCalDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), day);
				var currMonth = sCalDate.getMonth() + 1;
				var oCurrYear = sCalDate.getFullYear();
				var divEl = this._findDayElement(calDomRef, oCurrYear, currMonth, sCalDate.getDate());
				if (!divEl) {
					continue;
				}
				var $div = jQuery(divEl);
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
			// Use the same ID pattern as Neo: this.getId() + "--Head-B1"
			var titleDom = document.getElementById(sThat.getId() + "--Head-B1");
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
			jQuery(titleDom).text(displayText);
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
