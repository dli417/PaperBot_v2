angular.module('articles.service', []).factory('articlesService', function () {
    var getCountArticles = function (scope, articlesCommunicationService) {
        scope.count = {};
        articlesCommunicationService.getResumeNumbers().then(function (data) {
            scope.count = data;

        }).catch(function () {
            scope.error = 'unable to get the articles resume numbers';
        });
        articlesCommunicationService.getLogList().then(function (data) {
            scope.log = data[0];
        }).catch(function () {
            scope.error = 'unable to get the articles resume numbers';
        });

    };
    var getCountReconstructions = function (scope, articlesCommunicationService) {
        articlesCommunicationService.countStatusReconstructions(false).then(function (data) {
            scope.reconstructions = data;
            scope.count.totalReconstructions = 0;
            scope.total = [];
            scope.total.push({status: 'Available', nArticles: 0, nReconstructions: 0, nSharedArticles: 0});
            scope.total.push({status: 'Not available', nArticles: 0, nReconstructions: 0, nSharedArticles: 0});
            scope.total.push({
                status: 'Determining availability',
                nArticles: 0,
                nReconstructions: 0,
                nSharedArticles: 0
            });
            scope.reconstructions.forEach(function (obj) {
                scope.count.totalReconstructions += obj.nReconstructions;
                scope.total.forEach(function (t) {
                    if (t.status === obj.status) {
                        t.nReconstructions += obj.nReconstructions;
                        t.nArticles += obj.nArticles;
                        t.nSharedArticles += obj.nSharedArticles;

                    }
                });
            });


        }).catch(function () {
            scope.error = 'unable to get the positive articles resume numbers';
        });

    };
    var getCountReconstructionsExpired = function (scope, articlesCommunicationService) {
        articlesCommunicationService.countStatusReconstructions(true).then(function (data) {
            scope.reconstructionsExpired = data;

        }).catch(function () {
            scope.error = 'unable to get the positive articles resume numbers';
        });

    };
    var findArticles = function (scope, collection, articlesCommunicationService) {
        articlesCommunicationService.getArticleListByText(collection, scope.text, scope.currentPage - 1, scope.sortDirection, scope.sortProperty, scope.query).then(function (data) {
            scope.articlePage = data;
            calculatePages(scope);

        }).catch(function () {
            scope.error = 'unable to get the article list';
        });

    };

    var calculatePages = function (scope) {
        scope.firstElement = (scope.currentPage - 1) * (scope.articlePage.size) + 1;
        if (scope.articlePage.last) {
            scope.lastElement = scope.articlePage.totalElements;
        } else {
            scope.lastElement = scope.currentPage * scope.articlePage.numberOfElements;
        }
    };

    return {
        getCountArticles: getCountArticles,
        getCountReconstructions: getCountReconstructions,
        getCountReconstructionsExpired: getCountReconstructionsExpired,
        findArticles: findArticles,
        calculatePages: calculatePages
    };

});
