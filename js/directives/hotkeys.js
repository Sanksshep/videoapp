'use strict';

/*
    Usage: <div hotkeys hotkeys-pressed='onHotkeyPressed(event)'></div>
        Attributes:
        - hotkeys-pressed: callback function that is called when the user presses any key on the keyboard.
*/
myApp.directive('hotkeys', function ($timeout) {
    return {
        restrict:'A',
        scope: { 
        	hotkeyPressed: '&'
        },
        link:function (scope, element, attrs, ctrl) {
            // We bind the JQuery keyup event on the document object
            $(document).keyup(function(e){
                scope.hotkeyPressed({event: e});
            });
        }
    }
});