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
var result;
var speed = 300;
var x = 2000;
var level = 1;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);


    // Adding of background for our game
    game.add.tileSprite(0, 0, 192000, 1080, 'background');
    game.add.tileSprite(0, 0, 192000, 1080, 'seafloor');

    //Set boundaries of the game world
    game.world.setBounds(0, 0, 192000, 1080);

    // Grouping of the objects
    oilSpill = game.add.group();
    oilSpill.enableBody = true;

    // Adding of the objects
    spill = oilSpill.create(-3100, 0, 'oilspill');
    spillFront = oilSpill.create(-800, 0, 'oilspillfront');
    player = game.add.sprite(20, game.world.centerY, 'dude');
    player.scale.setTo(.4, .4);
    point = game.add.sprite(20, game.world.centerY, 'star');

    //  Enable physics on each of the objects
    game.physics.p2.enable(player);
    game.physics.p2.enable(spill);

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

    var playerCollisionGroup = game.physics.p2.createCollisionGroup();
    var junkCollisionGroup = game.physics.p2.createCollisionGroup();

    //  This part is vital if you want the objects with their own collision groups to still collide with the world bounds
    //  (which we do) - what this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();

    var junks = game.add.group();
    junks.enableBody = true;
    junks.physicsBodyType = Phaser.Physics.P2JS;

    for (var i = 0; i < 1000; i++)
    {
        var junk = junks.create(game.world.randomX, game.world.randomY, 'star');
        junk.body.setRectangle(24, 22);

        //  Tell the junk to use the junkCollisionGroup 
        junk.body.setCollisionGroup(junkCollisionGroup);

        //  junks will collide against themselves and the player
        //  If you don't set this they'll not collide with anything.
        //  The first parameter is either an array or a single collision group.
        junk.body.collides([junkCollisionGroup, playerCollisionGroup]);
    }

    player.body.setCollisionGroup(playerCollisionGroup);
    player.body.collides(junkCollisionGroup, gameOver, this);


    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);
    
}

function update() {

	// junkMaker.x = game.camera.x  + 850;

 //    //Collisions
 //   player.body.onBeginContact.add(gameOver, this)
 //    game.physics.arcade.collide(player, junkMaker);
 //    game.physics.arcade.overlap(player, spill, gameOver, null, this);

    //  Reset the players velocity (movement)
    spill.body.velocity.x = speed - 200;
    spillFront.body.velocity.x = speed - 200;

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    angle = 45;
    if (player.body.x >= (x*level))
    {
        console.log('speed up!')
        speed += 50;
        level += 1
    }
    if (cursors.left.isDown) 
    {
    	player.body.velocity.x = -1*speed;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    else if (cursors.right.isDown)
    {
    	player.body.velocity.x = speed;
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
    	player.body.velocity.y = -1*300;
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
    	player.body.velocity.x = speed;
    	player.body.angle = 45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.down.isDown && cursors.left.isDown) 
    {
    	player.body.velocity.y = 300;
    	player.body.velocity.x = -1*speed;
    	player.body.angle = -45;
    	player.animations.play('left');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.right.isDown) 
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = speed;
    	player.body.angle = -45;
    	player.animations.play('right');
    	angleCompensation = false;
    }
    else if(cursors.up.isDown && cursors.left.isDown)
    {
    	player.body.velocity.y = -300;
    	player.body.velocity.x = -speed;
    	player.body.angle = 45;
    	player.animations.play('left');
    	angleCompensation = true;
    }
    // if (game.physics.arcade.collide(player, junkMaker) === true)
    // {
    // 	deathAlert = game.add.text((game.camera.x + 16), (game.camera.y + 16), 'Its touching me!', { fontSize: '32px', fill: '#FFF' });
    // }
}

function gameOver(body, shapeA, shapeB, equation) {
    result = 'Game Over!'
}

function render() {
    //player.body.debug = true;
    game.debug.text(result, 32, 32);
}