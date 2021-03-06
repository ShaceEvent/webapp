'use strict';

angular.module('shace.resources').
    factory('Events', ['$resource', 'Config', function ($resource, Config) {

        var Events = $resource(Config.apiAccessPoint+'/events/:token', {
            /* Default params */
        }, {
            /* Custom actions */
            update: {method: 'PUT'},

            /*
             * Requests access to an event
             */
            access: {
                url: Config.apiAccessPoint+'/events/:token/access',
                method: 'POST'
            },

            /*
             * Get users that can access an event
             */
            users: {
                url: Config.apiAccessPoint+'/events/:token/users',
                method: 'GET'
            },

            /*
             * Search with completion
             */
            search: {
                url: Config.apiAccessPoint+'/events/search/:token',
                method: 'GET'
            },

            /*
             * Add a user access to the event
             */
            addUsers: {
                url: Config.apiAccessPoint+'/events/:token/users',
                method: 'PUT',
                isArray: true
            },

            /*
             * Remove a user access to the event
             */
            removeUser: {
                url: Config.apiAccessPoint+'/events/:token/users/:id',
                method: 'DELETE'
            },

            /*
             * Update a user access on the event
             */
            updateUser: {
                url: Config.apiAccessPoint+'/events/:token/users',
                method: 'PUT',
                isArray: true
            }
        });

        Events.getCoverUploadURL = function (event) {
            return Config.apiAccessPoint+'/events/'+event.token+'/cover';
        };

        return Events;
    }]);