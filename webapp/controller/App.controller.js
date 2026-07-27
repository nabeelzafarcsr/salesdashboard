sap.ui.define([
    "com/csr/salesdashboardsalesdashboard/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.csr.salesdashboardsalesdashboard.controller.App", {
        onInit: function () {
            // Shell only - the router places SalesDashboardMonth/SalesDashboardDaily
            // pages into idFullWidthAppControl's "pages" aggregation.
        }
    });
});