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
            function reportCtrl() {
                _super.apply(this, arguments);
            }
            return reportCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('reportCtrl', reportCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
