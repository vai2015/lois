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
        this.init();
     }

     init(): void {
        var ctrl = this;
        app.api.user.getSession().then(result => {
           var roleReports = <Array<any>> result.data['reports'];
           ctrl.reports = roleReports.map(e => e.report);
        });
     }

     onReportChange(report: string): void {
        this.activeReport = report;

        switch(report){
         case 'Belum Terbayar':
           this.loadFunc = app.api.report.getUnpaid;
           this.dataFunc = app.api.report.getUnpaidReport;
           this.renderFunc = app.api.reportPrint.printUnpaid;
         break;
         case 'Terbayar':
           this.loadFunc = app.api.report.getPaid;
           this.dataFunc = app.api.report.getPaidReport;
           this.renderFunc = app.api.reportPrint.printPaid;
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
           this.dataFunc = app.api.report.getReturnReport;
           this.renderFunc = app.api.reportPrint.printReturn;
         break;
         case 'SJ Belum Kembali':
           this.loadFunc = app.api.report.getUnconfirmed;
           this.dataFunc = app.api.report.getUnconfirmedReport;
           this.renderFunc = app.api.reportPrint.printUnconfirmed;
         break;
         case 'Daftar Kiriman':
           this.loadFunc = app.api.report.getDeliveryList;
           this.dataFunc = app.api.report.getDeliveryListReport;
           this.renderFunc = app.api.reportPrint.printDeliveryList;
         break;
         case 'Komisi':
           this.loadFunc = app.api.report.getCommisions;
           this.dataFunc = app.api.report.getCommisionsReport;
           this.renderFunc = app.api.reportPrint.printCommision;
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
