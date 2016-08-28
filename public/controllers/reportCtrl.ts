module lois.controllers {
  class reportCtrl extends baseCtrl{
     reports: any[];
     activeReport: string;
     renderApi: Function;
     dataApi: Function;

     static $inject = ['$scope', 'Notification'];

     constructor($scope, Notification){
        super(Notification);
        this.showToolbar = true;
        this.loadFunc = app.api.report.getRecapitulations;
        this.init();
     }

     init(): void {
        var ctrl = this;
        app.api.user.getSession().then(result => {
           ctrl.reports = result.data['reports'];
           ctrl.activeReport = ctrl.reports[0].name;
        });
     }

     onReportChange(report: string): void {
        this.activeReport = report;

        switch(report){
         case 'Belum Terbayar':
         break;
         case 'Terbayar':
         break;
         case 'Rekapitulasi':
           this.loadFunc = app.api.report.getRecapitulations;
         break;
         case 'Pengiriman':
           this.loadFunc = app.api.report.getDeliveries;
         break;
         case 'Retur':
           this.loadFunc = app.api.report.getReturn;
         break;
       }

       this.filters = {};
       this.paging.page = 1;
       this.filter();
     }
  }

  app.lois.controller('reportCtrl', reportCtrl);
}
