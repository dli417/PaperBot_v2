var articles = angular.module('Articles', ['ngRoute', 'ui.bootstrap', 'xeditable', 'checklist-model', 'articles.communication', 'articles.service']);


function articlesRouteConfig($routeProvider) {
    $routeProvider.when('/articles/:collection/:review/:date', {
        controller: 'ArticlesController',
        templateUrl: 'articles.html'
    }).when('/addArticle', {
        controller: 'ArticleDataController',
        templateUrl: '../article/article.html'
    }).when('/review/:collection/:review/:date', {
        controller: 'ArticlesController',
        templateUrl: 'reviewEvaluatedArticles.html'
    }).when('/article/:collection/:id/:review', {
        controller: 'ArticleDataController',
        templateUrl: '../article/article.html'
    }).when('/positiveArticles/:collection/:usage', {
        controller: 'ArticlesController',
        templateUrl: 'positiveArticles.html'
    }).otherwise({
        redirectTo: '/articles/:collection/:review'
    });
}

articles.config(articlesRouteConfig);

articles.controller('Controller', function ($scope, articlesCommunicationService, articlesService) {
    $scope.count = {};
    $scope.emails = {};

    articlesService.getCountArticles($scope, articlesCommunicationService);
    articlesService.getCountReconstructions($scope, articlesCommunicationService);
    $scope.$on('child', function (event, data) {
        articlesService.getCountArticles($scope, articlesCommunicationService);
    });


});


