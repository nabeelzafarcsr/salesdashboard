sap.ui.define([
	"sap/ui/unified/Calendar"
], function(oCalendar) {
	"use strict";

	return sap.ui.unified.Calendar.extend("com.csr.salesdashboardsalesdashboard.model.CalendarMonth", {

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
				pressNextMonth: {
					enablePreventDefault: true
				},
				pressPreMonth: {
					enablePreventDefault: true
				}

			}
		},
		renderer: function(oRm, oControl) {
			sap.ui.unified.CalendarRenderer.render(oRm, oControl);
		},

		_createMonth: function(sId) {
			// Override parent's _createMonth to set _renderMonthWeeksOnly before first render.
			// This tells the Month control to only render weeks containing current month days
			// (5 rows max) instead of always showing 6 rows. Matches Neo UI5 1.71 behavior.
			var oMonth = oCalendar.prototype._createMonth.apply(this, arguments);
			oMonth.setProperty("_renderMonthWeeksOnly", true);
			return oMonth;
		},

		onBeforeRendering: function() {
			if (oCalendar.prototype.onBeforeRendering) {
				oCalendar.prototype.onBeforeRendering.apply(this);
			}
			// Re-apply _renderMonthWeeksOnly after parent's onBeforeRendering
			// (parent resets it to false for single-month calendars)
			var aMonths = this.getAggregation("month");
			if (aMonths) {
				for (var i = 0; i < aMonths.length; i++) {
					aMonths[i].setProperty("_renderMonthWeeksOnly", true);
				}
			}
		},

		onAfterRendering: function() {
			if (oCalendar.prototype.onAfterRendering) {
				oCalendar.prototype.onAfterRendering.apply(this);
			}
			var sThat = this;
			var oHeader = this.getAggregation("header");
			oHeader.attachPressNext(function(oEvent) {
				sThat.firePressNextMonth(oEvent);
			});
			oHeader.attachPressPrevious(function(oEvent) {
				sThat.firePressPreMonth(oEvent);
			});

			// Style header buttons using the same ID pattern as Neo: this.getId() + "--Head-<suffix>"
			// B1 = month button (disable it like Neo does), B2 = year button (style only, keep enabled)
			var monthId = this.getId() + "--Head-B1";
			var monthEl = document.getElementById(monthId);
			if (monthEl) {
				monthEl.setAttribute('style', 'font-weight: bold; font-size:100%;');
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

			var calendarHeaderRef = sap.ui.getCore().byId(this.getId() + "--MP");
			if (calendarHeaderRef) {
				calendarHeaderRef.attachPageChange(function(oEvent) {
					sThat.firePressPreMonth(oEvent);
				});
			}

			// Hide week number column and adjust grid layout
			this._hideWeekNumbers();

			// DOM fallback: hide 6th week row if all cells are from other months
			this._hideExtraWeekRow();

			// Re-apply text values after re-render. Pending data takes priority,
			// otherwise re-apply last successfully applied data (handles view switches
			// where UI5 re-renders the calendar and destroys injected spans).
			if (this._pendingTextValues) {
				var pending = this._pendingTextValues;
				this._pendingTextValues = null;
				this._applyTextValues(pending.sThat, pending.sThis, pending.oDateArr, pending.oDate);
			} else if (this._lastAppliedData) {
				var last = this._lastAppliedData;
				this._applyTextValues(last.sThat, last.sThis, last.oDateArr, last.oDate);
			}
		},

		_hideWeekNumbers: function() {
			var calDomRef = this.getDomRef();
			if (!calDomRef) {
				return;
			}

			var weekNums = calDomRef.querySelectorAll('.sapUiCalWeekNum');
			if (weekNums.length === 0) {
				return;
			}

			// Find the parent container of the week number elements to check its layout
			var parent = weekNums[0].parentElement;
			if (parent) {
				var parentStyle = window.getComputedStyle(parent);
				var gridCols = parentStyle.gridTemplateColumns;

				if (gridCols && gridCols !== 'none') {
					// Parent uses CSS grid. Remove the first column (week number)
					// and set to 7 equal columns
					var colValues = gridCols.split(/\s+/);
					console.log("[CalendarMonth] Grid columns before:", colValues.length, gridCols);
					if (colValues.length >= 8) {
						// Remove first column (week number), keep remaining 7
						colValues.shift();
						parent.style.gridTemplateColumns = colValues.join(' ');
						console.log("[CalendarMonth] Grid columns after:", colValues.join(' '));
					}
				}
			}

			// Hide all week number elements
			for (var i = 0; i < weekNums.length; i++) {
				weekNums[i].style.display = 'none';
			}
		},

		_hideExtraWeekRow: function() {
			var calDomRef = this.getDomRef();
			if (!calDomRef) {
				return;
			}
			var allCells = calDomRef.querySelectorAll('.sapUiCalItem');
			if (allCells.length <= 35) {
				return; // 5 rows or fewer, nothing to hide
			}
			// Check if the last 7 cells (6th row) are ALL from other months
			var lastRowStart = allCells.length - 7;
			var allOtherMonth = true;
			for (var i = lastRowStart; i < allCells.length; i++) {
				if (!allCells[i].classList.contains('sapUiCalItemOtherMonth')) {
					allOtherMonth = false;
					break;
				}
			}
			if (allOtherMonth) {
				for (var j = lastRowStart; j < allCells.length; j++) {
					allCells[j].style.display = 'none';
				}
			}
		},

		setNewTextValues: function(sThat, sThis, oDateArr, oDate) {
			// Store the data and try to apply it.
			// If the DOM isn't ready yet, store as pending and it will be applied in onAfterRendering.
			this._pendingTextValues = {
				sThat: sThat,
				sThis: sThis,
				oDateArr: oDateArr,
				oDate: oDate
			};

			var self = this;
			// Try immediately, then retry after short delays to handle async rendering
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

		_tryApplyTextValues: function() {
			if (!this._pendingTextValues) {
				return; // Already applied
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
				var oDate = pending.oDate;
				var firstDay;
				if (oDate) {
					firstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
				}
				var oCurrDate = firstDay ? firstDay : pending.sThis.getStartDate();
				var oCurrYear = oCurrDate.getFullYear();
				var currMonth = ("0" + (oCurrDate.getMonth() + 1)).slice(-2);
				var testId = pending.sThis.getId() + "--Month0-" + oCurrYear + currMonth + "01";
				testEl = document.getElementById(testId);
				if (!testEl) {
					return; // DOM not ready yet, will retry
				}
			}

			this._pendingTextValues = null;
			this._applyTextValues(pending.sThat, pending.sThis, pending.oDateArr, pending.oDate);
		},

		_applyTextValues: function(sThat, sThis, oDateArr, oDate) {
			var firstDay;
			if (oDate) {
				firstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
			}

			var oCurrDate = firstDay ? firstDay : sThis.getStartDate();
			var oCurrYear = oCurrDate.getFullYear();
			var oCurrMonth = oCurrDate.getMonth() + 1;
			var daysInMonth = new Date(oCurrYear, oCurrMonth, 0).getDate();

			var calDomRef = sThis.getDomRef();
			console.log("[CalendarMonth] _applyTextValues: days=" + daysInMonth + ", dataRows=" + (oDateArr ? oDateArr.length : 0) + ", hasDomRef=" + !!calDomRef);

			if (!calDomRef) {
				console.log("[CalendarMonth] No DOM ref - calendar not rendered yet");
				return;
			}

			// Store for re-application after re-renders (e.g. view switches)
			this._lastAppliedData = {
				sThat: sThat,
				sThis: sThis,
				oDateArr: oDateArr,
				oDate: oDate
			};

			var foundCount = 0;
			var missedCount = 0;
			for (var index = 0; index < daysInMonth; index++) {
				var bDate = false;
				var dayNum = index + 1;
				var divEl = this._findDayElement(calDomRef, oCurrYear, oCurrMonth, dayNum);
				if (!divEl) {
					missedCount++;
					continue;
				}
				foundCount++;
				var $div = jQuery(divEl);

				// Clear any previously injected spans before adding new ones
				$div.children('.calendarBlockFont').remove();

				$div.children(':eq(0)').addClass('lineHeightForNum');
				var day = oCurrDate.getDate() + index;
				var sCalDate = new Date(oCurrDate.getFullYear(), oCurrDate.getMonth(), day);
				if (oDateArr && oDateArr.length) {
					for (var dIndex = 0; dIndex < oDateArr.length; dIndex++) {
						var rDate = oDateArr[dIndex].StartDate;
						rDate = new Date(rDate.getUTCFullYear(), rDate.getUTCMonth(), rDate.getUTCDate(), rDate.getUTCHours(), rDate.getUTCMinutes(),
							rDate.getUTCSeconds());
						if (sCalDate.getDate() === rDate.getDate()) {
							bDate = true;
							var revenue = sThat.formatter.formatNumericValues(oDateArr[dIndex].Revenue);
							var count = sThat.formatter.formatCount(oDateArr[dIndex].Count);
							var commStartNode = "<span class='sapUiCalItemText calendarBlockFont'>";
							var revenueV = "Revenue: " + revenue;
							var commEndNode = "</span>";
							var gpV = "Margin: " + oDateArr[dIndex].Margin;
							var countV = "Count: " + count;
							var jsText = commStartNode + revenueV + commEndNode + commStartNode + gpV + commEndNode + commStartNode + countV + commEndNode;
							$div.children(':eq(0)').after(jsText);
							$div.removeClass("disabledbutton");
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
				}

			}
			console.log("[CalendarMonth] _applyTextValues done: found=" + foundCount + ", missed=" + missedCount);

		}
	});

});
