var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var InvoiceType;
        (function (InvoiceType) {
            InvoiceType[InvoiceType["Semua"] = 1] = "Semua";
            InvoiceType[InvoiceType["Klien"] = 2] = "Klien";
            InvoiceType[InvoiceType["Partner"] = 3] = "Partner";
        })(InvoiceType || (InvoiceType = {}));
        ;
        var invoiceCtrl = (function (_super) {
            __extends(invoiceCtrl, _super);
            function invoiceCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.tab = 'create';
                this.invoiceType = InvoiceType.Semua;
                this.filter();
            }
            invoiceCtrl.$inject = ['$scope', 'Notification'];
            return invoiceCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('invoiceCtrl', invoiceCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
