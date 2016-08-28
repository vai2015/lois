var app;
(function (app) {
    app.lois = angular.module('lois', [
        'ui.router',
        'ngResource',
        'ngFileUpload',
        'ui-notification',
        'ui.bootstrap',
        'angular-blocks',
        'bw.paging'
    ]);
    (function (HttpStatus) {
        HttpStatus[HttpStatus["Success"] = 200] = "Success";
        HttpStatus[HttpStatus["NotFound"] = 404] = "NotFound";
        HttpStatus[HttpStatus["Error"] = 500] = "Error";
        HttpStatus[HttpStatus["Unauthorized"] = 401] = "Unauthorized";
    })(app.HttpStatus || (app.HttpStatus = {}));
    var HttpStatus = app.HttpStatus;
    ;
    app.lois.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
            var url = '/lois';
            $urlRouterProvider.otherwise('/lois');
            $locationProvider.html5Mode({ enabled: true });
            $stateProvider.state('site', {
                abstract: true,
                template: '<ui-view />',
                resolve: {
                    authorize: ['authorization', function (authorization) {
                            return authorization.authorize();
                        }] }
            }).state('site.login', {
                url: url + '/login',
                templateUrl: '/views/login.html',
                controller: 'loginCtrl as ctrl'
            }).state('site.main', {
                url: url,
                templateUrl: '/views/main.html',
                controller: 'indexCtrl as ctrl'
            }).state('site.main.home', {
                url: '/home',
                templateUrl: '/views/home.html',
                controller: 'homeCtrl as ctrl'
            }).state('site.main.shipping', {
                url: '/shipping',
                templateUrl: '/views/shipping.html',
                controller: 'shippingCtrl as ctrl'
            }).state('site.main.deliveryOrder', {
                url: '/delivery-order',
                templateUrl: '/views/deliveryOrder.html',
                controller: 'deliveryOrderCtrl as ctrl'
            }).state('site.main.recapitulation', {
                url: '/recapitulation',
                templateUrl: '/views/recapitulation.html',
                controller: 'recapitulationCtrl as ctrl'
            }).state('site.main.delivery', {
                url: '/delivery',
                templateUrl: '/views/delivery.html',
                controller: 'deliveryCtrl as ctrl'
            }).state('site.main.return', {
                url: '/return',
                templateUrl: '/views/return.html',
                controller: 'returnCtrl as ctrl'
            }).state('site.main.confirmReturn', {
                url: '/confirm-return',
                templateUrl: '/views/confirmReturn.html',
                controller: 'confirmReturnCtrl as ctrl'
            }).state('site.main.payment', {
                url: '/payment',
                templateUrl: '/views/payment.html',
                controller: 'paymentCtrl as ctrl'
            }).state('site.main.invoice', {
                url: '/invoice',
                templateUrl: '/views/invoice.html',
                controller: 'invoiceCtrl as ctrl'
            }).state('site.main.report', {
                url: '/report',
                templateUrl: '/views/report.html',
                controller: 'reportCtrl as ctrl'
            }).state('site.main.configuration', {
                url: '/configuration',
                templateUrl: '/views/configuration.html',
                controller: 'configurationCtrl as ctrl'
            });
        }]);
    app.lois.factory('principal', ['$q', '$http', function ($q, $http) {
            var identity;
            var authenticated = false;
            return {
                isIdentityResolved: function () {
                    return angular.isDefined(identity);
                },
                isAuthenticated: function () {
                    return authenticated;
                },
                identity: function () {
                    var deferred = $q.defer();
                    if (angular.isDefined(identity)) {
                        deferred.resolve(identity);
                        return deferred.promise;
                    }
                    $http.get('/lois/api/user/getSession').success(function (result) {
                        if (result) {
                            identity = result;
                            authenticated = true;
                        }
                        deferred.resolve(identity);
                    }).error(function () {
                        identity = null;
                        authenticated = false;
                        deferred.resolve(identity);
                    });
                    return deferred.promise;
                }
            };
        }]);
    app.lois.factory('authorization', ['$rootScope', '$state', '$location', 'principal', function ($rootScope, $state, $location, principal) {
            return {
                authorize: function () {
                    return principal.identity().then(function () {
                        var isAuthenticated = principal.isAuthenticated();
                        if (!isAuthenticated && $rootScope.toState.name !== 'site.login') {
                            $rootScope.returnToState = $rootScope.toState;
                            $rootScope.returnToStateParams = $rootScope.toStateParams;
                            $state.go('site.login');
                        }
                    });
                }
            };
        }]);
    app.lois.directive('toNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return parseFloat(val);
                });
                ngModel.$formatters.push(function (val) {
                    return '' + val;
                });
            }
        };
    });
    app.lois.directive('datepicker', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    $timeout(function () {
                        $(elem).datepicker({ dateFormat: 'yy-mm-dd' });
                    });
                }
            };
        }]);
    app.lois.run(['$rootScope', '$state', '$stateParams', 'authorization', 'Upload', 'principal', '$http',
        function ($rootScope, $state, $stateParams, authorization, Upload, principal, $http) {
            app.http = $http;
            app.ngUpload = Upload;
            $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;
                if (principal.isIdentityResolved())
                    authorization.authorize();
            });
        }]);
})(app || (app = {}));
