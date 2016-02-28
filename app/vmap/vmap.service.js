/**
 * Created by k_zenchyk on 2/28/16.
 */
angular.module('gmapApp')
    .service('gmapService', [ '$http', function($http){

        this.getVac = function(){
            return $http.get('https://api.hh.ru/vacancies?items_on_page=100&only_with_salary=true&area=1002&text=junior&isMap=true&bottom_left_lat=53.885532714289496&bottom_left_lng=27.294241465367065&top_right_lat=53.9153377954745&top_right_lng=27.73369459036706');
        }

    }]);