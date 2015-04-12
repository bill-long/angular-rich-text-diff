/// <reference path="bower_components/dt-angular/angular.d.ts"/>
/// <reference path="google-diff-match-patch.d.ts"/>
var AngularRichTextDiff;
(function (AngularRichTextDiff) {
    'use strict';

    var RichTextDiffController = (function () {
        function RichTextDiffController($scope, $sce) {
            this.$scope = $scope;
            this.$sce = $sce;
            this.unicodeRangeStart = 0xE000;
            this.tagMap = [];
            this.dmp = new diff_match_patch();
            this.doDiff();
        }
        RichTextDiffController.prototype.doDiff = function () {
            var diffableLeft = this.convertHtmlToDiffableString(this.$scope.left);
            var diffableRight = this.convertHtmlToDiffableString(this.$scope.right);
            var diffs = this.dmp.diff_main(diffableLeft, diffableRight);
            this.dmp.diff_cleanupSemantic(diffs);
            this.$scope.diffOutput = '';
            for (var x = 0; x < diffs.length; x++) {
                var outputString = this.convertDiffableBackToHtml(diffs[x][1]);
                if (diffs[x][0] === 1) {
                    // This is an add
                    this.$scope.diffOutput += '<ins>' + outputString + '</ins>';
                } else if (diffs[x][0] === -1) {
                    // This is a delete
                    this.$scope.diffOutput += '<del>' + outputString + '</del>';
                } else {
                    this.$scope.diffOutput += outputString;
                }
            }

            this.$scope.diffOutput = this.$sce.trustAsHtml(this.$scope.diffOutput);
        };

        RichTextDiffController.prototype.convertHtmlToDiffableString = function (htmlString) {
            var diffableString = '';

            var offset = 0;
            while (offset < htmlString.length) {
                var tagStart = htmlString.indexOf('<', offset);
                if (tagStart < 0) {
                    diffableString += htmlString.substr(offset);
                    break;
                } else {
                    var tagEnd = htmlString.indexOf('>', tagStart);
                    if (tagEnd < 0) {
                        // Invalid HTML
                        // Truncate at the start of the tag
                        console.log('Invalid HTML. String will be truncated.');
                        diffableString += htmlString.substr(offset, tagStart - offset);
                        break;
                    }

                    var tagString = htmlString.substr(tagStart, tagEnd + 1 - tagStart);

                    // Is this tag already mapped?
                    var unicodeCharacter = '';
                    for (var x = 0; x < this.tagMap.length; x++) {
                        if (this.tagMap[x].tag === tagString) {
                            unicodeCharacter = this.tagMap[x].unicodeReplacement;
                            break;
                        }
                    }

                    if (unicodeCharacter === '') {
                        // Nope, need to map it
                        unicodeCharacter = String.fromCharCode(this.unicodeRangeStart + this.tagMap.length);
                        this.tagMap.push({
                            tag: tagString,
                            unicodeReplacement: unicodeCharacter
                        });
                    }

                    // At this point it has been mapped, so now we can use it
                    diffableString += htmlString.substr(offset, tagStart - offset);
                    diffableString += unicodeCharacter;

                    offset = tagEnd + 1;
                }
            }

            return diffableString;
        };

        RichTextDiffController.prototype.convertDiffableBackToHtml = function (diffableString) {
            var htmlString = '';

            for (var x = 0; x < diffableString.length; x++) {
                var charCode = diffableString.charCodeAt(x);
                if (charCode < this.unicodeRangeStart) {
                    htmlString += diffableString[x];
                    continue;
                }

                var tagString = '';
                for (var y = 0; y < this.tagMap.length; y++) {
                    if (this.tagMap[y].unicodeReplacement === diffableString[x]) {
                        tagString = this.tagMap[y].tag;
                        break;
                    }
                }

                if (tagString === '') {
                    // We somehow have a character that is above our range but didn't map
                    // Do we need to add an upper bound or change the range?
                    htmlString += diffableString[x];
                } else {
                    htmlString += tagString;
                }
            }

            return htmlString;
        };
        RichTextDiffController.$inject = ['$scope', '$sce'];
        return RichTextDiffController;
    })();

    function richTextDiff() {
        var directive = {
            restrict: 'E',
            scope: {
                left: '=left',
                right: '=right'
            },
            template: '<div ng-bind-html="diffOutput"></div>',
            controller: RichTextDiffController
        };

        return directive;
    }

    angular.module('angular-rich-text-diff', ['ngSanitize']);

    angular.module('angular-rich-text-diff').directive('richTextDiff', richTextDiff);
})(AngularRichTextDiff || (AngularRichTextDiff = {}));
