var lois;
(function (lois) {
    var controllers;
    (function (controllers) {
        var indexCtrl = (function () {
            function indexCtrl($scope, Notification) {
                this.Notification = Notification;
                this.init();
            }
            indexCtrl.prototype.init = function () {
                var ctrl = this;
                app.api.user.getSession().then(function (result) {
                    var roleMenus = result.data['menus'];
                    ctrl.menus = roleMenus.map(function (e) { return e.menu; });
                    ctrl.user = result.data['name'];
                });
            };
            indexCtrl.prototype.logout = function () {
                var ctrl = this;
                app.api.user.logout().then(function (result) {
                    window.location.href = '/lois';
                }).catch(function (error) {
                    ctrl.Notification.error(error.data);
                });
            };
            indexCtrl.$inject = ['$scope', 'Notification'];
            return indexCtrl;
        }());
        app.lois.controller('indexCtrl', indexCtrl);
    })(controllers = lois.controllers || (lois.controllers = {}));
})(lois || (lois = {}));
