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
			//this.setNewTextValues(this, null);
			var oHeader = this.getAggregation("header");
			oHeader.attachPressNext(function(oEvent) {
				sThat.firePressNextMonth(oEvent);

			});
			oHeader.attachPressPrevious(function(oEvent) {
				sThat.firePressPreMonth(oEvent);
			});

			var monthId = sap.ui.getCore().byId(oHeader.getId() + "-B1");
			if (monthId && typeof monthId.setEnabled === "function") {
				$(monthId)[0].setEnabled(false);
				$(monthId)[0].setAttribute('style', 'font-weight: bold; font-size:100%;');
			}
			
			var yearId =  sap.ui.getCore().byId(oHeader.getId() + "-B2");
			if (yearId && typeof yearId.setEnabled === "function") {
$(yearId)[0].setEnabled(false);
			$(yearId)[0].setAttribute('style', 'font-weight: bold; font-size:100%;');
			}

			var preMonthButton = sap.ui.getCore().byId(oHeader.getId() + "-prev");
			if (preMonthButton && typeof preMonthButton.setEnabled === "function") {
				$(preMonthButton)[0].setEnabled(false);
			$(preMonthButton)[0].setAttribute('style', 'font-weight: bold; font-size:1.5rem;');
			}

			var nextMonthButton =  sap.ui.getCore().byId(oHeader.getId() + "-next");
			if (nextMonthButton && typeof nextMonthButton.setEnabled === "function") {
				$(nextMonthButton)[0].setEnabled(false);
			$(nextMonthButton)[0].setAttribute('style', 'font-weight: bold; font-size:1.5rem;');
			}

			var calendarHeaderRef = sap.ui.getCore().byId(this.getId() + "--MP");
			if (calendarHeaderRef) {
			calendarHeaderRef.attachPageChange(function(oEvent) {
				sThat.firePressPreMonth(oEvent);
			});
		}

		},
		setNewTextValues: function(sThat, sThis, oDateArr,oDate) {
			var firstDay ;
			var oCtrId = sThis.getId();
			if(oDate){
				firstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
			}
			
			var oCurrDate = firstDay ? firstDay:sThis.getStartDate();
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
				$divId.children(':eq(0)').addClass('lineHeightForNum');
				//var sCalDate = new Date(oCurrDate.getTime() + (index * 24 * 60 * 60 * 1000)); //new Date(oCurrDate);
				var day = oCurrDate.getDate() + index;
				var sCalDate = 	new Date(oCurrDate.getFullYear(),oCurrDate.getMonth(),day);
				if (oDateArr && oDateArr.length) {
					for (var dIndex = 0; dIndex < oDateArr.length; dIndex++) {
						//var rDate = new Date(oDateArr[dIndex].StartDate);
						var rDate = oDateArr[dIndex].StartDate;
						rDate = new Date(rDate.getUTCFullYear(),rDate.getUTCMonth(),rDate.getUTCDate(),rDate.getUTCHours(),rDate.getUTCMinutes(),
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
							$divId.children(':eq(0)').after(jsText);
							$divId.removeClass("disabledbutton");
							var totalSpan = $divId.children().length;
							if (totalSpan > 4) {
								$divId.children(':eq(4)').remove('span');
								$divId.children(':eq(4)').remove('span');
								$divId.children(':eq(4)').remove('span');
							}
							break;
						}
						//break;
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
					$divId.children(':eq(0)').after(jsText1);
				    $divId.addClass("disabledbutton");
					var totalSpan1 = $divId.children().length;
					if (totalSpan1 > 4) {
						$divId.children(':eq(4)').remove('span');
								$divId.children(':eq(4)').remove('span');
								$divId.children(':eq(4)').remove('span');
					}
				}

			}

		}
	});

});