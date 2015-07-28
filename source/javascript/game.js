// vim: set expandtab ts=4 sts=4 sw=4:
console.log('It\'s working');
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    
    game.load.image('sky', '/assets/images/sky.png');
    game.load.image('ground', '/assets/images/platform.png');
    game.load.image('star', '/assets/images/star.png');
    game.load.spritesheet('dude', '/assets/images/dude.png', 32, 48);
    
}

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;

var firstRun = true;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    if (firstRun) {
        game.paused = true;
        firstRun = false;
        mainMenu();
    }

    /*
     * PAUSE ACTIVATION
     * */    
    //Add a button using just text. This can be a sprite Heath makes, as shown in the example.
    pauseButton = game.add.text(700, 20, 'PAUSE', { font : '24px cursive', fill : 'black' } );
    //pauseButton = game.add.sprite(700, 20, 'pauseButton');
    //Activating the input for this button, it can be clicked on.
    pauseButton.inputEnabled = true;
    //On the event where the player clicks the button change the game state to paused.
    pauseButton.events.onInputUp.add(function() {
        //Irrelevant test, lets me know when input is being processed.
        console.log("WOW");
        //This will activate phasers pause function, where some magic should happen.
        game.paused = true;
        //Makes the button invisible and gets rid of all interaction with it.
        pauseButton.exists = false;
        //Activating the external function.
        extMenu();
    });
    
}

//This function does not run within the confines of the phaser framework, and hence should probably be moved out. Fine here for now.
function extMenu() {
    var resumeButton = document.getElementById("resumeButton");
    var resetButton = document.getElementById("resetButton");
    var menuButton = document.getElementById("menuButton");
    resumeButton.onclick = function() {
        console.log("YEEEESYEEEESYEEES");
        game.paused = false;
        pauseButton.exists = true;
    }
    resetButton.onclick = function() {
        create();
        //score is initialised with a value outside of create(), so it needs to be reset here.
        score = 0;
    }
    menuButton.onclick = function() {
        //This should reinitialise the menu hopefully simply once completed.
        console.log("OPEN THE POD BAY DOORS HAL"); 
    }
}

function mainMenu() {
    var beginButton = document.getElementById("beginButton");
    beginButton.onclick = function() {
        game.paused = false;
    }
}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else if (cursors.down.isDown)
    {
    	//	Move downwards
    	player.body.velocity.y = 150;
    }
    else if (cursors.up.isDown)
    {
    	//	Move upwards
    	player.body.velocity.y = -150;
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}
