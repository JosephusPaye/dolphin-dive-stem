console.log('It\'s working');

var game = new Phaser.Game(800, 450, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('sky', '/assets/images/Background.jpg');
}

function create() {
	game.add.sprite(0, 0, 'sky' )
}

function update() {
}