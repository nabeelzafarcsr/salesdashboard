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

			// Disable month/year buttons and style them - try multiple ID patterns for cross-version compatibility
			this._disableHeaderButton(oHeader, ["-B1", "--B1"], 'font-weight: bold; font-size:100%;');
			this._disableHeaderButton(oHeader, ["-B2", "--B2"], 'font-weight: bold; font-size:100%;');
			this._disableHeaderButton(oHeader, ["-prev", "--prev"], 'font-weight: bold; font-size:1.5rem;');
			this._disableHeaderButton(oHeader, ["-next", "--next"], 'font-weight: bold; font-size:1.5rem;');

			var calendarHeaderRef = sap.ui.getCore().byId(this.getId() + "--MP");
			if (calendarHeaderRef) {
				calendarHeaderRef.attachPageChange(function(oEvent) {
					sThat.firePressPreMonth(oEvent);
				});
			}

			// If we have pending data from an OData call that arrived before rendering,
			// apply it now that the DOM is ready.
			if (this._pendingTextValues) {
				var pending = this._pendingTextValues;
				this._pendingTextValues = null;
				this._applyTextValues(pending.sThat, pending.sThis, pending.oDateArr, pending.oDate);
			}
		},

		_disableHeaderButton: function(oHeader, suffixes, style) {
			var btn;
			for (var i = 0; i < suffixes.length; i++) {
				btn = sap.ui.getCore().byId(oHeader.getId() + suffixes[i]);
				if (btn && typeof btn.setEnabled === "function") {
					btn.setEnabled(false);
					var dom = btn.getDomRef();
					if (dom) {
						dom.setAttribute('style', style);
					}
					return;
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
			console.log("[CalendarMonth] _applyTextValues done: found=" + foundCount + ", missed=" + missedCount);

		}
	});

});
