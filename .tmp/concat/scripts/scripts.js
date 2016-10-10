'use strict';

/**
 * @ngdoc overview
 * @name apiPlatformWebsiteClientApp
 * @description
 * # apiPlatformWebsiteClientApp
 *
 * Main module of the application.
 */
angular
  .module('apiPlatformWebsite', ['ngSanitize', 'ui.router', 'duScroll', 'ui.bootstrap'])
  .value('duScrollOffset', 80)
  .config(["$locationProvider", "$stateProvider", "$urlRouterProvider", function($locationProvider, $stateProvider, $urlRouterProvider) {
      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/');
      $stateProvider
          .state('homepage', {
            url: '/',
            templateUrl: 'views/main.html',
            title: 'API Platform: API-first PHP framework for modern web projects'
          })
          .state('download', {
              url: '/download',
              controller: 'DownloadCtrl',
              templateUrl: 'views/download.html',
              title: 'Download - API Platform'
          })
          .state('support', {
              url: '/support',
              templateUrl: 'views/support.html',
              title: 'Support - API Platform'
          })
          .state('demo', {
              url: '/demo',
              templateUrl: 'views/demo.html',
              title: 'Demonstration - API Platform'
          })
          .state('news', {
              url: '/news',
              controller: 'NewsCtrl',
              templateUrl: 'views/news.html',
              title: 'News - API Platform'
          })
          .state('doc', {
              url: '/doc/{path:.*}',
              controller: 'DocCtrl',
              templateUrl: 'views/doc.html'
          })
      ;
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name apiPlatformWebsite.directive:calavera
 * @description
 * # calavera integration
 */
angular.module('apiPlatformWebsite')
  .directive('calavera', ["$document", "$http", "$anchorScroll", function ($document, $http, $anchorScroll) {
    return {
      template: '<div class="calavera"></div>',
      restrict: 'E',
      scope: {
        jsonld: '=jsonld'
      },
      link: function (scope, element) {
        $http.get(scope.jsonld).then(function (response) {
          // Transform the raw HTML to DOM
          var root = $document[0].createElement('div');
          root.innerHTML = response.data.text;

          // Update the browser title
          $document[0].title = response.data.name + ' - API Platform';

          var $text = angular.element(root);
          // Delete the file name
          var basePath = scope.jsonld.substring(0, scope.jsonld.lastIndexOf('/') + 1);

          // Convert all links pointing to JSON-LD documents
          angular.forEach($text.find('a'), function(element) {
            var $element = angular.element(element);
            var href = $element.attr('href');

            if (/^(?:[a-z]+:)?\/\//i.test(href)) {
              // Make absolute URLs in target blank
              $element.attr('target', '_blank');
            } else {
              // Convert relative JSON-LD URLs
              $element.attr('href', basePath + href.replace(/\.jsonld/, '').replace(/index/, ''));
            }
          });

          // Convert all images
          angular.forEach($text.find('img'), function (element) {
            var $element = angular.element(element);
            var href = $element.attr('src');

            // Convert relative URLs
            if (!/^(?:[a-z]+:)?\/\//i.test(href)) {
              $element.attr('src', basePath + href);
            }
          });

          element.append($text);
          scope.$emit('calaveraDocReady');

          Prism.highlightAll();
          anchors.add();
          $anchorScroll();

          scope.$emit('calaveraDocLoaded');
        }, function (response) {
          if (404 === response.status) {
          } else {
          }
        });
      }
    };
  }]);

'use strict';

/**
 * @ngdoc function
 * @name apiPlatformWebsite.controller:LayoutCtrl
 * @description
 * # LayoutCtrl
 * Controller of the apiPlatformWebsite
 */
angular.module('apiPlatformWebsite')
    .controller('LayoutCtrl', ["$scope", "$window", "$document", "$location", "$timeout", "$state", "$anchorScroll", function ($scope, $window, $document, $location, $timeout, $state, $anchorScroll) {
        var scrollSpy = function () {
            $timeout(function () {
                $scope.reducedClass = $document.scrollTop() <= 0 ? '' : 'reduced';
            });
        };

        var adaptFooter = function () {
            var $footer = angular.element($document[0].getElementById('footer'));

            if (!$document[0].getElementById('news') && $document[0].body.offsetHeight < $window.innerHeight) {
                $footer.addClass('fixed-footer');
            } else {
                $footer.removeClass('fixed-footer');
            }
        };

        $scope.$on('calaveraDocReady', adaptFooter);

        $scope.$on('$stateChangeSuccess', function () {
            // Fix the footer for small pages
            $timeout(adaptFooter);

            // Remove previous listener
            $document.off('scroll', scrollSpy);

            if ('homepage' === $state.current.name) {
                $timeout(function () {
                    $scope.reducedClass = '';
                    $anchorScroll();
                });

                $document.on('scroll', scrollSpy);
            } else {
                $timeout(function () {
                    $scope.reducedClass = 'reduced';
                });
            }
        });
    }]);

'use strict';

/**
 * @ngdoc function
 * @name apiPlatformWebsite.controller:DocCtrl
 * @description
 * # DocCtrl
 * Controller of the apiPlatformWebsite
 */
angular.module('apiPlatformWebsite')
    .controller('DocCtrl', ["$scope", "$location", "$anchorScroll", function ($scope, $location, $anchorScroll) {
        var path = $location.path();

        // Compute the JSON-LD document URL
        if ('/doc/' === path) {
            $scope.file = '/doc/1.0/index.jsonld';
        } else {
            $scope.file = path + ('/' === path.substring(path.length - 1, path.length) ? 'index' : '')  + '.jsonld';
        }

        // JSON support
        Prism.languages.json = Prism.languages.javascript;

        // Fixed header
        $anchorScroll.yOffset = 100;
    }]);

'use strict';

/**
 * @ngdoc function
 * @name apiPlatformWebsite.controller:DownloadCtrl
 * @description
 * # DownloadCtrl
 * Controller of the apiPlatformWebsite
 */
angular.module('apiPlatformWebsite')
  .controller('DownloadCtrl', ["$scope", "$window", "$document", function ($scope, $window, $document) {
      $scope.copy = function () {
        var elem = $document[0].getElementById('command');
        elem.select();

        try {
          if (!$document[0].execCommand('copy')) {
            $window.alert('Unable to copy. Do it manually.');
          }
        } catch (err) {
          $window.alert('Unable to copy. Do it manually.');
        }
      };
    }]);

'use strict';

/**
 * @ngdoc function
 * @name apiPlatformWebsite.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the apiPlatformWebsite
 */
angular.module('apiPlatformWebsite')
  .controller('NewsCtrl', ["$scope", "$document", "$timeout", function ($scope, $document, $timeout) {
    $timeout(function () {
        twttr.widgets.load();
    });
  }]);
