// vim: set expandtab ts=4 sts=4 sw=4:
'use strict'; // Shows all errors and warnings

/**
 * Global DD object
 * 
 * Contains game state independent of Phaser
 */
var DDBlueprint = {
    version: '1.0.0',

    objects: {
        spill: {
            element: null,
            collisionGroup: null,
            gradient: {
                element: null
            }
        },

        starfish: {
            amount: Helper.getRandomIntBetween(1, 2),
            elements: [],
            collectedIds: [],
            collisionGroup: null
        },

        junks: {
            amount: Helper.getRandomIntBetween(5, 10),
            elements: [],
            slow: 0.4,
            collisionGroup: null,
            active: false
        },

        nets: {
            amount: Helper.getRandomIntBetween(0, 1),
            elements: [],
            collisionGroup: null
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
        vertSpeed: 500,
        element: null,
        collisionGroup: null,
        angle: 20,
        speedUp: null,
        barrier: {
            element: null
        }
    },

    game: {
        gameOverCalled: false,
        gameEndCalled: false,
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
            slow: 0,
            total: 0,
            active: true,

            boost: {
                active: false,
                total: 2.5,
                begin: 0,
                charges: 0
            },

            newBoost: {
                active: false,
                amount: 2.5,
                startX: 0,
                originalSpeed: 0
            },

            multiplier: 1
        },

        audio: {
            junkCollide: null,
            GameSound: null,
            bottle: null,
            barrel: null,
            plasticBag: null
        }
    }
};

var DD = jQuery.extend(true, {}, DDBlueprint);

// Just a friendly reminder
console.info('Dolphin Dive v' + DD.version);

// Global game object
var game;
