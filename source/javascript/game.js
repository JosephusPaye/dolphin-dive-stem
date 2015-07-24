var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('background', '/assets/images/BackgroundStatic.png');
    game.load.image('sky', '/assets/images/sky.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.image('oilspillfront', '/assets/images/GradientOil.png')
    game.load.spritesheet('dude', '/assets/images/dude.png', 32, 48);
}

var player;
var cursors;
var spill;
var spillfront;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.tileSprite(0, 0, 19200, 1080, 'background');
    game.add.tileSprite(0, 0, 19200, 1080, 'seafloor');
    game.world.setBounds(0, 0, 19200, 1080);


    // The player and its settings
    player = game.add.sprite(20, game.world.centerY, 'dude');
    spill = game.add.sprite(-3100, 0, 'oilspill');
    spillfront = game.add.sprite(-800, 0, 'oilspillfront');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(spill);
    game.physics.arcade.enable(spillfront);
    //  Player physics properties. Give the little guy a slight bounce.
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    spill.body.velocity.x = 200;
    spillfront.body.velocity.x = 200;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -300;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 300;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();
    }
    if (cursors.down.isDown)
    {
    	//	Move downwards
    	player.body.velocity.y = 300;
    }
    if (cursors.up.isDown)
    {
    	//	Move upwards
    	player.body.velocity.y = -300;
    }
}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}