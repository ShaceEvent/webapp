'use strict';

/* Controllers */

angular.module('shace.controllers', []).

    controller('MainController', ['$scope', function ($scope) {
        $scope.isHome = true;
        
        $scope.$on('$stateChangeSuccess', function (event, route) {
            $scope.isHome = (route.controller === 'HomeController');
        });
    }]).
    
    controller('NotificationsController', ['$scope', '$timeout', 'Notifications', function ($scope, $timeout, Notifications) {
        $scope.notifications = [];
        
        $scope.closeNotification = function (notification) {
            var i, l;
            
            if (angular.isNumber(notification)) {
                $scope.notifications.splice(notification, 1);
            } else {
                for (i = 0, l = $scope.notifications.length; i < l; i += 1) {
                    if ($scope.notifications[i] === notification) {
                        $scope.notifications.splice(i, 1);
                        return;
                    }
                }
            }
        };
        
        Notifications.registerNotifier({
            notify: function (notification) {
                var
                    duration = angular.isDefined(notification.duration) ? notification.duration : 5
                ;
                
                $scope.notifications.push(notification);
                if (duration > 0) {
                    $timeout(function () {
                        $scope.closeNotification(notification);
                    }, duration*1000);
                }
            }
        });
    }]).

    controller('HomeController',
        ['$scope', '$q', '$location', 'Notifications', 'Events',
        function ($scope, $q, $location, Notifications, Events) {
    
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
            
            // Check if an event with the given token exists
            Events.get({token:inputToken},
            // Success handler
            function(response) {
                createAction.enabled = false;
                actions.push({
                    type: 'access',
                    token: response.token,
                    event: response
                });
                actions.push(createPrivateAction);
                deferred.resolve(actions);
            },
            // Error handler
            function(response) {
                actions.push(createAction);
                deferred.resolve(actions);
            });
            return deferred.promise;
        };
        
        /*
         * Handler of input token select event
         */
        $scope.inputTokenActionSelected = function () {
            var action = $scope.inputToken;
            
            if (!action) {
                return ;
            }
            if (action.type === 'create') {
                $scope.createEvent('public', action.token);
            } else if (action.type === 'create-private') {
                $scope.createEvent('private', action.token);
            } else if (action.type === 'access') {
                $scope.accessEvent(action.token);
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
                    $location.path('/events/'+token);
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
                $location.path('/events/'+event.token);
            }, function (response) {
                Notifications.notifyError(response.data);
            });
        };

    }]).
    controller('LoginController', ['$scope', '$location', '$timeout', 'Notifications', 'shace', function ($scope, $location, $timeout, Notifications, shace) {
        
        $scope.login = function (email, password) {
            if (email && password) {
                shace.requestAccessToken(email, password).then(function () {
                    // User is logged, redirect to home
                    shace.retrieveUserInfos().finally(function () {
                        $location.path('/');
                    });
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };
        
        $scope.signup = function (email, password) {
            if (email && password) {
                shace.signup(email, password).then(function () {
                    $scope.login(email, password);
                }, function (response) {
                    Notifications.notifyError(response.data);
                });
            }
        };
        
    }]).
    controller('LogoutController', ['$scope', '$location', 'shace', function ($scope, $location, shace) {
        
        shace.logout();
        $location.path('/');

    }]).
    controller('MeController', ['$scope', '$location', '$filter', 'shace', function ($scope, $location, $filter, shace) {
        var birth_date;
        
        $scope.$watch('shace.user', function (newValue) {
            if (newValue.birth_date) {
                $scope.birth_date = $filter('date')(newValue.birth_date, 'yyyy-MM-dd');
            }
        });
        
        $scope.saveUser = function () {
            if ($scope.password) {
                shace.user.password = $scope.password;
                $scope.password = '';
            }
            birth_date = (new Date($scope.birth_date)).getTime();
            if (birth_date) {
                shace.user.birth_date = birth_date;
            }
            shace.user.$update();
        };
    }]).
    controller('EventsNewController', ['$scope', '$state', '$location', 'Events', function ($scope, $state, $location, Events) {
        $scope.event = {
            token: '',
            privacy: 'public'
        };
        
        $scope.createEvent = function () {
            Events.save({}, $scope.event, function (event) {
                $location.path('/events/'+event.token);
            });
        };
    }]).
    controller('EventController',
    ['$scope', '$state', '$rootScope', 'shace', 'Notifications', 'Uploader', 'Events', 'Medias',
    function ($scope, $state, $rootScope, shace, Notifications, Uploader, Events, Medias) {
        $scope.loadEvent = function () {
            $scope.event = Events.get({token: $state.params.token});
        };
        
        $scope.canEditInfos = function () {
            return true;
        };

        $scope.saveInfos = function () {
            $scope.event.$update({token: $scope.event.token}).then(function(){}, function (response) {
                Notifications.notifyError(response.data);
            });
        };
        
        $scope.loadEvent();
    }]).
    controller('EventMediasController',
        ['$scope', '$state', '$rootScope', 'shace', 'Notifications', 'Uploader', 'Events', 'Medias',
        function ($scope, $state, $rootScope, shace, Notifications, Uploader, Events, Medias) {
        
        // Reload medias if necessary
        if ($scope.event.needReload) {
            $scope.loadEvent();
        }
        
        $scope.uploadMedias = function (files) {
            var i, l, file, medias = [];
            
            // Empty current uploader queue
            Uploader.queue = [];
            
            // Create an empty media for each file and pre-process files
            for (i = 0, l = files.length; i < l; i += 1) {
                file = files[i];
                
                medias.push({});
                
                // Add file infos
                file.previewUrl = window.URL.createObjectURL(file);
            }
            Medias.save({
                eventToken: $scope.event.token
            }, {
                medias: medias
            }, function (response) {
                var i, l, media;

                if (response.medias.length === files.length) {
                    // Assign a media to each file to upload
                    for (i = 0, l = response.medias.length; i < l; i += 1) {
                        files[i].media = response.medias[i];
                    }
                    
                    // Upload the files
                    Uploader.queueFiles(files);
                    
                    // Go to upload page
                    $state.go('event.upload');
                }
            }, function (response) {
                Notifications.notifyError(response.data);
            });
        };
    }]).
    controller('EventUploadController',
    ['$scope', '$rootScope', 'Uploader', function ($scope, $rootScope, Uploader) {
        // Event will need to be reloaded after leaving upload page
        $scope.event.needReload = true;
    
        $scope.queue = Uploader.queue;
        $scope.uploadDone = false;
    
        $rootScope.$on('FileUploadDone', function (event, file, progress) {
            if (Uploader.getPendingFilesCount() === 0) {
                $scope.uploadDone = true;
            }
        });
    }]).
    controller('MediaController', ['$scope', '$state', 'Medias', function ($scope, $state, Medias) {

        $scope.media = Medias.get({
            eventToken: $state.params.eventToken,
            id: $state.params.id
        });

    }])
;