module lois.controllers {
	 enum ConfigType{
      region=1,
      location=2,
      paymentType=3,
      client=4,
      tariff=5,
      partner=6,
      driver=7,
      packingType=8,
      role=9,
      user=10,
      trainType=11,
      menuAccess=12,
      reportAccess=13
    };

    enum ClientViewMode {
      client = 1,
      tariff = 2
   }

	class configurationCtrl extends baseCtrl{
		configType: ConfigType;
	    clientViewMode: ClientViewMode;
	    selectedClient: any;
	    tariffs: any[];
	    config: string;
	    static $inject = ['$scope', 'Notification'];

	    constructor($scope, Notification){
	       super(Notification);
	       this.loadFunc = app.api.configuration.getAll;
	       this.getFunc = app.api.configuration.get;
	       this.saveFunc = app.api.configuration.save;
	    }

	    onConfigChange(config: string): void {
	       this.config = config;
	       this.filter();
	    }

	    filter(): void{
	        var ctrl = this;

	        ctrl.checkedAll = false;
	        ctrl.createQuery();
	        ctrl.loadingData = true;

	        ctrl.loadFunc(ctrl.config, ctrl.query).then(result => {
	           ctrl.entities = result.data;
	        }).catch(exception => {
	           ctrl.notify('error', exception.data);
	        }).finally(() => {
	           ctrl.loadingData = false;
	        });
     	}
	}

	app.lois.controller('configurationCtrl', configurationCtrl);
}