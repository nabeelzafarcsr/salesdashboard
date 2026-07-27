sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		
		displayDateForChart:function(value){
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy"
				});
				var sDate = new Date(value);
				var monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];
				var sdate = ("0" + sDate.getDate()).slice(-2);
				var dateStr = sdate+" " + monthNames[sDate.getMonth()];
				return dateStr;
			} else {
				return value;
			}
		},
		dateFormatting: function(value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy"
				});
				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}
		},
		
		formatOdataTime: function(time) {
			if (time) {
				var sDate = new Date(time.ms);
				var hour = sDate.getUTCHours(),
					mins = sDate.getUTCMinutes();
					
					if (hour <10 ) {
						hour = "0" + hour;
					}
					if (mins < 10) {
						mins = "0" + mins;
					}
				var thistime = hour+':'+ mins;//(hour > 12) ? (hour - 12 + ':' + mins + ' PM') : (hour + ':' + mins + ' AM');
				return thistime;
			}
			return "";
		},
		formatNumericValues: function (value) {
			if (value) {
				value = parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2});
				//value = parseFloat(value).toFixed(2);
				return value;
			}
			return "0.00";
		},
		formatCount: function (value) {
			if (value) {
				value = parseInt(value,10).toLocaleString();
				//value = parseInt(value, 10);
				return value;
			}
			return "0";
		},
		displayDayRevenue: function (revenue, waerk) {
			if (revenue) {
				revenue = parseFloat(revenue).toLocaleString(undefined, {minimumFractionDigits: 2});
			}
			return [revenue, waerk].join(" ");
		}
	};

});