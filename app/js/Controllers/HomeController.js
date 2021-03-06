'use strict';

angular.module('shace.controllers').controller('HomeController',
    ['$scope', '$q', '$state', '$modal', '$location', '$document', 'Notifications', 'Events',
        function ($scope, $q, $state, $modal, $location, $document, Notifications, Events) {

            /*
             * Return auto-completed actions for input token
             */
            $scope.getInputTokenActions = function(inputToken) {
                var
                    deferred = $q.defer(),
                    actions = [],
                    createAction, createPrivateAction
                ;

                // Add create actions
                createAction = {
                    type: 'create',
                    token: inputToken
                };
                createPrivateAction = {
                    type: 'create-private',
                    token: inputToken
                };


                Events.search({token:inputToken},
                    // Success handler
                    function(response) {
                        var exact = false;
                        for (var i = 0; i < response.events.length; ++i) {

                            actions.push({
                                type: 'access',
                                token: response.events[i].token,
                                event: response.events[i],
                                privacy: response.events[i].privacy
                            });
                            if (response.events[i].token === inputToken) {
                                exact = true;
                            }
                        }
                        if (exact) {
                            createAction.enabled = false;
                            actions.push(createPrivateAction);
                        } else {
                            actions.push(createAction);
                        }
                        deferred.resolve(actions);
                    },
                    // Error handler
                    function(response) {

                    });
                return deferred.promise;
            };

            /*
             * Handler of input token select event
             */
            $scope.inputTokenActionSelected = function () {
                var
                    type, privacy,
                    action = $scope.inputToken
                ;

                if (!action) {
                    return ;
                }
                type = action.type;
                privacy = action.privacy;
                $scope.inputToken = action.token;
                if (type === 'create') {
                    $scope.createEvent('public', $scope.inputToken);
                } else if (type === 'create-private') {
                    $scope.createEvent('private', $scope.inputToken);
                } else if (type === 'access') {
                    if (privacy === 'protected') {
                        $scope.eventToken = $scope.inputToken;
                        $modal.open({
                            controller: 'AccessProtectedEventController',
                            templateUrl: '../../partials/components/access-protected.html',
                            scope: $scope
                        });
                    } else {
                        $state.go('event.medias.rootBucket', {token: $scope.inputToken});
                    }
                }

            };

            /*
             * Access an event with a given token
             */
            $scope.accessEvent = function (token) {
                if (token) {
                    Events.get({token: token},
                        // Success handler
                        function(response) {
                            $state.go('event.medias.rootBucket', {token: token});
                        },
                        // Error handler
                        function (response) {
                            Notifications.notifyError(response.data);
                        });
                }
            };

            /*
             * Create an event and redirect to the event page
             */
            $scope.createEvent = function(privacy, token) {
                var name = 'Untitled event';

                Events.save({}, {token: token, privacy: privacy, name:name}, function (event) {
                    $state.go('event.medias.rootBucket', {token: event.token});
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            };
            
            $scope.gotoBottom = function() {
                var element = angular.element(document.getElementById('more'));
                $document.scrollToElement(element, 0, 700);
            };
            
        }]);
