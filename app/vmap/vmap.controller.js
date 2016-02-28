/**
 * Created by k_zenchyk on 2/28/16.
 */
angular.module('gmapApp')
    .controller('gmapController', ['$scope', 'gmapService', function($scope, gmapService){
        var vm = this;
        vm.markers = [];
        $scope.markers = [];

        vm.searchingCriteries = {
            text: 'javascript',
            experience: '',
            employment: '',
            schedule: '',
            currency: '',
            salary: ''
        };



        gmapService.getVac()
            .then(success, error)
            .then(getVacancyWithAddress)
            .then(goodLatLng)
            .then(getMarkers);

        function success(response){
            vm.vac = response.data.items;
            console.log('vac', vm.vac);
            return vm.vac;
        }
        function error(response){
            console.log("Error: " + response.status + " " + response.statusText);
        }

        function getVacancyWithAddress(arr){
            vm.res = arr.filter(function(item){
                if(item.address) {
                    return item
                }
            });
            console.log('with address', vm.res);
            return vm.res
        }

        function goodLatLng(arr){
            vm.good = arr.filter(function(item){
                if(!!item.address.lat && !!item.address.lng){
                    return item
                }
            });
            console.log('good', vm.good);
            return vm.good
        }

        function getMarkers(arr){
            $scope.markers = arr.map(function(item){
                vm.a = {
                    layer: 'realworld',
                    lat: item.address.lat,
                    lng: item.address.lng,
                    message: item.name
                };
                return vm.a;
            });
            console.log('markers', $scope.markers);
            return $scope.markers
        }

        angular.extend($scope, {
            minsk: {
                lat: 53.89422375647324,
                lng: 27.558517456054688,
                zoom: 11
            },
            layers: {
                baselayers: {
                    osm: {
                        name: 'OpenStreetMap',
                        type: 'xyz',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    }
                },
                overlays: {
                    realworld: {
                        name: "Real world data",
                        type: "markercluster",
                        visible: true
                    }
                }
                }
            });

    }]);