module lois.controllers {
	class configurationCtrl extends baseCtrl{
	    selectedClient: any;
	    tariffs: any[];
	    config: string;
	    static $inject = ['$scope', 'Notification'];

	    constructor($scope, Notification){
	       super(Notification);
	       this.loadFunc = app.api.configuration.getAll;
	       this.getFunc = app.api.configuration.get;
	       this.saveFunc = app.api.configuration.save;
         this.deleteFunc = app.api.configuration.delete;
         this.showToolbar = true;
	    }

	    onConfigChange(config: string): void {
	       this.config = config;
         this.paging.page = 1;
         this.filters = {};
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

      edit(id: any): void {
         var ctrl = this;
         ctrl.processing = true;
         ctrl.showForm = true;

         ctrl.getFunc(ctrl.config, id).then(result => {
            ctrl.entity = result.data;
         }).catch(exception => {
            ctrl.notify('error', exception.data);
         }).finally(() => {
            ctrl.processing = false;
         });
      }

      save(): void {
       var ctrl = this;
       ctrl.processing = true;

       ctrl.saveFunc(ctrl.config, ctrl.entity).then(result => {
          ctrl.notify('success', 'Data berhasil disimpan');
          ctrl.showForm = false;
          ctrl.filter();
       }).catch(exception => {
          ctrl.notify('error', exception.data);
       }).finally(() => {
          ctrl.processing = false;
       });
     }

     delete(id): void {
        var confirmed = confirm('Data akan dihapus, anda yakin?');

        if(!confirmed)
          return;

        var ctrl = this;
        ctrl.deleteFunc(ctrl.config, id).then(result => {
           ctrl.notify('success', 'Data berhasil dihapus');
           ctrl.filter();
        }).catch(exception => {
           ctrl.notify('error', exception.data);
        });
     }
	}

	app.lois.controller('configurationCtrl', configurationCtrl);
}
