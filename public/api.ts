module app.api{
   export class user {
      static authenticate(data: any){
         return app.http.post('/lois/api/user/authenticate', JSON.stringify(data));
      }

      static logout(){
         return app.http.get('/lois/api/user/logout');
      }

      static getSession(){
         return app.http.get('/lois/api/user/getSession');
      }
   }

   export class shipping {
      static get(id: any){
         return app.http.get('/lois/api/shipping/get?id=' + id);
      }

      static getAll(query: any){
         return app.http.get('/lois/api/shipping/getAll?query=' + JSON.stringify(query));
      }

      static add(){
         return app.http.post('/lois/api/shipping/add', null);
      }

      static save(data: any){
         return app.http.post('/lois/api/shipping/save', JSON.stringify(data));
      }
   }

   export class configuration {
     static get(config: string, id: any){
        return app.http.get('/lois/api/' + config + '/get?id=' + id);
     }

     static getAll(config: string, query: any){
        return app.http.get('/lois/api/' + config + '/getAll?query=' + JSON.stringify(query));
     }

     static save(config: string, data: any){
       return app.http.post('/lois/api/' + config + '/save', JSON.stringify(data));
     }
   }

   export class autocomplete{
     static getAll(name: string, keyword: string){
         return app.http.get('/lois/api/' + name + '/getAll?query=' + JSON.stringify({"name" : keyword}));
     }
  }
}
