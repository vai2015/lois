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
}
