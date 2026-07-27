sap.ui.define([
	"com/csr/salesdashboardsalesdashboard/controller/BaseController",
	"com/csr/salesdashboardsalesdashboard/model/Services",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"com/csr/salesdashboardsalesdashboard/model/formatter"
], function(BaseController, Services, JSONModel, Device, formatter) {
	"use strict";

	return BaseController.extend("com.csr.salesdashboardsalesdashboard.controller.SalesDashboardMonth", {
		formatter: formatter,
		onInit: function() {
			var oHeaderModel = this._createHeaderViewModel();
			this.setModel(oHeaderModel, "headerView");
			var oViewModel = this._createViewModel();
			this.setModel(oViewModel, "calViewMW");
			this.getRouter().getRoute("calViewMW").attachPatternMatched(this._onCalendarViewMatched, this);
			this.oCalMonth = null;

		},

		_createViewModel: function() {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				busy: false,
				totalRevenue: "0",
				totalMargin: "0",
				currency: "",
				totalCount: "0"
			});
		},
		_createHeaderViewModel: function() {
			return new JSONModel({
				totalRevenue: "0",
				totalMargin: "0",
				currency: "",
				totalCount: "0"
			});
		},

		_onCalendarViewMatched: function(oEvent) {
			var oCalMonthView = this.getView().byId("calendarM");
			this.oCalMonth = oCalMonthView;
			var startDate = new Date();
			Services.getCalendarMonthReport(this, startDate, this.monthReportSuccess);
		},

		setChartSettings: function(sthat) {
			var oVizFrame = sthat.getView().byId("idMonthVizFrame");
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {

						visible: false
					},
					dataShape: {
						primaryAxis: ["line", "bar", "bar"]
					}
				},
				valueAxis: {

					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: false
				}
			});

			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			//oPopOver.setFormatString(CustomerFormat.FIORI_LABEL_FORMAT_2);

		},
		monthReportSuccess: function(data, resp, sThat, sFirstDate) {
			sThat.oCalMonth.setNewTextValues(sThat,sThat.oCalMonth, data.results, sFirstDate);
			var oModel = sThat.getView().getModel("calViewMW");
			oModel.setProperty("/busy", false);
			sThat.countHeaderData(data);
			sThat.setChartSettings(sThat);
			sThat.chartData = data.results;
		},
		setMonthChartData: function(data, sThat) {
			var i = 0;
			var jsonData = [];
			for (i = 0; i < data.length; i++) {
				data[i].Margin = parseFloat(data[i].Margin);
				jsonData.push(data[i]);

			}
			var chartModel = new sap.ui.model.json.JSONModel();
			chartModel.setData(jsonData);
			var oVizFrame = sThat.getView().byId("idMonthVizFrame");
			oVizFrame.setModel(chartModel, "chartModel");
		},
		countHeaderData: function(data) {
			var sItem = data.results[0];
			if (sItem) {
				var oLocalModel = this.getView().getModel("headerView");
				var totalRevenue = sItem.TotalRevenue;
				var totalCount = sItem.TotalCount;
				
				oLocalModel.setProperty("/totalRevenue", this.formatter.formatNumericValues(totalRevenue));
				oLocalModel.setProperty("/totalMargin", sItem.TotalMargin);
				oLocalModel.setProperty("/currency", sItem.Waerk);
				oLocalModel.setProperty("/totalCount", this.formatter.formatCount(totalCount));
			}

		},

		calnedarViewHandling: function(oEvent) {
			var oButton = oEvent.getSource();
			var oCalMonthView = this.getView().byId("calendarMViewId");
			var oCalWeekView = this.getView().byId("calendarWViewId");
			var oButtonTitle = oEvent.getSource().getText();
			var weekTitle = this.getResourceBundle().getText("weekViewTitle");
			var monthTitle = this.getResourceBundle().getText("monthView");
			var omonthchart = this.getView().byId("monthViewChartId");
			omonthchart.setVisible(false);
			var oChartBtn = this.getView().byId("csrChartViewBtnId");
			oChartBtn.setVisible(true);
			var oHeaderModel = this._createHeaderViewModel();
			this.setModel(oHeaderModel, "headerView");
			if (oButtonTitle === weekTitle) {
				oButton.setText(monthTitle);
				oCalWeekView.setVisible(true);
				oCalMonthView.setVisible(false);
				var oCalWeek = this.getView().byId("calendarWeek");
				this.oCalMonth = oCalWeek;
				Services.getCalendarWeekReport(this, oCalWeek.getStartDate(), this.monthReportSuccess);
			} else if (oButtonTitle === monthTitle) {
				oButton.setText(weekTitle);
				oCalWeekView.setVisible(false);
				oCalMonthView.setVisible(true);
				var oCalMonthV = this.getView().byId("calendarM");
				this.oCalMonth = oCalMonthV;
				Services.getCalendarMonthReport(this, oCalMonthV.getStartDate(), this.monthReportSuccess);
				//Services.getCalendarMonthReport(this, new Date(), this.monthReportSuccess);
			}

		},
		onChartPress: function(oEvent) {
			var weekTitle = this.getResourceBundle().getText("weekViewTitle");
			var monthTitle = this.getResourceBundle().getText("monthView");
			var oChartButton = oEvent.getSource();
			oChartButton.setVisible(false);
			// display chart here 	
			var oCalMonthView = this.getView().byId("calendarMViewId");
			var oCalWeekView = this.getView().byId("calendarWViewId");
			var oCalMonthV = this.getView().byId("calendarM");
			this.oCalMonth = oCalMonthV;
			var omonthchart = this.getView().byId("monthViewChartId");
			omonthchart.setVisible(true);
			var obtn = this.getView().byId("csrWeekViewBtnId");
			if (oCalWeekView.isActive()) {
				obtn.setText(weekTitle);
				Services.getCalendarWeekReport(this, new Date(), this.monthReportSuccess);
			} else if (oCalMonthView.isActive()) {
				obtn.setText(monthTitle);
				Services.getCalendarMonthReport(this, oCalMonthV.getStartDate(), this.monthReportSuccess);
			}
			oCalWeekView.setVisible(false);
			oCalMonthView.setVisible(false);
			this.setMonthChartData(this.chartData, this);
		},

		handleNextMonth: function(oEvent) {
			var oCal = oEvent.getSource();
			this.oCalMonth = oCal;
			this.getEventParameters(oEvent);
		},

		handlePreMonth: function(oEvent) {
			var oCal = oEvent.getSource();
			this.oCalMonth = oCal;
			this.getEventParameters(oEvent);
		},

		handleNextWeek: function(oEvent) {
			var oCal = oEvent.getSource();
			this.oCalMonth = oCal;
			this.getWeekEventParameters(oEvent);
		},

		handlePreWeek: function(oEvent) {
			var oCal = oEvent.getSource();
			this.oCalMonth = oCal;
			this.getWeekEventParameters(oEvent);
		},

		getWeekEventParameters: function(oEvent) {
			var oModel = this.getView().getModel("calViewMW");
			var oHeaderModel = this._createHeaderViewModel();
			oModel.setProperty("/busy", true);
			this.setModel(oHeaderModel, "headerView");
			var evtSource = oEvent.getSource();
			var startDate = evtSource.getStartDate();
			if (!startDate) {
				startDate = new Date();
			}
			Services.getCalendarWeekReport(this, startDate, this.monthReportSuccess);
		},

		getEventParameters: function(oEvent) {
			var oModel = this.getView().getModel("calViewMW");
			var oHeaderModel = this._createHeaderViewModel();
			oModel.setProperty("/busy", true);
			this.setModel(oHeaderModel, "headerView");
			var evtSource = oEvent.getSource();
			var startDate = evtSource.getStartDate();
			if (!startDate) {
				startDate = new Date();
			}
			Services.getCalendarMonthReport(this, startDate, this.monthReportSuccess);
		},

		handleCalendarSelect: function(oEvent) {
			var sModel = this.getView().getModel("utilityDataModel");
			var oSelectedDate = oEvent.getSource().getSelectedDates()[0].getProperty("startDate");
			sModel.setProperty("/selectedDate", oSelectedDate);
			var bReplace = !Device.system.phone;
			this.getRouter().navTo("calViewDay", {
				sSelectedDate: oSelectedDate
			}, bReplace);
		}
	});
});