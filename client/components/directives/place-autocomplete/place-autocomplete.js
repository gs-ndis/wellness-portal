/* jshint ignore:start */
'use strict';

/**
 * @ngdoc directive
 * @name locationApp.directive:placeAutocomplete
 * @author Vinay Gopinath
 * @description
 *
 * # An element directive that provides a dropdown of
 * location suggestions based on the search string.
 * When an item is selected, the location's latitude
 * and longitude are determined.
 *
 * This directive depends on the Google Maps API
 * with the places library, i.e,
 * <script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
 *
 * @example
 * <place-autocomplete ng-model="selectedLocation"></place-autocomplete>
 *
 * Demo:
 * http://plnkr.co/edit/dITwTF?p=preview
 *
 * Credit:
 * http://stackoverflow.com/a/31510437/293847
 */
angular.module('wellness')
  .directive('placeAutocomplete', function() {
    return {
      templateUrl: 'components/directives/place-autocomplete/place-autocomplete.html',
      restrict: 'E',
      replace: true,
      scope: {
        'ngModel': '=',
        'label': '@',
        'loadedPromise': '=',
        'searchComplete': '&',
        'ngModelOptions': '='
      },
      controller: function($scope, $q, uiGmapGoogleMapApi, $timeout, growl) {

        var autocompleteService;
        var map;
        var placeService;
        uiGmapGoogleMapApi.then(function(maps) {
          autocompleteService = new maps.places.AutocompleteService();
          map = new maps.Map(document.createElement('div'));
          placeService = new maps.places.PlacesService(map);
        });

        if (!$scope.ngModel) {
          $scope.ngModel = {};
        }

        if ($scope.loadedPromise) {
          $scope.loadedPromise.then(function() {
            $timeout(function() {
              if ($scope.ngModel.location) {
                $scope.location = $scope.ngModel.location.name;
              }
            });
          });
        }
        /**
         * @ngdoc function
         * @name getResults
         * @description
         *
         * Helper function that accepts an input string
         * and fetches the relevant location suggestions
         *
         * This wraps the Google Places Autocomplete Api
         * in a promise.
         *
         * Refer: https://developers.google.com/maps/documentation/javascript/places-autocomplete#place_autocomplete_service
         */
        var getResults = function(address) {
          return new Promise(function(resolve) {
            autocompleteService.getQueryPredictions({
              input: address
            }, function(data) {
              resolve(data);
            });
          });
        };

        /**
         * @ngdoc function
         * @name getDetails
         * @description
         * Helper function that accepts a place and fetches
         * more information about the place. This is necessary
         * to determine the latitude and longitude of the place.
         *
         * This wraps the Google Places Details Api in a promise.
         *
         * Refer: https://developers.google.com/maps/documentation/javascript/places#place_details_requests
         */
        var getDetails = function(place) {
          return new Promise(function(resolve, reject) {
            placeService.getDetails({
              'placeId': place.place_id
            }, function(details, status) {
              if (status === 'NOT_FOUND') {
                return reject(status);
              }
              resolve(details);
            });
          });
        };

        $scope.search = function(input) {
          if (!input) {
            return;
          }
          return getResults(input).then(function(places) {
            return places;
          });
        };

        function latinizeSafe(string) {
          return latinize(String(string || ''));
        }
        /**
         * @ngdoc function
         * @name getLatLng
         * @description
         * Updates the scope ngModel variable with details of the selected place.
         * The latitude, longitude and name of the place are made available.
         *
         * This function is called every time a location is selected from among
         * the suggestions.
         */
        $scope.getLatLng = function(place) {
          if (!place) {
            $scope.ngModel = {};
            return;
          }
          getDetails(place).then(function(details) {
            var location = {};
            for (var i = 0; i < details.address_components.length; i++) {

              var addressType = details.address_components[i].types[0];
              // console.log('addressType', addressType);
              location[addressType] = details.address_components[i];
//              if (componentForm[addressType]) {
//                var val = details.address_components[i][componentForm[addressType]];
//                document.getElementById(addressType).value = val;
//              }
            }
            _.extend(location, {
              'name': latinizeSafe(place.description),
              'latitude': details.geometry.location.lat(),
              'longitude': details.geometry.location.lng()
            });
            var streetNumber = _.get(location, 'street_number.short_name');
            _.extend($scope.ngModel, {
              //    streetNumber: _.get(location, 'street_number.short_name'),
              street: latinizeSafe((streetNumber ? streetNumber + ' ' : '') + (_.get(location, 'route.long_name') || '')),
              city: latinizeSafe(_.get(location, 'locality.long_name') || _.get(location, 'administrative_area_level_1.long_name')),
              state: latinizeSafe(_.get(location, 'administrative_area_level_1.short_name')),
              zip: _.get(location, 'postal_code.short_name'),
              location: location
            });

            $timeout(function() {
              $scope.searchComplete();
            });

          }).catch(function(err) {
            growl.error('No results found. Please search another location.');
            return;
          });
        };
      }
    };
  });