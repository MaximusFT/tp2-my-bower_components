angular.module('perfect_scrollbar', []).directive('perfectScrollbar', ['$parse', '$window', function($parse, $window) {
    var psOptions = [
        'wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'useBothWheelAxes',
        'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset',
        'scrollYMarginOffset', 'includePadding', 'scrollDown' //, 'onScroll'
    ];

    return {
        restrict: 'EA',
        transclude: true,
        template: '<div><div ng-transclude></div></div>',
        replace: true,
        link: function($scope, $elem, $attr) {
            var jqWindow = angular.element($window);
            var options = {};

            for (var i = 0, l = psOptions.length; i < l; i++) {
                var opt = psOptions[i];
                if ($attr[opt] !== undefined) {
                    options[opt] = $parse($attr[opt])();
                }
            }

            $scope.$evalAsync(function() {
                $elem.perfectScrollbar(options);
                var onScrollHandler = $parse($attr.onScroll)
                $elem.scroll(function() {
                    var scrollTop = $elem.scrollTop()
                    var scrollHeight = $elem.prop('scrollHeight') - $elem.height()
                    $scope.$apply(function() {
                        onScrollHandler($scope, {
                            scrollTop: scrollTop,
                            scrollHeight: scrollHeight
                        })
                    })
                });
            });

            function update(event) {
                //console.log(event, $attr.scrollDown);
                $scope.$evalAsync(function() {
                    if (event != 'mouseenter') {
                        setTimeout(function() {
                            $($elem).scrollTop($($elem).prop("scrollHeight"));
                        }, 100);
                    }
                    $elem.perfectScrollbar('update');
                });

                // This is necessary if you aren't watching anything for refreshes
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }

            // This is necessary when you don't watch anything with the scrollbar
            $elem.bind('mouseenter', update('mouseenter'));

            // Possible future improvement - check the type here and use the appropriate watch for non-arrays
            if ($attr.refreshOnChange) {
                $scope.$watchCollection($attr.refreshOnChange, function(newVal) {
                    var resetTop = false;
                    update();
                    if ($attr.scrollbarId === 'dialog') {
                        if (!$scope.firstElementOfDialogModel || (newVal.length > 0 && JSON.stringify($scope.firstElementOfDialogModel) !== JSON.stringify(newVal[0]))) {
                            resetTop = true;
                            $scope.firstElementOfDialogModel = newVal[0];
                        }
                    }
                    if ($attr.scrollbarId === 'channel') {
                        if (!$scope.firstElementOfChannelModel || (newVal.length > 0 && JSON.stringify($scope.firstElementOfChannelModel) !== JSON.stringify(newVal[0]))) {
                            resetTop = true;
                            $scope.firstElementOfChannelModel = newVal[0];
                        }
                    }
                    if (resetTop) {
                        $elem.prop('scrollHeight', 500);
                        $elem.prop('scrollTop', 0);
                    }
                    //console.log('updating', $elem);
                    //$elem.prop('scrollHeight', 500);
                    //$elem.prop('scrollTop', 0);
                    //console.log('updated', $elem);
                }, true);
            }

            // this is from a pull request - I am not totally sure what the original issue is but seems harmless
            if ($attr.refreshOnResize) {
                jqWindow.on('resize', update);
            }

            $elem.bind('$destroy', function() {
                jqWindow.off('resize', update);
                $elem.perfectScrollbar('destroy');
            });

        }
    };
}]);
