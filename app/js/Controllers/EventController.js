'use strict';

angular.module('shace.controllers').
    controller('EventController',
    ['$scope', '$q', '$state', '$rootScope', '$modal', 'Shace', 'Notifications', 'Uploader', 'Events', 'Medias',
        function ($scope, $q, $state, $rootScope, $modal, Shace, Notifications, Uploader, Events, Medias) {
            $scope.loadEvent = function () {
                var deferred = $q.defer();
                
                $scope.event = Events.get({token: $state.params.token}, function () {
                    $scope.event.currentBucket = false;
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });
                
                return deferred.promise;
            };

            $scope.canEditInfos = function () {
                if (!$scope.event || !$scope.event.$resolved || !$scope.event.token) {
                    return false;
                }
                return Shace.access.getPermissionOnEvent($scope.event, 'administrate');
            };

            $scope.saveInfos = function () {
                $scope.event.$update({token: $scope.event.token}).then(function(){}, function (response) {
                    Notifications.notifyError(response.data);
                });
            };

            $scope.openPrivacyOptions = function () {
                $modal.open({
                    controller: 'EventPrivacyOptionsController',
                    templateUrl: '../../partials/events/privacy/modal.html',
                    scope: $scope
                });
            };

            $scope.loadEvent().then(function () {
                if ($rootScope.onLoadAction === 'openPrivateOptions') {
                    $modal.open({
                        controller: 'EventPrivacyOptionsController',
                        templateUrl: '../../partials/events/privacy/modal.html',
                        scope: $scope
                    });
                }
            });
        }]);