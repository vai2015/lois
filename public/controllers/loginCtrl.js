var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var loginCtrl = (function () {
            function loginCtrl($scope, Notification) {
                this.Notification = Notification;
            }
            loginCtrl.prototype.login = function () {
                var ctrl = this;
                app.api.user.authenticate(ctrl.user).then(function (result) {
                    window.location.href = '/lois';
                }).catch(function (error) {
                    ctrl.Notification.error(error.data);
                });
            };
            loginCtrl.$inject = ['$scope', 'Notification'];
            return loginCtrl;
        }());
        app.lois.controller('loginCtrl', loginCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
