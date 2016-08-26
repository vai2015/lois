var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var ConfigType;
        (function (ConfigType) {
            ConfigType[ConfigType["region"] = 1] = "region";
            ConfigType[ConfigType["location"] = 2] = "location";
            ConfigType[ConfigType["paymentType"] = 3] = "paymentType";
            ConfigType[ConfigType["client"] = 4] = "client";
            ConfigType[ConfigType["partner"] = 5] = "partner";
            ConfigType[ConfigType["driver"] = 6] = "driver";
            ConfigType[ConfigType["packingType"] = 7] = "packingType";
            ConfigType[ConfigType["role"] = 8] = "role";
            ConfigType[ConfigType["user"] = 9] = "user";
            ConfigType[ConfigType["trainType"] = 10] = "trainType";
            ConfigType[ConfigType["menuAccess"] = 11] = "menuAccess";
            ConfigType[ConfigType["reportAccess"] = 12] = "reportAccess";
        })(ConfigType || (ConfigType = {}));
        ;
        var ClientViewMode;
        (function (ClientViewMode) {
            ClientViewMode[ClientViewMode["client"] = 1] = "client";
            ClientViewMode[ClientViewMode["tariff"] = 2] = "tariff";
        })(ClientViewMode || (ClientViewMode = {}));
        var configurationCtrl = (function (_super) {
            __extends(configurationCtrl, _super);
            function configurationCtrl($scope, Notification) {
                _super.call(this, Notification);
            }
            configurationCtrl.$inject = ['$scope', 'Notification'];
            return configurationCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('configurationCtrl', configurationCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
