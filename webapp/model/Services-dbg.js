sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Filter, FilterOperator) {
	"use strict";

	return {
		getCalendarMonthReport: function(sThat, sDate, fuSuccess) {
			var oViewModel = sThat.getView().getModel("calViewMW");
			oViewModel.setProperty("/busy", true);
			var firstDay = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
			var fromDate = new Date();
			fromDate.setUTCFullYear(firstDay.getFullYear());
			fromDate.setUTCMonth(firstDay.getMonth());
			fromDate.setUTCDate(firstDay.getDate());
			fromDate.setUTCHours(0, 0, 0, 0);

			var lastDay = new Date(sDate.getFullYear(), sDate.getMonth() + 1, 0);
			var toDate = new Date();
			toDate.setUTCFullYear(lastDay.getFullYear());
			toDate.setUTCMonth(lastDay.getMonth());
			toDate.setUTCDate(lastDay.getDate());
			toDate.setUTCHours(23, 59, 59, 59);

			var oModel = sThat.getView().getModel();
			console.log("[Services] getCalendarMonthReport - serviceUrl:", oModel.sServiceUrl);
			console.log("[Services] getCalendarMonthReport - fromDate:", fromDate.toISOString(), "toDate:", toDate.toISOString());
			var oFilters = [(new Filter("StartDate", FilterOperator.EQ, fromDate)), (new Filter("EndDate", FilterOperator.EQ, toDate))];
			oModel.read("/ReportWeeklySet", {
				filters: oFilters,
				success: function(data, sResp) {
					console.log("[Services] getCalendarMonthReport SUCCESS - results:", data.results ? data.results.length : 0);
					if (data.results && data.results.length > 0) {
						console.log("[Services] first result sample:", JSON.stringify(data.results[0]).substring(0, 200));
					}
					if (fuSuccess) {
						oViewModel.setProperty("/busy", false);
						fuSuccess(data, sResp, sThat,firstDay);
					}
				},
				error: function(oError) {
					oViewModel.setProperty("/busy", false);
					console.error("[Services] getCalendarMonthReport OData error:", JSON.stringify(oError));
				}
			});
		},

		getCalendarWeekReport: function(sThat, sDate, fuSuccess) {
			var oViewModel = sThat.getView().getModel("calViewMW");
			oViewModel.setProperty("/busy", true);
			var firstWeekDay = this.getSunday(sDate);
			var lastWeekDay = new Date(firstWeekDay.getFullYear(), firstWeekDay.getMonth(), firstWeekDay.getDate() + 6);
			// var first = sDate.getDate() - sDate.getDay(); // First day is the day of the month - the day of the week
			// var last = first + 6;
			var firstday = new Date(firstWeekDay);
			var lastday = lastWeekDay;

			var fromDate = new Date();
			fromDate.setUTCFullYear(firstday.getFullYear());
			fromDate.setUTCMonth(firstday.getMonth());
			fromDate.setUTCDate(firstday.getDate());
			fromDate.setUTCHours(0, 0, 0, 0);

			var toDate = new Date();
			toDate.setUTCFullYear(lastday.getFullYear());
			toDate.setUTCMonth(lastday.getMonth());
			toDate.setUTCDate(lastday.getDate());
			toDate.setUTCHours(23, 59, 59, 59);

			var oModel = sThat.getView().getModel();
			var oFilters = [(new Filter("StartDate", FilterOperator.EQ, fromDate)), (new Filter("EndDate", FilterOperator.EQ, toDate))];
			oModel.read("/ReportWeeklySet", {

				filters: oFilters,
				success: function(data, sResp) {
					if (fuSuccess) {
						oViewModel.setProperty("/busy", false);
						fuSuccess(data, sResp, sThat, sDate);
					}
				},
				error: function(oError) {
					oViewModel.setProperty("/busy", false);
					console.error("[Services] getCalendarWeekReport OData error:", JSON.stringify(oError));
				}
			});
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

	};

});