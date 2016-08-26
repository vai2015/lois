module lois.controllers{
   class loginCtrl{
      user: any;
      static $inject = ['$scope', 'Notification'];

      constructor($scope, public Notification){}

      login(): void {
         var ctrl = this;
         app.api.user.authenticate(ctrl.user).then(result => {
            window.location.href = '/lois';
         }).catch(error => {
            ctrl.Notification.error(error.data);
         });
      }
   }
   app.lois.controller('loginCtrl', loginCtrl);
}
