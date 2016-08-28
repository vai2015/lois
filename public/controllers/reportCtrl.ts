module lois.controllers {
  class reportCtrl extends baseCtrl{
     reports: any[];
     activeReport: string;
     renderFunc: Function;
     dataFunc: Function;

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
           this.dataFunc = app.api.report.getRecapitulationsReport;
           this.renderFunc = app.api.reportPrint.printRecapitulation;
         break;
         case 'Pengiriman':
           this.loadFunc = app.api.report.getDeliveries;
           this.dataFunc = app.api.report.getDeliveriesReport;
           this.renderFunc = app.api.reportPrint.printDelivery;
         break;
         case 'Retur':
           this.loadFunc = app.api.report.getReturn;
         break;
         case 'SJ Belum Kembali':
           this.loadFunc = app.api.report.getUnconfirmed;
         break;
       }

       this.filters = {};
       this.paging.page = 1;
       this.filter();
     }

     print(): void {
        var checkedEntities = this.entities.filter(e => e.checked);

        if(checkedEntities.length === 0){
           this.notify('warning', 'Tidak ada data yang pilih');
           return;
        }

        var ctrl = this;
        ctrl.loadingData = true;
        ctrl.dataFunc(checkedEntities).then(result => {
           ctrl.renderFunc(result.data).then(buffer => {
              var blob = new Blob([buffer.data], {type:'application/pdf'});
              var url = URL.createObjectURL(blob);
              window.open(url, '_blank');
           });
        }).finally(() => {
          ctrl.loadingData = false;
       });
     }
  }

  app.lois.controller('reportCtrl', reportCtrl);
}
