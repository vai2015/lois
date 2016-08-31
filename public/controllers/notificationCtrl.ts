module lois.controllers {
   class notificationCtrl extends baseCtrl{

     static $inject = ['$scope', 'Notification'];

     constructor($scope, Notification){
        super(Notification);
        this.loadFunc = app.api.notification.getAll;
        this.deleteFunc = app.api.notification.delete;
        this.filter();
     }
   }

   app.lois.controller('notificationCtrl', notificationCtrl);
}
