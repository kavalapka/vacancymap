/**
 * Created by k_zenchyk on 2/28/16.
 */


angular.module('gmapApp')
    .controller('gmapController', ['$scope', 'gmapService', function($scope, gmapService){
        var vm = this;
        vm.markers = [];
        $scope.markers = [];

        vm.params = {
            items_on_page: 100,
            only_with_salary: true,
            area: 1002,
            isMap: true,
            bottom_left_lat: 53.885532714289496,
            bottom_left_lng: 27.294241465367065,
            top_right_lat: 53.9153377954745,
            top_right_lng: 27.73369459036706
        };

        $scope.expSelected = {
            name: "Not selected"
        };
        $scope.emplSelected = {
            name: "Not selected"
        };
        $scope.shSelected = {
            name: "Not selected"
        };
        $scope.currSelected = {
            name: "Not selected"
        };


        setMap();

        gmapService.getSearchParam()
            .then(callbackDict, error);

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
                if(item.salary.from) {
                    vm.message = item.name + '<br>'
                        + item.employer.name + '<br>'
                        + item.salary.from + item.salary.currency;
                }
                vm.a = {
                    layer: 'realworld',
                    lat: item.address.lat,
                    lng: item.address.lng,
                    message: vm.message
                };
                return vm.a;
            });
            console.log('markers', $scope.markers);
            return $scope.markers
        }

        function callbackDict(response){

            $scope.expItems = response.data.experience;
            $scope.expItems.push($scope.expSelected);

            $scope.emplItems = response.data.employment;
            $scope.emplItems.push($scope.emplSelected);

            $scope.scheduleItems = response.data.schedule;
            $scope.scheduleItems.push($scope.shSelected);

            $scope.currItems = response.data.currency;
            $scope.currItems.push($scope.currSelected);
        }

         function setMap(){
            gmapService.getVac(vm.params)
            .then(success, error)
            .then(getVacancyWithAddress)
            .then(goodLatLng)
            .then(getMarkers);
        };

        $scope.updateCriteria = function(){
            vm.params.text = $scope.text;
            vm.params.experience = $scope.expSelected.id;
            vm.params.employment = $scope.emplSelected.id;
            vm.params.schedule = $scope.shSelected.id;
            vm.params.currency = $scope.currSelected.code;

            setMap();

        };

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