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

			var monthBtn = sap.ui.getCore().byId(oHeader.getId() + "-B1");
			if (monthBtn && typeof monthBtn.setEnabled === "function") {
				monthBtn.setEnabled(false);
				var monthDom = monthBtn.getDomRef();
				if (monthDom) {
					monthDom.setAttribute('style', 'font-weight: bold; font-size:100%;');
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

			var calendarHeaderRef = sap.ui.getCore().byId(this.getId() + "--MP");
			if (calendarHeaderRef) {
				calendarHeaderRef.attachPageChange(function(oEvent) {
					sThat.firePressPreMonth(oEvent);
				});
			}

		},
		setNewTextValues: function(sThat, sThis, oDateArr, oDate) {
			var firstDay;
			var oCtrId = sThis.getId();
			if (oDate) {
				firstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
			}

			var oCurrDate = firstDay ? firstDay : sThis.getStartDate();
			var oCurrYear = oCurrDate.getFullYear();
			var currMonth = ("0" + (oCurrDate.getMonth() + 1)).slice(-2);
			var daysInMonth = new Date(oCurrYear, currMonth, 0).getDate();

			for (var index = 0; index < daysInMonth; index++) {
				var bDate = false;
				var sDate = ("0" + (index + 1)).slice(-2);
				var divId = oCtrId + "--Month0" + "-" + oCurrYear + currMonth + sDate;
				var $div = $('#' + divId);
				if ($div.length === 0) {
					continue;
				}
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

		}
	});

});
