module lois.controllers {
  class reportCtrl extends baseCtrl{
     reports: any[];
     activeReport: string;
     renderApi: Function;
     dataApi: Function;
  }

  app.lois.controller('reportCtrl', reportCtrl);
}
