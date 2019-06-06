var url_literature = 'http://localhost:8443/articles';
var url_pubmed = 'http://localhost:8443/pubmed';
var url_crossref = 'http://localhost:8443/crossref';
var url_search = 'http://localhost:8443/search';

angular.module('articles.communication', []).factory('articlesCommunicationService', function ($http) {
    var getResumeNumbers = function () {
        return $http.get(url_literature + '/count?date=2014-01-01').then(function (response) {
            return response.data;
        });
    };
    
    var getArticleListByText = function (status, text, page, sortDirection, sortProperty, query) {
        if (query == null) {
            query = '';
        }

        return $http.get(url_literature + "/status/" + status + "?text=" + text
            + "&page=" + page + "&sortDirection=" + sortDirection + "&sortProperty=" + sortProperty + '&' + query).then(function (response) {
            return response.data;
        });
    };
    var saveArticle = function (id, article) {
        article.id = id;
        return $http.post(url_literature, article).then(function (response) {
            return response.data;
        });
    };
    var updateArticle = function (id, article) {
        return $http.put(url_literature + '/' + id, article).then(function (response) {
            return response.data;
        });
    };

    var update = function (id, field, object) {
        return $http.put(url_literature + '/' + id + '/' + field, object).then(function (response) {
            return response.data;
        });
    };
    

    var updateCollection = function (id, newArticleStatus) {
        return $http.put(url_literature + '/status/' + id
            + "?newArticleStatus=" + newArticleStatus).then(function (response) {
            return response.data;
        });
    };

    var updateSearch = function (id, search) {
        return $http.put(url_literature + '/search/' + id, search).then(function (response) {
            return response.data;
        });
    };

    var findArticle = function (id) {
        return $http.get(url_literature + '/' + id).then(function (response) {
            return response.data;
        });
    };

    var getPubMed = function (pmid, db) {
        return $http.get(url_pubmed + '?db=' + db + '&pmid=' + pmid).then(function (response) {
            return response.data;
        });
    };
    var getPMIDFromTitle = function (title) {
        return $http.get(url_pubmed + '/pmid?db=pubmed&title=' + title).then(function (response) {
            return response.data;
        });
    };
    var getCrossRef = function (doi) {
        return $http.get(url_crossref + '?doi=' + doi).then(function (response) {
            return response.data;
        });
    };
    var getPdf = function (id) {
        return $http.get(url_crossref + '/load/' + id, {responseType: 'arraybuffer'}).then(function (response) {
            return response.data;
        });
    };
    var downloadPdf = function (id, doi) {
        return $http.get(url_crossref + '/download/' + '?doi=' + doi + '&id=' + id + "&download=true").then(function (response) {
            return response.data;
        });
    };
    

    var countStatusReconstructions = function (expired) {
       
        return $http.get(url_literature + '/reconstructions/count?expired=' + expired).then(function (response) {
            return response.data;
        });
    };

    var getSpecificDetailsValues = function () {
        return $http.get(url_literature + '/reconstructions/specificDetails').then(function (response) {
            return response.data;
        });
    };
    var getObjectId = function () {
        return $http.get(url_literature + '/objectId').then(function (response) {
            return response.data;
        });
    };
    var createEmail = function (article, details, type) {
        return $http.post(url_emails + '?statusDetails=' + details + '&type=' + type, article).then(function (response) {
            return response.data;
        });
    };
    var getPortalList = function () {
        return $http.get(url_search + "/portals").then(function (response) {
            return response.data;
        });
    };
    var updatePortalList = function (portalList) {
        return $http.put(url_search + "/portals", portalList).then(function (response) {
            return response.data;
        });
    };
    var getLogList = function () {
        return $http.get(url_search + "/portals/log").then(function (response) {
            return response.data;
        });
    };
    var launchSearch = function (canceller) {
        return $http.get(url_search + "/start", {timeout: canceller.promise}).then(function (response) {
            return response.data;
        });
    };
    var stopSearch = function (canceller) {
        return $http.get(url_search + "/stop").then(function (response) {
            return response.data;
        });
    };
    var getKeyWordList = function () {
        return $http.get(url_search + "/keywords").then(function (response) {
            return response.data;
        });
    };
    var updateKeyWordList = function (keyWordList) {
        return $http.put(url_search + "/keywords", keyWordList).then(function (response) {
            return response.data;
        });
    };
    var deleteKeyWordList = function (keyWordIdList) {
        return $http.delete(url_search + "/keywords?ids=" + keyWordIdList).then(function (response) {
            return response.data;
        });
    };
    
    var removeArticle = function (id) {
        return $http.delete(url_literature + "/" + id).then(function (response) {
               
                        return response.data;
                                  
        });


    };
    return {
        getResumeNumbers: getResumeNumbers,
        getArticleListByText: getArticleListByText,
        saveArticle: saveArticle,
        updateArticle: updateArticle,
        updateCollection: updateCollection,
        findArticle: findArticle,
        getPubMed: getPubMed,
        getPMIDFromTitle: getPMIDFromTitle,
        getCrossRef: getCrossRef,
        getPdf: getPdf,
        downloadPdf: downloadPdf,
        countStatusReconstructions: countStatusReconstructions,
        getSpecificDetailsValues: getSpecificDetailsValues,
        getObjectId: getObjectId,
        createEmail: createEmail,
        getPortalList: getPortalList,
        updatePortalList: updatePortalList,
        getLogList: getLogList,
        launchSearch: launchSearch,
        stopSearch: stopSearch,
        getKeyWordList: getKeyWordList,
        updateKeyWordList: updateKeyWordList,
        deleteKeyWordList: deleteKeyWordList,
        removeArticle: removeArticle,
        update: update
    };

});
