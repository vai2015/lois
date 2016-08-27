module lois.controllers{
   class indexCtrl{
      menus: any[];
      user: any;

      static $inject = ['$scope', 'Notification'];

      constructor($scope, public Notification){
         this.init();
      }

      init(): void {
        var ctrl = this;
        app.api.user.getSession().then(result => {
           ctrl.menus = <Array<any>> result.data['menus'];
           ctrl.user = result.data['name'];
        })
      }

      logout(): void {
        var ctrl = this;
        app.api.user.logout().then(result => {
           window.location.href = '/lois';
        }).catch(error => {
           ctrl.Notification.error(error.data);
        })
      }
   }
   app.lois.controller('indexCtrl', indexCtrl);
}
