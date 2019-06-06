var articlesResumeModule = angular.module('ArticlesResume', ['articles.communication', 'articles.service']);

articlesResumeModule.controller('articles.controller', function ($scope, articlesCommunicationService, articlesService) {
    $scope.emails = {};
    $scope.count = {};
    articlesService.getCountArticles($scope, articlesCommunicationService);
    articlesService.getCountReconstructions($scope, articlesCommunicationService);
    articlesService.getCountReconstructionsExpired($scope, articlesCommunicationService)
});
