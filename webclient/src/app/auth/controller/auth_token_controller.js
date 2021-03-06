/*
 * Copyright (c) 2014 Mirantis Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/*
 * This controller is responsible for getting an access_token and
 * a refresh token having an authorization_code.
 *
 * @author Nikita Konovalov
 */

angular.module('db.auth').controller('AuthTokenController',
    function ($state, $log, OpenId, Session, $searchParams, $window, UrlUtil,
              LastLocation) {
        'use strict';

        // First, check for the edge case where the API returns an error code
        // back to us. This should only happen when it fails to properly parse
        // our redirect_uri and thus just sends the error back to referrer, but
        // we should still catch it.
        if (!!$searchParams.error) {
            $log.debug('Error received, redirecting to auth.error.');
            $state.go('auth.error', $searchParams);
            return;
        }

        // Validate any previously stored redirect path
        function buildNextPath() {

            // First, do we have a stored last location?
            var location = LastLocation.get();

            // Sanity check on the location, we don't want to bounce straight
            // back into auth.
            if (location.indexOf('/auth') > -1) {
                location = '/';
            }

            return location;
        }

        // Looks like there's no error, so let's see if we can resolve a token.
        // TODO: Finish implementing.
        OpenId.token($searchParams)
            .then(
            function (token) {
                Session.updateSession(token)
                    .then(function () {
                        var nextPath = buildNextPath();
                        $window.location.href =
                            UrlUtil.buildApplicationUrl(nextPath);
                    });
            },
            function (error) {
                Session.destroySession();
                $state.go('auth.error', error);
            }
        );
    });