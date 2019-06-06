angular.module('Articles').controller('ArticlesController', function ($window, $scope, $routeParams, articlesCommunicationService, articlesService) {
    $scope.collectionList = ['All', 'Positive', 'Negative', 'Inaccessible', 'Pending evaluation', 'Evaluated'];
    $scope.currentPage = 1;
    $scope.sortDirection = 'DESC';
    $scope.sortProperty = 'data.publishedDate';
    $scope.query = '';
    $scope.text = '';
    $scope.review = $routeParams.review;
    $scope.collection = $routeParams.collection;


    $scope.isValidArticle = function (article) {
        var valid = false;
        article.data.authorList.forEach(function(author) {
            console.log (author);
            if (author.email !== null && author.email.includes('@')){
                valid = true;
            }
        });
        
        return valid;
    }
    $scope.findArticlesByText = function () {
        if ($routeParams.collection === 'Positive' && $routeParams.collection != null) {
            $scope.query = "&data.dataUsage=" + $routeParams.usage;
        }
        if ($routeParams.date != undefined && $routeParams.date!=='na'){
            $scope.query=$scope.query+ '&data.publishedDate=' + $routeParams.date;
        }
        articlesService.findArticles($scope, $scope.collection, articlesCommunicationService);
    };
    if ($routeParams.collection === 'Positive') {
        articlesCommunicationService.getSpecificDetailsValues().then(function (data) {
            $scope.detailsCategoryList = data;
        }).catch(function () {
            $scope.error = 'unable to get the status details values';
        });
    }
    $scope.findArticlesByText($scope.text);

    $scope.setPage = function () {
        $scope.findArticlesByText($scope.text);
    };

    $scope.getKeyWordSet = function (portalList) {
        var keyWordSet = new Set();
        if (portalList != null) {
            Object.keys(portalList).forEach(function (key, index) {
                keyWordSet.add(portalList[key]);
            });
        } else {
            keyWordSet.add("Article added manually");
        }
        var keyWordArray = [];
        keyWordSet.forEach(function (element) {
            keyWordArray.push(element);
        });
        return keyWordArray;
    };

    $scope.acceptEvaluatedArticle = function (id, metadata, index) {
        var articleStatus = metadata.articleStatus;
        metadata.articleStatus = null;
        articlesCommunicationService.updateCollection(id, articleStatus).then(function () {
            $scope.$emit('child'); // going up!
            $scope.articlePage.content.splice(index, 1);
            $scope.articlePage.totalElements--;
            $scope.lastElement--;
        }).catch(function () {
            $scope.error = 'Error accepting article! DUPLICATE!';
        });

    };

    $scope.getArticlesBy = function (sortProperty) {
        if ($scope.sortDirection === 'ASC') {
            $scope.sortDirection = 'DESC';
        } else {
            $scope.sortDirection = 'ASC';
        }
        $scope.sortProperty = sortProperty;
        $scope.findArticlesByText($scope.text);
    };

    $scope.filterReconstructionsStatus = function () {
        $scope.query = 'reconstructions.currentStatusList.specificDetails=' + $scope.filterDetails;
        articlesService.findArticles($scope, $scope.collection, articlesCommunicationService);
    };

    $scope.submitStatus = function (article) {
        articlesCommunicationService.update(article.id, 'reconstructions', article.reconstructions).then(function (data) {
            article.updated = true;
        }).catch(function () {
            article.error = true;
        });

    };
    $scope.submitStatusList = function (pmidList, statusDetailsFrom, statusDetailsTo) {
        $scope.statusListUpdatedError = false;
        $scope.statusListUpdated = false;
        pmidList.values.forEach(function (pmid) {
            var error = "Articles not found in DB: ";
            //find article
            articlesCommunicationService.getArticleListByText($scope.collection, pmid, $scope.currentPage - 1, $scope.sortDirection, $scope.sortProperty, $scope.query).then(function (data) {
                if (data.totalElements == 0) {
                    $scope.statusListUpdatedError = true;
                    console.log(error + pmid);
                }
                var article = data.content[0];
                article.reconstructions.reconstructionsList.forEach(function (status) {
                    if (status.statusDetails === statusDetailsFrom) {
                        status.statusDetails = statusDetailsTo;
                    }
                });
                articlesCommunicationService.update(article.id, 'reconstructions', article.reconstructions).then(function (data) {
                    $scope.statusListUpdated = true;
                }).catch(function () {
                    $scope.statusListUpdatedError = true;
                });

            }).catch(function () {
                $scope.statusListUpdatedError = true;
            });

        });

    };
    $scope.update = function (article) {
        article.changed = true;
    };


})
;

