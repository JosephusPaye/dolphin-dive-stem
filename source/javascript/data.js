// vim: set expandtab ts=4 sts=4 sw=4:
'use strict'; // Shows all errors and warnings

/**
 * Global DD object
 * 
 * Contains game state independent of Phaser
 */
var DD = {
    version: '0.1.0',

    objects: {
        spill: {
            speed: 250,
            element: null,
            collisionGroup: null,
            gradient: {
                element: null
            }
        },

        starfish: {
            amount: Helper.getRandomIntBetween(1, 4),
            elements: [],
            collectedIds: [],
            collisionGroup: null
        },

        junks: {
            amount: Helper.getRandomIntBetween(10, 15),
            elements: [],
            slow: 0.4,
            collisionGroup: null,
            active: false
        },

        nets: {
            amount: 200,
            elements: []
        }
    },

    textures: {
        layerA: null,
        layerB: null,
        layerC: null,
        waves: {
            element: null,
            collisionGroup: null
        },
        sand: {
            element: null,
            collisionGroup: null
        },
        speed: 50
    },

    player: {
        accelerationActive: false,
        speed: 300,
        vertSpeed: 300,
        element: null,
        collisionGroup: null,
        angle: 20
    },

    game: {
        gameOverCalled: false,
        firstRun: true,
        runEnd: false,
        cursors: null,

        world: {
            cleaningUp: false,
            lastGeneratedPosition: 0,
            level: 1,
            interval: 2000
        },

        score: {
            text: null,
            starfish: {
                text: null,
                lastRun: 0,
                total: 0
            },

            lastRun: 0,
            lastFrameValue: {
                starfish: 0,
                score: 0
            },
            highScores: []
        },

        modifiers: {
            total: 0,
            active: true,

            boost: {
                active: false,
                total: 200,
                begin: 0,
                charges: 1
            },

            multiplier: 1
        },

        audio: {
            junkCollide: null,
            GameSound: null
        }
    }
};

// Just a friendly reminder
console.info('Dolphin Dive v' + DD.version);

// Global game object
var game;
