module lois.controllers {
   class homeCtrl extends baseCtrl{
     overall: any;

     static $inject = ['$scope', 'Notification'];

     constructor($scope, Notification){
        super(Notification);
        this.loadOverall();
        this.onSummaryChanges('destination');
     }

     loadOverall(): void {
       var ctrl = this;
       app.api.home.getOverall(ctrl.query).then(result => {
           ctrl.overall = result.data;
       }).catch(error => {
           ctrl.notify('error', error.data);
       });
     }

     onSummaryChanges(summary: string): void {
       switch(summary){
          case 'destination':
            this.loadFunc = app.api.home.getDestinations;
          break;
          case 'sender':
            this.loadFunc = app.api.home.getSenders;
          break;
          case 'paymentType':
            this.loadFunc = app.api.home.getPaymentTypes;
          break;
          case 'paymentStatus':
            this.loadFunc = app.api.home.getPaymentStatuses;
          break;
          case 'region':
            this.loadFunc = app.api.home.getRegions;
          break;
       }

       this.loadOverall();
       this.filter();
     }
   }

   app.lois.controller('homeCtrl', homeCtrl);
}
