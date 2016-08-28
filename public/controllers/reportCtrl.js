var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var reportCtrl = (function (_super) {
            __extends(reportCtrl, _super);
            function reportCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.showToolbar = true;
                this.loadFunc = app.api.report.getRecapitulations;
                this.init();
            }
            reportCtrl.prototype.init = function () {
                var ctrl = this;
                app.api.user.getSession().then(function (result) {
                    ctrl.reports = result.data['reports'];
                    ctrl.activeReport = ctrl.reports[0].name;
                });
            };
            reportCtrl.prototype.onReportChange = function (report) {
                this.activeReport = report;
                switch (report) {
                    case 'Belum Terbayar':
                        break;
                    case 'Terbayar':
                        break;
                    case 'Rekapitulasi':
                        this.loadFunc = app.api.report.getRecapitulations;
                        break;
                    case 'Pengiriman':
                        this.loadFunc = app.api.report.getDeliveries;
                        break;
                    case 'Retur':
                        break;
                }
                this.filters = {};
                this.paging.page = 1;
                this.filter();
            };
            reportCtrl.$inject = ['$scope', 'Notification'];
            return reportCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('reportCtrl', reportCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
