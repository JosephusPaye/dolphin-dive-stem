var Helper = {};

(function() {

    // Export functions
    Helper.getRandomIntBetween = getRandomIntBetween;
    Helper.restoreSavedValues = restoreSavedValues;
    Helper.isVisible = isVisible;

    /**
     * Check if a sprite is visible on screen
     * or to the right of the player
     * 
     * @param  {Phaser.Sprite}  junk
     * @return {Boolean}
     */
    function isVisible(junk) {
        return junk.x > ( DD.player.element.x - (game.camera.width / 2) ); 
    }

    /**
     * Get a random integet between min
     * and max (inclusive)
     * 
     * @param  {Integer} min
     * @param  {Integer} max
     * @return {Integer}
     */
    function getRandomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Restore saved values from local storage
     */
    function restoreSavedValues() {
        var highScores;
        var starfish;

        if (!simpleStorage.canUse()) {
            console.error('Local storage not available');
            return;
        }

        // Restore high scores
        highScores = simpleStorage.get('highScores');
        if (highScores) {
            DD.game.score.highScores = highScores;
        }

        // Restore starfish count
        starfish = simpleStorage.get('starfish');
        if (starfish) {
            DD.game.score.starfish.total = starfish;
        }
    }

})();
