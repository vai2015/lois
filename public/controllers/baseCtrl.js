var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var baseCtrl = (function () {
            function baseCtrl(notification) {
                this.notification = notification;
                this.showToolbar = false;
                this.showForm = false;
                this.filters = {};
                this.query = {};
                this.paging = { page: 1, max: 10, total: 0 };
            }
            baseCtrl.prototype.notify = function (type, message) {
                this.notification[type](message);
            };
            return baseCtrl;
        }());
        controllers.baseCtrl = baseCtrl;
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
