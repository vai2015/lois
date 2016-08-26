var app;
(function (app) {
    var api;
    (function (api) {
        var user = (function () {
            function user() {
            }
            user.authenticate = function (data) {
                return app.http.post('/lois/api/user/authenticate', JSON.stringify(data));
            };
            user.logout = function () {
                return app.http.get('/lois/api/user/logout');
            };
            user.getSession = function () {
                return app.http.get('/lois/api/user/getSession');
            };
            return user;
        }());
        api.user = user;
    })(api = app.api || (app.api = {}));
})(app || (app = {}));
