(function(){
    'use strict';
    angular.module("myApp").controller("ViewVideosCtrl", function($scope, $timeout, VideoService, $sce){
    
        $scope.playerReady = playerReady;
    $scope.video = VideoService.getVideo();
    $scope.videos = VideoService.getFragments();
    $scope.currentFragment;
    $scope.playMainVideo = playMainVideo; 
    $scope.playFragment = playFragment;
    $scope.onUpdateTime = onUpdateTime;
    $scope.next = next;
    $scope.previous = previous;
    $scope.isPlayingMainVideo = false;
    $scope.waitTimeBeforeNext = 1000;
    $scope.isLoadingVideo = false;
    $scope.filterValue = "";
    $scope.filterVideos = filterVideos;
    $scope.onHotkeyPressed = onHotkeyPressed;
    $scope.config = {
        sources: [],
        theme: "/node_modules/videogular-themes-default/videogular.css"
    };

    function onHotkeyPressed(e){
        // Left
        if(e.which == 37){
            previous();
        }
        // Up
        else if(e.which == 38){
            previous();
        }
        // Right
        else if(e.which == 39){
            next();
        }
        // Down
        else if(e.which == 40){
            next();
        }
    }

    function playerReady($API){
        $scope.api = $API;

        if($scope.video.url){
            playMainVideo();

            $timeout(function(){
                $scope.endTime = $scope.api.totalTime/1000;
            }, 500);
        }
    }

    function playMainVideo(){
        $scope.api.stop();
        $scope.config.sources = [{src:$sce.trustAsResourceUrl($scope.video.url), type: "video/mp4"}];

        $scope.startTime = 0;
        $scope.endTime = $scope.api.totalTime/1000;
        $scope.isPlayingMainVideo = true;
        $scope.currentFragment = null;
        $timeout(function(){
            $scope.api.play();  
        }, 100);   
    }

    function playFragment(video){
        $scope.api.stop();
        $scope.config.sources = [{src:$sce.trustAsResourceUrl(video.url), type: "video/mp4"}];
        $scope.currentFragment = video;
        $scope.startTime = video.startTime;
        $scope.endTime = video.endTime;
        $scope.isPlayingMainVideo = false;
        $timeout(function(){
            $scope.api.play();
        }, 500);
    }

    function onUpdateTime($currentTime, $duration){
        if($scope.isPlayingMainVideo && $currentTime >= $duration && $scope.videos[0]){
            $scope.isLoadingVideo = true;
            $timeout(function(){
                playFragment($scope.videos[0]);
                $scope.isLoadingVideo = false;
            }, $scope.waitTimeBeforeNext);
            return;
        }
        else if(!$scope.isPlayingMainVideo && $scope.currentFragment && $currentTime >= $scope.currentFragment.endTime){
            next();
        }
    }

    // Plays the next video fragment from the playlist
    function next(){
        var nextFragment;
        $scope.api.stop();

        // Find the next fragment from the playlist that will be played
        if($scope.isPlayingMainVideo && $scope.videos.length > 0 || !$scope.isPlayingMainVideo && !$scope.currentFragment && $scope.videos.length >0 ){
            nextFragment = $scope.videos[0];
        }
        else{
            nextFragment = VideoService.getNextFragment($scope.currentFragment);
        }

        // Show the loader animation
        $scope.isLoadingVideo = true;
        $timeout(function(){
            // Hide the loader animation
            $scope.isLoadingVideo = false;
            // If we found the next fragment that needs to be played - play it
            if(nextFragment){
                $scope.currentFragment = nextFragment;
                playFragment(nextFragment);
            }
            // Else play the main video
            else{
                $scope.currentFragment = null;
                playMainVideo();   
            }
        }, $scope.waitTimeBeforeNext);
    }

    // Plays the previous video fragment from the playlist
    function previous(){
        var previousFragment;
        $scope.api.stop();

        // Find the previous fragment from the playlist that will be played
        if($scope.isPlayingMainVideo && $scope.videos.length > 0){
            previousFragment = $scope.videos[$scope.videos.length - 1];
        }else if($scope.currentFragment){
            previousFragment = VideoService.getPreviousFragment($scope.currentFragment);
        }

        // Show the loader animation
        $scope.isLoadingVideo = true;
        $timeout(function(){
            // If we found the previous fragment that needs to be played - play it
            if(previousFragment){
                $scope.currentFragment = previousFragment;
                playFragment(previousFragment);
            }
            // Else play the main video
            else{
                $scope.currentFragment = null;
                playMainVideo();
            }

            // Hide the loader animation
            $scope.isLoadingVideo = false;
        }, $scope.waitTimeBeforeNext);
    }

    function filterVideos(item){
        if($scope.filterValue.length > 0){
            for(var i=0; i<item.tags.length; i++){
                var filterTags = $scope.filterValue.split(" ");
                for(var j=0; j<filterTags.length; j++){
                    if(item.tags[i].toLowerCase().indexOf(filterTags[j].toLowerCase()) > -1){
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }
});
})();