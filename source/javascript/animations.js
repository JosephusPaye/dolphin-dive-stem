/**
 * Controls the playback of animations
 * 
 * @type {Object}
 */
var PlayAnimations = {
    // Main Menu animations
    mainMenu: function() {
        // Animate menu title
        TweenMax.from('#mainMenu h1', 1, {
            scale: 0.6,
            ease: Bounce.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#mainMenu li', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    },

    // High Scores menu animations
    highScoresMenu: function() {
        // Animate scores
        TweenMax.staggerFrom('#highScoresMenu-list div', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#highScoresMenu li', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    },

    // Pause Menu animations
    pauseMenu: function() {
        // Animate buttons
        TweenMax.staggerFrom('#pauseMenu li', 0.3, {
            y: 75,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    },

    gameOverMenu: function() {
        // Animate menu title
        TweenMax.from('#gameOverMenu h1', 1, {
            scale: 0.4,
            ease: Bounce.easeOut
        }, 0.1);

        // Animate buttons
        TweenMax.staggerFrom('#gameOverMenu li', 0.3, {
            y: 100,
            opacity: 0,
            ease: Back.easeOut
        }, 0.1);
    }
};
