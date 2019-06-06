angular.module('Articles').controller('ArticleDataController', function ($scope, $routeParams, $window, $filter, articlesCommunicationService) {
    $scope.error = '';
    $scope.radio = {
        status: 1,
        usage: [1]
    };
    $scope.usages = [
        {value: 1, text: 'Describing'},
        {value: 2, text: 'Using'},
        {value: 3, text: 'Citing'},
        {value: 4, text: 'About'}
    ];

    $scope.articleSaved = false;
    $scope.article = {};
    $scope.article.data = {}
    $scope.article.data.authorList = [];



    // Values for the metadata options
    articlesCommunicationService.getMetadataValues("tracingSystem").then(function (data) {
        $scope.tracingOptionList = data;
    }).catch(function () {
        $scope.error = 'Error updating metadata';
    });
    articlesCommunicationService.getSpecificDetailsValues().then(function (data) {
        $scope.reconstructionStatuses = data;
    });
    
    $scope.statuses = [
        {value: 1, text: 'Pending evaluation'},
        {value: 2, text: 'Positive'},
        {value: 3, text: 'Negative'},
        {value: 4, text: 'Inaccessible'}

    ];

    if ($routeParams.id !== undefined) {
        articlesCommunicationService.findArticle($routeParams.id).then(function (data) {
            $scope.articleSaved = true;
            $scope.article = data;
            var usage = [];
            $scope.usages.forEach(function (a) {
                if ($scope.article.data.dataUsage != null) {
                    $scope.article.data.dataUsage.forEach(function (b) {
                        if (a.text === b) {
                            usage.push(a.value);
                        }
                    });
                }
                else {
                    usage.push(1);
                }
            });
            $scope.radio = {
                usage: usage
            };
            if ($scope.article.data.authorList == null) {
                $scope.article.data.authorList = [];
            }
            if ($scope.article.status === 'Evaluated') {
                $scope.radio.text = $scope.article.metadata.articleStatus;

            } else {
                $scope.radio.text = $scope.article.status;
            }
           
            for (i = 0; i < $scope.statuses.length; i++) {
                if ($scope.statuses[i].text === $scope.radio.text) {
                    $scope.radio.value = $scope.statuses[i].value;
                }
            }
            if ($scope.article.metadata == null){
                $scope.article.metadata = {
                    'species':[],
                    'cellType': [], 
                    'brainRegion' : [],
                    'tracingSystem': []}
            }
        }).catch(function () {
            $scope.error = 'Error getting article details';
        });
    }

    $scope.opened = {};

    $scope.open = function ($event, elementOpened) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened[elementOpened] = !$scope.opened[elementOpened];
    };


    $scope.updateArticle = function () {
        $scope.error = '';
        $scope.article.data.dataUsage = [];
        $scope.usages.forEach(function (a) {
            $scope.radio.usage.forEach(function (b) {
                if (a.value === b) {
                    $scope.article.data.dataUsage.push(a.text);
                }
            });
        });
        if ($routeParams.id == null) {

            $scope.article.searchPortal = {'Manual': ['article added manually']};
            articlesCommunicationService.getObjectId().then(function (data) {
                $routeParams.id = data.id;
                articlesCommunicationService.saveArticle($routeParams.id, $scope.article).then(function () {
                    $scope.articleSaved = true;

                }).catch(function (response) {
                    if (response.status === 409) {
                        $scope.error = response.data.errorMessage;
                    } else {
                        $scope.error = 'Error updating article';
                    }
                });

            }).catch(function () {
                $scope.error = 'Error generating id for the new article';
            });
        } else {
            articlesCommunicationService.update($routeParams.id, "data", $scope.article.data).then(function () {
                $scope.articleSaved = true;

            }).catch(function (response) {
                if (response.status === 409) {
                    $scope.error = response.data.errorMessage;
                } else {
                    $scope.error = 'Error updating article';
                }
            });
        }
        var describingNeurons = false;
        $scope.article.data.dataUsage.forEach(function (element) {
            if (element === "Describing") {
                describingNeurons = true;
            }
        });

    };


    $scope.getPubMed = function (id, db) {

        $scope.error = '';
        articlesCommunicationService.getPubMed(id, db).then(function (data) {
            replaceData($scope, data);
        }).catch(function () {
            $scope.error = 'Unable to get pubMed data';
        });
    };
    $scope.getCrosRef = function () {

        $scope.error = '';
        articlesCommunicationService.getCrossRef($scope.article.data.doi).then(function (data) {
            replaceData($scope, data);
            if ($scope.article.data.pmid == null) {
                //getPmid from title
                articlesCommunicationService.getPMIDFromTitle(data.title).then(function (pmid) {
                    if ($scope.article.data.pmid !== null) {
                        $scope.article.data.pmid = pmid;
                    }
                });
            }
        }).catch(function () {
            $scope.error = 'DOI not found in Crosef';
        });
    };

    $scope.removeAuthor = function (index) {
        $scope.article.data.authorList.splice(index, 1);
    };

    $scope.addAuthor = function () {
        var author = {name: '', email: ''};
        $scope.article.data.authorList.push(author);
    };
    $scope.showUsage = function () {
        var selected = [];
        angular.forEach($scope.usages, function (s) {
            if ($scope.radio.usage.indexOf(s.value) >= 0) {
                selected.push(s.text);
            }
        });
        return selected.length ? selected.join(', ') : 'Not set';
    };


    $scope.opened = {};

    $scope.open = function ($event, elementOpened) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened[elementOpened] = !$scope.opened[elementOpened];
    };

    $scope.removeArticle = function () {
        if (confirm("You re about to remove the article, press OK to confirm otherwise press Cancel")) {
            articlesCommunicationService.removeArticle($routeParams.id).then(function () {
                $window.history.back();
                $scope.$emit('child'); // going up
                window.close();
                window.onunload = window.opener.location.reload();
            }).catch(function (response) {
                $scope.error = 'Error removing article';
            });

        } else {
        }
    };

    $scope.openPdf = function () {
        var file = new Blob([$scope.pdf], {type: 'application/pdf'});
        var fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
    };

    
    $scope.updateMetadata = function () {
        for (i = 0; i < $scope.statuses.length; i++) {
            if ($scope.statuses[i].value === $scope.radio.value) {
                $scope.radio.text = $scope.statuses[i].text;
            }
        }
        var collection = $scope.radio.text;

        if ($routeParams.review === '1') {
            $scope.article.metadata.articleStatus = collection;
            collection = 'Evaluated';
        }

        if ($scope.article.metadata.species["0"] !== undefined){
            var species = [];
            species.push($scope.article.metadata.species["0"]);
            $scope.article.metadata.species = species;
        } else{
            $scope.article.metadata.species = undefined;
        }
        if ($scope.article.metadata.cellType["0"] !== undefined){
            var cellType = [];
            cellType.push($scope.article.metadata.cellType["0"]);
            $scope.article.metadata.cellType = cellType;
        } else{
            $scope.article.metadata.cellType = undefined;
        }
        if ($scope.article.metadata.brainRegion["0"] !== undefined){
            var brainRegion = [];
            brainRegion.push($scope.article.metadata.brainRegion["0"]);
            $scope.article.metadata.brainRegion = brainRegion;
        } else{
            $scope.article.metadata.brainRegion = undefined;
        }
        if ($scope.article.metadata.tracingSystem["0"] !== undefined){
            var tracingSystem = [];
            tracingSystem.push($scope.article.metadata.tracingSystem["0"]);
            $scope.article.metadata.tracingSystem = tracingSystem;
        } else{
            $scope.article.metadata.tracingSystem = undefined;
        }

        articlesCommunicationService.update($routeParams.id, 'metadata', $scope.article.metadata).then(function () {
            if ($routeParams.collection !== collection) {
                articlesCommunicationService.updateCollection($routeParams.id, collection).then(function () {
                }).catch(function () {
                    $scope.error = 'Error updating collection';
                });
            }
        }).catch(function () {
            $scope.error = 'Error updating metadata';
        });

        var describingNeurons = false;
        $scope.article.data.dataUsage.forEach(function (element) {
            if (element === 'Describing') {
                describingNeurons = true;
            }
        });
    };

    $scope.showStatus = function () {
        return $scope.radio.text !== undefined ? $scope.radio.text : 'Not set';

        /* var selected = $filter('filter')($scope.statuses, {value: $scope.radio.status});
         console.log(selected);
         return ($scope.radio.status && selected.length) ? selected[0].text : 'Not set';*/

    };


    // filter reconstructions to show
    $scope.filterStatusReconstructions = function (statusReconstructions) {
        return statusReconstructions.isDeleted !== true;
    };


    // mark statusReconstructions as deleted
    $scope.deleteStatusReconstructions = function (id) {
        var filtered = $filter('filter')($scope.article.reconstructions.reconstructionsList, {id: id});
        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add statusReconstructions
    $scope.addStatusReconstructions = function () {
        if ($scope.article.reconstructions == null) {
            $scope.article.reconstructions = {};
            $scope.article.reconstructions.reconstructionsList = [];
        }

        $scope.article.reconstructions.reconstructionsList.push({
            id: $scope.article.reconstructions.reconstructionsList.length + 1,
            statusDetails: null,
            nReconstructions: 1,
            expirationDate: null,
            date: new Date(),
            isNew: true

        });
    };

    $scope.cancelReconstructions = function () {
        for (var i = $scope.article.reconstructions.reconstructionsList.length; i--;) {
            var statusReconstructions = $scope.article.reconstructions.reconstructionsList[i];
            // undelete
            if (statusReconstructions.isDeleted) {
                delete statusReconstructions.isDeleted;
            }
            // remove new 
            if (statusReconstructions.isNew) {
                $scope.article.reconstructions.reconstructionsList.splice(i, 1);
            }
        }
        ;
    };

    // save edits
    $scope.saveStatusReconstructions = function () {
        for (var i = $scope.article.reconstructions.reconstructionsList.length; i--;) {
            var statusReconstructions = $scope.article.reconstructions.reconstructionsList[i];
            // actually delete user
            if (statusReconstructions.isDeleted) {
                $scope.article.reconstructions.reconstructionsList.splice(i, 1);
            }
            // mark as not new 
            if (statusReconstructions.isNew) {
                statusReconstructions.isNew = false;
            }

        }

        // send on server
        articlesCommunicationService.update($routeParams.id, 'reconstructions', $scope.article.reconstructions).then(function (data) {
        }).catch(function () {
            $scope.error = 'Unable to save the status reconstructions ';
        });
    };

    $scope.opened = {};

    $scope.open = function ($event, elementOpened) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened[elementOpened] = !$scope.opened[elementOpened];
    };

    $scope.filterShared = function (sharedList) {
        return sharedList.isDeleted !== true;
    };
    
    // mark shared as deleted
    $scope.deleteShared = function (id) {
        console.log($scope.article.sharedList);
        var filtered = $filter('filter')($scope.article.sharedList, {id: id});
        console.log(filtered);

        if (filtered.length) {
            filtered[0].isDeleted = true;
        }
    };

    // add shared
    $scope.addShared = function () {
        if ($scope.article.sharedList == null) {
            $scope.article.sharedList = [];
        }
        $scope.article.sharedList.push({
            i: $scope.article.sharedList.length + 1,
            id: null,
            pmid: null,
            title: null,
            isNew: true,
            articleFound: false,
            articleNotFound : false

        });
    };
    $scope.findArticlesByText = function (text, collection, i) {
        var sortDirection = 'DESC';
        var sortProperty = 'data.publishedDate';
        if (text !== undefined) {
            articlesCommunicationService.getArticleListByText(collection, text, 0, sortDirection, sortProperty).then(function (data) {
                $scope.article.sharedList[i].articleFound = false;
                $scope.article.sharedList[i].articleNotFound = false;

                $scope.articlePage = data;

                if ($scope.articlePage.totalElements > 0){
                    $scope.article.sharedList[i].pmid =  $scope.articlePage.content[0].data.pmid;
                    $scope.article.sharedList[i].title =  $scope.articlePage.content[0].data.title;
                    $scope.article.sharedList[i].id =  $scope.articlePage.content[0].id;
                    $scope.article.sharedList[i].articleFound = true;
                }else{
                    $scope.article.sharedList[i].pmid = null;
                    $scope.article.sharedList[i].title = null;
                    $scope.article.sharedList[i].id = null
                    $scope.article.sharedList[i].articleNotFound = true;
                }

            });
        }
    }
    // cancel all changes
    $scope.cancelShared = function () {
        for (var i = $scope.article.sharedList.length; i--;) {
            var shared = $scope.article.sharedList[i];
            // undelete
            if (shared.isDeleted) {
                delete shared.isDeleted;
            }
            // remove new 
            if (shared.isNew) {
                $scope.article.sharedList.splice(i, 1);
            }
        }
        ;
    };

    // save edits
    $scope.saveShared = function () {
        
        for (var i = $scope.article.sharedList.length; i--;) {
            var sharedReconstructions = $scope.article.sharedList[i];
            // actually delete user
            if (sharedReconstructions.isDeleted) {
                $scope.article.sharedList.splice(i, 1);
            }
            // mark as not new 
            if (sharedReconstructions.isNew) {
                sharedReconstructions.isNew = false;
            }

        }
        // send on server
        articlesCommunicationService.update($routeParams.id, "sharedList", $scope.article.sharedList).then(function (data) {
        }).catch(function () {
            $scope.error = 'Unable to save the shared reconstructions ';
        });
    };

});


var replaceData = function (scope, data) {
    if (scope.article.data.title == null || scope.article.data.title != data.title) {
        scope.article.data.title = data.title;
    }
    if (scope.article.data.pmid == null) {
        scope.article.data.pmid = data.pmid;
    }
    if (scope.article.data.pmcid == null) {
        scope.article.data.pmcid = data.pmcid;
    }
    if (scope.article.data.doi == null || scope.article.data.title != data.doi) {
        scope.article.data.doi = data.doi;
    }
    if (scope.article.data.journal == null || scope.article.data.title != data.journal) {
        scope.article.data.journal = data.journal;
    }
    if (scope.article.data.authorList.length != data.authorList.length) {
        scope.article.data.authorList = data.authorList;
    }
    for (i = 0; i < scope.article.data.authorList.length; i++) {
        if (scope.article.data.authorList[i].email == null) {
            scope.article.data.authorList[i].email = data.authorList[i].email;
        }
    }
    if (scope.article.data.publishedDate == null || scope.article.data.title != data.publishedDate) {
        scope.article.data.publishedDate = new Date(data.publishedDate);
    }

};

