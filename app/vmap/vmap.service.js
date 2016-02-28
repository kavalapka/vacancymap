/**
 * Created by k_zenchyk on 2/28/16.
 */
const qs = require('qs');

angular.module('gmapApp')
    .service('gmapService', [ '$http', function($http){

        var baseUrl = 'https://api.hh.ru/vacancies?';

        this.getVac = function(partUrlDict){
            var partUrl = qs.stringify(partUrlDict, { indices: false });
            console.log("URL", baseUrl+partUrl)
            return $http.get(baseUrl+partUrl);
        };

        var searchingParamCache;
        this.getSearchParam = function () {
            if(!searchingParamCache){
                searchingParamCache = $http.get('https://api.hh.ru/dictionaries');
            }
            return searchingParamCache;
        }

    }]);