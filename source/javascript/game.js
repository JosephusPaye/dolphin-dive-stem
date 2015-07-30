var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.image('background', '/assets/images/BackgroundStatic.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.image('seafloor', '/assets/images/SeaFloor.png');
    game.load.image('oilspill', '/assets/images/OilSpill.png');
    game.load.image('oilspillfront', '/assets/images/GradientOil.png');
    game.load.spritesheet('dude', '/assets/images/Dolphin.png', 235, 96);
}
// Setting all the variables
var player;
var cursors;
var spill;
var spillFront;
var deathAlert;
var obstacles;
var junkMaker;
var angle;
var angleCompensation;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);


    // Adding of background for our game
    game.add.tileSprite(0, 0, 19200, 1080, 'background');
    game.add.tileSprite(0, 0, 19200, 1080, 'seafloor');

    //Set boundaries of the game world
    game.world.setBounds(0, 0, 19200, 1080);

    // Grouping of the objects
    oilSpill = game.add.group();
    oilSpill.enableBody = true;

    // Adding of the objects
    spill = oilSpill.create(-3100, 0, 'oilspill');
    spillFront = oilSpill.create(-800, 0, 'oilspillfront');
    player = game.add.sprite(20, game.world.centerY, 'dude');
    point = game.add.sprite(20, game.world.centerY, 'star');

    //  Enable physics on each of the objects
    game.physics.p2.enable(player);

    //  Player physics properties.

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2], 6, true);
    player.animations.add('right', [4, 3, 5], 6, true);

    // junkMaker = game.add.emitter(1, 1, 5000);
    // junkMaker.area = new Phaser.Rectangle(game.camera.x, 1, 10, 1080);
    // junkMaker.enableBody = true;
    // junkMaker.frequency = 1000;
    // junkMaker.maxRotation = 20;
    // junkMaker.minRotation = 20;
    // junkMaker.lifespan = 10000000;
    // junkMaker.makeParticles('star');
    // junkMaker.bounce.setTo(0.5, 0.5);
    // junkMaker.gravity = 0;
    // junkMaker.on = true;


    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

	// junkMaker.x = game.camera.x  + 850;

 //    //Collisions
 //    game.physics.arcade.collide(player, junkMaker);
 //    game.physics.arcade.overlap(player, spill, gameOver, null, this);

    //  Reset the players velocity (movement)
    spill.body.velocity.x = 200;
    spillFront.body.velocity.x = 200;

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    angle = 45;

    if (cursors.left.isDown) 
    {
    	player.body.velocity.x = -300;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    else if (cursors.right.isDown)
    {
    	player.body.velocity.x = 300;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else 
    {
    	player.body.velocity.x = 0;
    }
    if (cursors.up.isDown)
    {
    	if (angleCompensation === false){
    		angle = angle*(-1);
    	}
    	player.body.angle = angle;
    	player.body.velocity.y = -300;
    }
    else if (cursors.down.isDown)
    {
    	if (angleCompensation === true){
    		angle = angle*(-1);
    	}
    	player.body.angle = angle;
    	player.body.velocity.y = 300;
    }
    else
    {
    	player.body.angle = 0;
    }
    if (cursors.down.isDown && cursors.right.isDown) 
    {
    	player.body.velocity.y = 300;
    	player.body.velocity.x = 300;
    	player.body.angle = 45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.down.isDown && cursors.left.isDown) 
    {
    	player.body.velocity.y = 300;
    	player.body.velocity.x = -300;
    	player.body.angle = -45;
    	player.animations.play('left');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.right.isDown) 
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = 300;
    	player.body.angle = -45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.left.isDown)
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = -300;
    	player.body.angle = 45;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    // if (game.physics.arcade.collide(player, junkMaker) === true)
    // {
    // 	deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Its touching me!', { fontSize: '32px', fill: '#FFF' });
    // }
}

// function gameOver(player, spill) {
//     deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Game Over', { fontSize: '32px', fill: '#FFF' });
// }

function render(argument) {
	game.debug.body(player);
}