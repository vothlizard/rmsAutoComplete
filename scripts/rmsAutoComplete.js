'use strict';

(function () {
    var factory = function($http) {
    return {
        getSource: function (searchTerm, response, scope) {
                        var input = {
                            "Language": scope.language, "ActiveOnly": true
                        };
                        input[scope.dataLabel] = searchTerm.term;
                        (function (dataLabel, dataValue) {
                            $http({
                                method: 'POST',
                                url: scope.baseUrl + scope.query,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer 9002f8a2f7d43b4c82b2e5c033fc224e' // need valid auth token
                                },
                                data: input
                            }).then(function (autocompleteResults) {
                                response($.map(autocompleteResults.data.Results, function (autocompleteResult) {
                                    var output = null;
                                    if (dataLabel) {
                                        output = {
                                            label: autocompleteResult[dataLabel],
                                            value: autocompleteResult[dataValue]
                                        }
                                    } else {
                                        output = autocompleteResult[dataValue];
                                    }
                                    return output;
                                }))
                            });
                        })(scope.dataLabel, scope.dataValue)
                        
                    }
    }
};
    var directive = function ($compile, $timeout, rmsAutoCompleteDataService) {
        return {
            restrict: 'A',
            scope: {
                baseUrl: '@rmsUrl',  // api base URL
                query: '@rmsQuery',  // api query
                language: '@rmsLanguage', // api perfered language
                dataLabel: '@rmsText', // datasource text field
                dataValue: '@rmsValue',  // datasource value field
                selected: '=rmsSelected' // selected value
            },
            link: function (scope, elem, attr, ctrl) {
                elem.autocomplete({
                    source: function (searchTerm, response) {
                        return rmsAutoCompleteDataService.getSource(searchTerm, response, scope);
                    },
                    minLength: 2,
                    focus: function (event, ui) {
                        event.preventDefault();
                        elem.val(ui.item.label);
                    },
                    select: function (event, ui) {
                        event.preventDefault();
                        elem.val(ui.item.label);
                        $timeout(function () {
                            scope.selected = ui.item.value;
                        });
                    }
                });
            }
        };
    };

    angular.module('rmsAngularJSControls',[])
        .factory('rmsAutoCompleteDataService', factory)
        .directive('rmsAutoComplete', directive);

}());