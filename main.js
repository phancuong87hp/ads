var lib, canvas, mcGame, mcMenu, mcLine, coordList = [];
var container = new createjs.MovieClip();
var containerDot = new createjs.MovieClip();
var lastframe = 0;
var fpstime = 0;
var framecount = 0;
var bubbleWidth = 36;
var bubbleHeigt = 30;
var countShooter = 1000;
var listDot = [];
var nearCluster;
var dropCluster = [];
var mcTempBubble;
var isShowInstall = false;

var initialized = false;


var fixTitle=[
    [
        [4,0,0,4,4,4,4,4,0,0,4],
        [4,0,0,4,3,3,4,0,0,4,4],
        [4,4,0,0,4,3,4,0,0,4,4],
        [3,4,0,0,4,4,0,0,4,4,3],
        [3,4,4,0,0,4,0,0,4,4,3],
        [3,4,4,0,0,0,0,4,4,3,3],
        [3,3,4,4,0,0,0,4,4,3,3],
        [3,1,4,4,0,0,4,4,3,3,1],
        [3,1,1,4,4,0,4,4,1,1,3],
        [1,1,1,4,4,4,4,1,1,1,1],
        [1,1,1,1,4,4,4,1,1,1,1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ],
    [
        [1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,0,0,1,1,1,1,1],
        [3,3,4,4,0,0,0,4,4,3,3],
        [3,4,4,4,0,0,4,4,4,3,3],
        [3,4,4,4,2,0,2,4,4,4,3],
        [4,4,4,2,2,2,2,4,4,4,3],
        [3,4,4,4,2,2,2,4,4,4,3],
        [3,4,4,4,2,2,4,4,4,3,3],
        [3,3,4,4,4,2,4,4,4,3,3],
        [3,3,4,4,4,4,4,4,3,3,3],
        [3,3,3,4,4,4,4,4,3,3,3],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ], [
        [4,4,4,4,4,4,4,4,4,4,4],
        [4,4,4,4,4,4,4,4,4,4,4],
        [1,1,1,1,1,1,1,1,1,1,1],
        [0,0,3,3,1,1,3,3,2,2,2],
        [0,0,3,3,3,1,3,3,3,2,2],
        [0,3,3,3,3,3,3,3,3,2,2],
        [0,0,3,3,3,3,3,3,3,2,2],
        [0,0,3,3,3,3,3,3,2,2,2],
        [0,0,0,3,3,3,3,3,2,2,2],
        [0,0,0,3,3,3,3,2,2,2,2],
        [0,0,0,0,3,3,3,2,2,2,2],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]
   
]

// Level
var level = {
    x: 2,           // X position
    y: 0,          // Y position
    width: 0,       // Width, gets calculated
    height: 0,      // Height, gets calculated
    columns: 11,    // Number of tile columns
    rows: 100,       // Number of tile rows
    tilewidth: 28,  // Visual width of a tile
    tileheight: 30, // Visual height of a tile
    rowheight: 25, //34,  // Height of a row
    radius: 15,     // Bubble collision radius
    tiles: []       // The two-dimensional tile array  40 30
};

// Define a tile class
var Tile = function(x, y, type, shift) {
    this.movie = null;
    this.x = x;
    this.y = y;
    this.type = type;
    this.removed = false;
    this.shift = shift;
    this.velocity = 0;
    this.alpha = 1;
    this.processed = false;
};

// Player
var player = {
    x: 147,
    y: 372,
    angle: 0,
    tiletype: 0,
    bubble: {
                movie:null,
                x: 0,
                y: 0,
                angle: 0,
                speed: 1000,
                dropspeed: 10,
                tiletype: 0,
                visible: false
            },
    nextbubble: {
                    movie:null,
                    x: 0,
                    y: 0,
                    tiletype: 0
                }
};

// Neighbor offset table
var neighborsoffsets = [[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], // Even row tiles
                        [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]];  // Odd row tiles

// Number of different colors
var bubblecolors = 5;

// Game states
var gamestates = { init: 0, ready: 1, shootbubble: 2, removecluster: 3, gameover: 4, idle:5 };
var gamestate = gamestates.init;

var turncounter = 0;
var rowoffset = 0;

// Animation variables
var animationstate = 0;
var animationtime = 0;

// Clusters
var showcluster = false;
var cluster = [];
var floatingclusters = [];

// Images
var images = [];
var bubbleimage;

// Image loading global variables
var loadcount = 0;
var loadtotal = 0;
var preloaded = false;

function showGame(_lib, _canvas, _mcGame, _mcMenu){
   

    lib = _lib;
    canvas = _canvas;
    mcGame = _mcGame;
    mcMenu = _mcMenu;

    mcGame.visible = true;
    mcMenu.visible = false;
    // mcMenu.mcBubble.gotoAndStop(0);
    // mcMenu.mcOuter.gotoAndStop(0);
    this.initgame();
    mcGame.btnInstall.addEventListener("click", openGame);   
    
}

function showContinue(){
    TweenMax.to(mcGame.btnInstall, 0.5, {alpha:0, onComplete:function(){
       
    }.bind(this)});

   TweenMax.delayedCall(0.8, function(){
        mcGame.visible = false;
        mcMenu.visible = true;
        TweenMax.from(mcMenu.mcTho, 0.7, {alpa:0, y:-50, delay:1.5});
        TweenMax.from(mcMenu.mcLon, 1.2, {alpa:0, y:-50, delay:1.2});
        TweenMax.from(mcMenu.mcBubble, 1, {alpa:0, y:-50});

        TweenMax.from(mcMenu.btnContinue, 1.5, {alpha: 0, y:400});

        mcMenu.mcBubble.gotoAndStop(0);
        mcMenu.mcOuter.gotoAndStop(0);
        mcMenu.btnContinue.addEventListener("click", onClickContinue);    
   })
    
}

function onClickContinue(){
    this.openGame();
}

// Initialize the game
function initgame() {
    mcGame.mcOuter.gotoAndStop(0);
    mcTempBubble = mcGame.mcBubble;
    mcTempBubble.gotoAndStop(0);
    mcTempBubble.visible = false;
    mcTempBubble.parent.removeChild(mcTempBubble);
    updateTxtShooter();

    mcGame.addChild(containerDot);
    mcGame.addChild(container);

    // Add mouse events
    if(this.detectMobile()){
        canvas.addEventListener("touchmove", onMouseMove);
        canvas.addEventListener("touchend", onMouseDown);
    }else{
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
    }
   
   
    
    // Initialize the two-dimensional tile array
    for (var i=0; i<level.columns; i++) {
        level.tiles[i] = [];
        for (var j=0; j<level.rows; j++) {
            // Define a tile type and a shift parameter for animation
            level.tiles[i][j] = new Tile(i, j, 0, 0);
        }
    }
    
    level.width = level.columns * level.tilewidth + level.tilewidth/2;
    level.height = (level.rows-1) * level.rowheight + level.tileheight;
    
    // Init the player
    player.x = mcTempBubble.x;//level.x + level.width/2 - level.tilewidth/2;
    player.y = mcTempBubble.y;//level.y + level.height;
    player.angle = 90;
    player.tiletype = 0;
    
    player.nextbubble.x = 69;
    player.nextbubble.y = 414;
    
    newGame();
    main(0);
}

function  updateTxtShooter(){
    mcGame.txtShooter.text = countShooter;
    mcGame.txtShooter.visible = false;
}

// Main loop
function main(tframe) {
    // Request animation frames
    window.requestAnimationFrame(main);
    update(tframe);
    render();
}

// Update the game state
function update(tframe) {
    var dt = (tframe - lastframe) / 1000;
    lastframe = tframe;
    // stateDotLine(dt);
    if (gamestate == gamestates.ready) {
        // Game is ready for player input
    } else if (gamestate == gamestates.shootbubble) {
        // Bubble is moving
        stateShootBubble(dt);
    } else if (gamestate == gamestates.removecluster) {
        // Remove cluster and drop tiles
        stateRemoveCluster(dt);
    }
}

function setGameState(newgamestate) {
    gamestate = newgamestate;
    if (gamestate == gamestates.gameover) showInstallGame();
    animationstate = 0;
    animationtime = 0;
}


function stateShootBubble(dt) {
    // Bubble is moving
    // Move the bubble in the direction of the mouse
    player.bubble.x += dt * player.bubble.speed * Math.cos(degToRad(player.bubble.angle));
    player.bubble.y += dt * player.bubble.speed * -1*Math.sin(degToRad(player.bubble.angle));
    
    // Handle left and right collisions with the level
    if (player.bubble.x <= level.x) {
        // Left edge
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x;
    } else if (player.bubble.x + level.tilewidth >= level.x + level.width) {
        // Right edge
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x + level.width - level.tilewidth;
    }

    // Collisions with the top of the level
    if (player.bubble.y <= level.y) {
        // Top collision
        player.bubble.y = level.y;
        snapBubble();
        return;
    }
    
    // Collisions with other tiles
    for (var i=0; i<level.columns; i++) {
        for (var j=0; j<level.rows; j++) {
            var tile = level.tiles[i][j];
            
            // Skip empty tiles
            if (tile.type < 0) {
                continue;
            }
            
            // Check for intersections
            var coord = getTileCoordinate(i, j);
            if (circleIntersection(player.bubble.x + level.tilewidth/2,
                                    player.bubble.y + level.tileheight/2,
                                    level.radius,
                                    coord.tilex + level.tilewidth/2,
                                    coord.tiley + level.tileheight/2,
                                    level.radius)) {
                                    
                // Intersection with a level bubble
                snapBubble();
                return;
            }
        }
    }
}



function stateRemoveCluster(dt) {
    renderPlayer();

    if (animationstate == 0) {
        resetRemoved();
        
        for (var i=0; i<cluster.length; i++) {
            cluster[i].removed = true;
        }
        
        floatingclusters = findFloatingClusters();
        
        if (floatingclusters.length > 0) {
            for (var i=0; i<floatingclusters.length; i++) {
                for (var j=0; j<floatingclusters[i].length; j++) {
                    var tile = floatingclusters[i][j];
                    tile.shift = 0;
                    tile.shift = 1;
                    tile.velocity = player.bubble.dropspeed;
                }
            }
        }
        
        animationstate = 1;
    }
    
    if (animationstate == 1) {
        var tilesleft = false;
        for (var i=0; i<dropCluster.length; i++) {
            if(dropCluster[i] === undefined) continue;
            for(var j=0;j<dropCluster[i].length; j++){
                var tile = dropCluster[i][j];
                
                if (tile.type >= 0) {
                    tilesleft = true;
                    var t = (i === 0) ? 0 : i  * 1.1; 
                    tile.alpha -= dt * 15 / t;
                    if (tile.alpha < 0) {
                        tile.alpha = 0;
                    }

                    if (tile.alpha == 0) {
                        drawAnimBubble(tile.movie.x, tile.movie.y, tile.type);
                        tile.type = -1;
                        tile.alpha = 1;
                    }
                }
            }
        }


        // Drop bubbles
        for (var i=0; i<floatingclusters.length; i++) {
            for (var j=0; j<floatingclusters[i].length; j++) {
                var tile = floatingclusters[i][j];
                if (tile.type >= 0) {
                    tilesleft = true;
                    tile.velocity += dt * randRange(20, 1500);;
                    tile.shift += dt * tile.velocity;
                    if (tile.alpha == 0 || (tile.y * level.rowheight + tile.shift > canvas.height)) {
                        tile.type = -1;
                        tile.shift = 0;
                        tile.alpha = 1;
                    }
                }

            }
        }
        
        if (!tilesleft) {
            // Next bubble
            nextBubble();
            var tilefound = false
            for (var i=0; i<level.columns; i++) {
                for (var j=0; j<level.rows; j++) {
                    if (level.tiles[i][j].type != -1) {
                        tilefound = true;
                        break;
                    }
                }
            }
            
            if (tilefound) {
                setGameState(gamestates.ready);
                updatePotisionTitle();
            } else {
                setGameState(gamestates.gameover);
            }
        }
    }
}

function snapBubble() {
    var centerx = player.bubble.x + level.tilewidth/2;
    var centery = player.bubble.y + level.tileheight/2;

    var gridpos = getGridPosition(centerx, centery);
    if (gridpos.x < 0) {
        gridpos.x = 0;
    }
        
    if (gridpos.x >= level.columns) {
        gridpos.x = level.columns - 1;
    }

    if (gridpos.y < 0) {
        gridpos.y = 0;
    }
        
    if (gridpos.y >= level.rows) {
        gridpos.y = level.rows - 1;
    }

    var addtile = false;
    if (level.tiles[gridpos.x][gridpos.y].type != -1) {
        for (var newrow=gridpos.y+1; newrow<level.rows; newrow++) {
            if (level.tiles[gridpos.x][newrow].type == -1) {
                gridpos.y = newrow;
                addtile = true;
                break;
            }
        }
    } else {
        addtile = true;
    }
    if (addtile) {
        player.bubble.visible = false;
        level.tiles[gridpos.x][gridpos.y].type = player.bubble.tiletype;
        if (checkGameOver()) {
            return;
        }
        cluster = findCluster(gridpos.x, gridpos.y, true, true, false);
        nearCluster = findNearCluster(gridpos.x, gridpos.y, true, true, false);

        statusNearClusterAnim();
        updatePotisionTitle();

        if (cluster.length >= 3) {
            setGameState(gamestates.idle);
            dropCluster = findDropCluster(cluster);
            TweenMax.delayedCall(0.15, function(){
                setGameState(gamestates.removecluster);
            }.bind(this));
           
            return;
        }
    }
    turncounter++;
    // if (turncounter >= 5) {
    //     addBubbles();
    //     turncounter = 0;
    //     rowoffset = (rowoffset + 1) % 2;
    //     if (checkGameOver()) {
    //         return;
    //     }
    // }
    nextBubble();
    setGameState(gamestates.ready);
}

function updatePotisionTitle(){
    var max = getMaxRowHasBubble();
    console.log("max: " + max);
    var vy = 0;
    if(max <= 11){
        vy = 0;
    }else{
        vy = -(max - 11) * (bubbleHeigt - 5);
    }

   
    if(level.y !== vy){
        level.y = vy;
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                var tile = level.tiles[i][j];
                if (tile.type >= 0 && tile.movie !== null) {
                    var ty =  getTileCoordinate(i,j)
                    TweenMax.to(tile.movie, 0.5, {y: ty.tiley, delay:0.4})
                }
            }
        }

        // TweenMax.delayedCall(1, function(){
        //     renderTiles();
        // })

        
    }else{
        TweenMax.delayedCall(0.36, function(){
            renderTiles();
        })
    }

   
    // 
}

function getMaxRowHasBubble(){
    var maxRow = 0;

    for (var i=0; i<level.columns; i++) {
        for (var j=0; j<level.rows; j++) {
            var tile = level.tiles[i][j];
            if (tile.type >= 0 && maxRow < j) {
                maxRow = j;
            }
        }
    }

    return maxRow;
}

function findNearCluster(tx, ty, matchtype, reset, skipremoved) {
    if (reset) {
        resetProcessed();
    }
    var targettile = level.tiles[tx][ty];
    var toprocess = [targettile];
    targettile.processed = true;
    var foundcluster = [];

    while (toprocess.length > 0) {
        var currenttile = toprocess.pop();
        if (currenttile.type == -1) {
            continue;
        }
        if (skipremoved && currenttile.removed) {
            continue;
        }
        if(Math.abs(currenttile.y - targettile.y) > 3)  continue;
        if(Math.abs(currenttile.x - targettile.x) > 3)  continue;
        if(Math.abs(currenttile.y - targettile.y) > 2 && Math.abs(currenttile.x - targettile.x) > 1) continue;
        if(Math.abs(currenttile.y - targettile.y) > 2 && Math.abs(currenttile.x - targettile.x) > 2) continue;
        if(Math.abs(currenttile.y - targettile.y) > 1 && Math.abs(currenttile.x - targettile.x) > 2) continue;

        // if(Math.abs(currenttile.x - targettile.x) > 2 ||  Math.abs(currenttile.y - targettile.y) > 3)
        //     continue;

        foundcluster.push(currenttile);
        var neighbors = getNeighbors(currenttile);
        for (var i=0; i<neighbors.length; i++) {
            if (!neighbors[i].processed) {
                toprocess.push(neighbors[i]);
                neighbors[i].processed = true;
            }
        }
        // }
    }

    return foundcluster;
}


function statusNearClusterAnim() {
    renderTiles();
    if(nearCluster === undefined || nearCluster.length === 0) return;
    var direct = {x:0, y:0}; // 1: top, left;  2: top-right; 3: bottom-left; 4: bottom-right
    var startCluster = nearCluster[0];
    var movie = startCluster.movie;
    if(movie.x > player.bubble.movie.x) direct = {x:1,y:-1};
    else  direct = {x:-1,y:-1};
    var newx = movie.x + direct.x * (Math.abs(0 - 5) * 0.4);
    var newy = movie.y + direct.y * (Math.abs(0 - 5) * 0.4);
    movie.tempX = movie.x;
    movie.tempY = movie.y;
    TweenMax.to(movie, 0.16, {x: newx, y: newy})
    TweenMax.to(movie, 0.16, {x: movie.tempX, y: movie.tempY, delay: 0.16});

    movie.mcOuter.visible = true;
    TweenMax.delayedCall(0.3, function(){
        movie.mcOuter.visible = false;
    })

    for(var i = 1; i< nearCluster.length;i++) {
        var mc = nearCluster[i];
        var vx = startCluster.x - mc.x;
        var vy = startCluster.y - mc.y;
        if(vx ===0) vx = 1;
        if(vx > 0 && vy > 0) direct = {x:-1,y:-1};
        if(vx > 0 && vy < 0) direct = {x:-1,y:1};
        if(vx < 0 && vy > 0) direct = {x:1,y:-1};
        if(vx < 0 && vy < 0) direct = {x:1,y:1};

        var near = (Math.abs(vx) > Math.abs(vy)) ? Math.abs(vx) : Math.abs(vy);
        
        // console.log("x:  " + vx + "  y:  " + vy + "  " + direct + "  " + near);
        var newx = mc.movie.x + direct.x * (Math.abs(near - 4) * 0.4);
        var newy = mc.movie.y + direct.y * (Math.abs(near - 4) * 0.4);
        mc.movie.tempX = mc.movie.x;
        mc.movie.tempY = mc.movie.y;

        TweenMax.to(mc.movie, 0.16, {x: newx, y: newy})
        TweenMax.to(mc.movie, 0.16, {x: mc.movie.tempX, y: mc.movie.tempY, delay: 0.16});
    }
}

function findDropCluster(foundcluster){
    if(foundcluster.length > 1){
        dropCluster = [];
        var mcFirst = foundcluster[0];
        for(var i = 0; i < foundcluster.length; i++) {
            var mc = foundcluster[i];
            var x = (mc.x - mcFirst.x);
            var y = (mc.y - mcFirst.y);
            var index = 0;
            if(Math.round(x) > Math.round(y)) index = Math.abs(y);
            else index = Math.abs(x);

            if(dropCluster[index] === undefined) dropCluster[index] = [];
            dropCluster[index].push(mc);
        }
    }

    return dropCluster;
}

function checkGameOver() {
    for (var i=0; i<level.columns; i++) {
        if (level.tiles[i][level.rows-1].type != -1) {
            nextBubble();
            setGameState(gamestates.gameover);
            return true;
        }
    }
    
    return false;
}

function addBubbles() {
    for (var i=0; i<level.columns; i++) {
        for (var j=0; j<level.rows-1; j++) {
            level.tiles[i][level.rows-1-j].type = level.tiles[i][level.rows-1-j-1].type;
        }
    }
    for (var i=0; i<level.columns; i++) {
        level.tiles[i][0].type = getExistingColor();
        if (level.rows - 1 % 2 !== 0 && i===level.columns-1) {
            level.tiles[i][0].type = -1;
        }
    }
}
function findColors() {
    var foundcolors = [];
    var colortable = [];
    for (var i=0; i<bubblecolors; i++) {
        colortable.push(false);
    }

    for (var i=0; i<level.columns; i++) {
        for (var j=level.rows-1; j>=0; j--) {
            var tile = level.tiles[i][j];
            if (tile.type >= 0) {
                if (!colortable[tile.type]) {
                    colortable[tile.type] = true;
                    foundcolors.push(tile.type);  
                }
                break;
            }

        }
    }

    // for (var i=0; i<level.columns; i++) {
    //     for (var j=0; j<level.rows; j++) {
    //         var tile = level.tiles[i][j];
    //         if (tile.type >= 0) {
    //             if (!colortable[tile.type]) {
    //                 colortable[tile.type] = true;
    //                 foundcolors.push(tile.type);
    //             }
    //         }
    //     }
    // }
    
    return foundcolors;
}

function findCluster(tx, ty, matchtype, reset, skipremoved) {
    if (reset) {
        resetProcessed();
    }
    var targettile = level.tiles[tx][ty];
    var toprocess = [targettile];
    targettile.processed = true;
    var foundcluster = [];

    while (toprocess.length > 0) {
        var currenttile = toprocess.pop();
        if (currenttile.type == -1) {
            continue;
        }
        if (skipremoved && currenttile.removed) {
            continue;
        }
        if (!matchtype || (currenttile.type == targettile.type)) {
            foundcluster.push(currenttile);
            var neighbors = getNeighbors(currenttile);
            for (var i=0; i<neighbors.length; i++) {
                if (!neighbors[i].processed) {
                    toprocess.push(neighbors[i]);
                    neighbors[i].processed = true;
                }
            }
        }
    }

    return foundcluster;
}

function findFloatingClusters() {
    resetProcessed();
    var foundclusters = [];
    for (var i=0; i<level.columns; i++) {
        for (var j=0; j<level.rows; j++) {
            var tile = level.tiles[i][j];
            if (!tile.processed) {
                var foundcluster = findCluster(i, j, false, false, true);
                if (foundcluster.length <= 0) {
                    continue;
                }
                var floating = true;
                for (var k=0; k<foundcluster.length; k++) {
                    if (foundcluster[k].y == 0) {
                        floating = false;
                        break;
                    }
                }
                
                if (floating) {
                    foundclusters.push(foundcluster);
                }
            }
        }
    }
    
    return foundclusters;
}
function resetProcessed() {
    for (var i=0; i<level.columns; i++) {
        for (var j=0; j<level.rows; j++) {
            level.tiles[i][j].processed = false;
        }
    }
}
function resetRemoved() {
    for (var i=0; i<level.columns; i++) {
        for (var j=0; j<level.rows; j++) {
            level.tiles[i][j].removed = false;
        }
    }
}

function getNeighbors(tile) {
    var tilerow = (tile.y + rowoffset) % 2; // Even or odd row
    var neighbors = [];
    var n = neighborsoffsets[tilerow];
    if(n===undefined)  neighbors; 
    for (var i=0; i<n.length; i++) {
        var nx = tile.x + n[i][0];
        var ny = tile.y + n[i][1];
        if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
            neighbors.push(level.tiles[nx][ny]);
        }
    }
    
    return neighbors;
}

function drawCenterText(text, x, y, width) {
    var textdim = context.measureText(text);
    context.fillText(text, x + (width-textdim.width)/2, y);
}

function render() {
    var yoffset =  level.tileheight/2;
    // renderTiles();
    if (showcluster) {
        renderCluster(cluster, 255, 128, 128);
        
        for (var i=0; i<floatingclusters.length; i++) {
            var col = Math.floor(100 + 100 * i / floatingclusters.length);
            renderCluster(floatingclusters[i], col, col, col);
        }
    }
    
    renderPlayer();
    if (gamestate == gamestates.removecluster){
        renderTiles();
    }
    if (gamestate == gamestates.gameover) {
    }
}
function renderTiles() {
    for(var i=0;i<coordList.length;i++){
        if(coordList[i].movie){
            coordList[i].movie.parent.removeChild(coordList[i].movie);
        }
    }

    coordList = [];

    for (var j=0; j<level.rows; j++) {
        for (var i=0; i<level.columns; i++) {
            var tile = level.tiles[i][j];
            var shift = tile.shift;
            var coord = getTileCoordinate(i, j);
            if (tile.type >= 0) {              
                coord.movie = drawBubble(coord.tilex, coord.tiley + shift, tile.type);
                tile.movie = coord.movie;
                tile.movie.rootY = tile.movie.y;
                coordList.push(coord);
            }
        }
    }
}

function renderCluster(cluster, r, g, b) {
    for (var i=0; i<cluster.length; i++) {
        var coord = getTileCoordinate(cluster[i].x, cluster[i].y);
        context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        context.fillRect(coord.tilex+level.tilewidth/4, coord.tiley+level.tileheight/4, level.tilewidth/2, level.tileheight/2);
    }
}
function renderPlayer() {
    drawLine();

    if(player.nextbubble.movie){
        player.nextbubble.movie.parent.removeChild(player.nextbubble.movie);
        player.nextbubble.movie = undefined;
    }

    if(player.bubble.movie){
        player.bubble.movie.parent.removeChild(player.bubble.movie);
        player.bubble.movie = undefined;
    }

    // player.nextbubble.movie = drawBubble(player.nextbubble.x, player.nextbubble.y, player.nextbubble.tiletype);
    mcGame.mcOuter.gotoAndStop(player.nextbubble.tiletype)

    if (player.bubble.visible) {
        if(player.bubble.movie){
            player.bubble.movie.parent.removeChild(player.bubble.movie);
        }
        player.bubble.movie =  drawBubble(player.bubble.x, player.bubble.y, player.bubble.tiletype);
    }
    
}

function drawLine(){
    if(listDot){
        for(var i=0;i<listDot.length;i++){
            listDot[i].parent.removeChild(listDot[i]);
        }
    }

    var px = player.x + bubbleWidth/2;
    var py = player.y + bubbleHeigt/2;

    var angle = player.angle;
    listDot = [];

    for(var k = 0;k<500;k++){
        var mcDot =  drawDot(player.x, player.y, player.bubble.tiletype);
        mcDot.x = px + 0.012 * player.bubble.speed * Math.cos(degToRad(angle));
        mcDot.y = py + 0.012 * player.bubble.speed * -1 *Math.sin(degToRad(angle));
        mcDot.scale = 0.3;
        listDot.push(mcDot);
        
        if (mcDot.x <= level.x) {
            angle = 180 - angle;
            mcDot.x = level.x;
        } else if (mcDot.x + level.tilewidth >= level.x + level.width + 20) {
            angle = 180 - angle;
            mcDot.x = level.x + level.width - level.tilewidth + bubbleWidth/2;
        }

        var isCollisionsTiles = false;
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                var tile = level.tiles[i][j];
                if (tile.type < 0) {
                    continue;
                }
                var coord = getTileCoordinate(i, j);
                if (circleIntersection(mcDot.x,
                                        mcDot.y,
                                        level.radius,
                                        coord.tilex + level.tilewidth/2,
                                        coord.tiley + level.tileheight/2,
                                        level.radius)) {
                                        
                    isCollisionsTiles = true;
                    break;
                }
            }
        }

        if(isCollisionsTiles) break;

        px = mcDot.x;
        py = mcDot.y;
        
    }

}

function stateDotLine(mcDot, dt){
    if(mcDot === null) return;

    mcDot.x += dt * player.bubble.speed * Math.cos(degToRad(player.bubble.angle));
    mcDot.y += dt * player.bubble.speed * -1 * Math.sin(degToRad(player.bubble.angle));
     if (mcDot.x <= level.x) {
        // Left edge
        mcDot.angle = 180 - player.bubble.angle;
        mcDot.x = level.x;
    } else if (mcDot.x + level.tilewidth >= level.x + level.width) {
        // Right edge
        mcDot.angle = 180 - mcDot.angle;
        mcDot.x = level.x + level.width - level.tilewidth;
    }
    if (mcDot.y <= level.y) {
        mcDot.y = level.y;
        return;
    }
    
    // Collisions with other tiles
    for (var i=0; i<level.columns; i++) {
        for (var j=0; j<level.rows; j++) {
            var tile = level.tiles[i][j];
            if (tile.type < 0) {
                continue;
            }
            var coord = getTileCoordinate(i, j);
            if (circleIntersection(player.bubble.x + level.tilewidth/2,
                                    player.bubble.y + level.tileheight/2,
                                    level.radius,
                                    coord.tilex + level.tilewidth/2,
                                    coord.tiley + level.tileheight/2,
                                    level.radius)) {
                return;
            }
        }
    }
}


function getTileCoordinate(column, row) {
    var tilex = level.x + column * level.tilewidth;
    if ((row + rowoffset) % 2) {
        tilex += level.tilewidth/2;
    }
    var tiley = level.y + row * level.rowheight;
    return { tilex: tilex, tiley: tiley };
}

function getGridPosition(x, y) {
    var gridy = Math.floor((y - level.y) / level.rowheight);
    var xoffset = 0;
    if ((gridy + rowoffset) % 2) {
        xoffset = level.tilewidth / 2;
    }
    var gridx = Math.floor(((x - xoffset) - level.x) / level.tilewidth);
    
    return { x: gridx, y: gridy };
}

function drawBubble(x, y, index) {
    if (index < 0 || index >= bubblecolors)
        return;
    
    var bubbleImg = getMcTile(index);
    bubbleImg.x = x;
    bubbleImg.y = y;
    bubbleImg.width = level.tilewidth;
    bubbleImg.height = level.tileheight;
    bubbleImg.mcOuter.visible = false;
    container.addChild(bubbleImg)
    return bubbleImg;
}

function drawDot(x, y, index) {
    if (index < 0 || index >= bubblecolors)
        return;
    
    var bubbleImg = getMcDot(index);
    bubbleImg.x = x;
    bubbleImg.y = y;
    bubbleImg.width = level.tilewidth;
    bubbleImg.height = level.tileheight;
    containerDot.addChild(bubbleImg)

    return bubbleImg;
}

function drawAnimBubble(x, y, index){
    var anim = getMcAnim(index);
    anim.x = x + 18;
    anim.y = y + 15;
    anim.scale = 0.7;
    anim.gotoAndStop(0);
    anim.on("tick", function() {
        if (anim.currentFrame == anim.totalFrames - 1) { 
            anim.gotoAndStop(0);
            anim.parent.removeChild(anim);
        }
    });
    container.addChild(anim);
    anim.gotoAndPlay(0);

}

function getMcAnim(index){
    switch(index){
        case 0: return new lib.mcAnim1();
        case 1: return new lib.mcAnim2();
        case 2: return new lib.mcAnim3();
        case 3: return new lib.mcAnim4();
        case 4: return new lib.mcAnim5();
    }
}

function getMcDot(index){
    switch(index){
        case 0: return new lib.mcDot1();
        case 1: return new lib.mcDot2();
        case 2: return new lib.mcDot3();
        case 3: return new lib.mcDot4();
        case 4: return new lib.mcDot5();
    }
    return null;
}

function getMcTile(index){
    var tile = new lib.mcBubble();
    tile.gotoAndStop(index);
    tile.scaleX = mcTempBubble.scaleX;
    tile.scaleY = mcTempBubble.scaleY;
    return tile;
}

function newGame() {
    turncounter = 0;
    rowoffset = 0;
    setGameState(gamestates.ready);
    createLevel();
    nextBubble();
    nextBubble();

    renderTiles();
}

function createLevel() {
    var rd = randRange(0, 2);;
    for (var j=0; j<level.rows; j++) {
        var randomtile = randRange(0, bubblecolors-1);
        var count = 0;
        for (var i=0; i<level.columns; i++) {
            if (count >= 2) {
                var newtile = randRange(0, bubblecolors-1);
                if (newtile == randomtile) {
                    newtile = (newtile + 1) % bubblecolors;
                }
                randomtile = newtile;
                count = 0;
            }
            count++;
            
            if (j < level.rows/2) {
                level.tiles[i][j].type = ((j < fixTitle[rd].length && i < fixTitle[rd][j].length)) ? fixTitle[rd][j][i] : -1//randomtile;
                if (j % 2 !== 0 && i===level.columns-1) {
                    level.tiles[i][j].type = -1;
                }
            } else {
                level.tiles[i][j].type = -1;
            }
        }
    }
}
function nextBubble() {
    
    var nextcolor = getExistingColor();
    player.nextbubble.tiletype = nextcolor;

    player.tiletype = player.nextbubble.tiletype;
    player.bubble.tiletype = player.nextbubble.tiletype;
    player.bubble.x = player.x;
    player.bubble.y = player.y;
    player.bubble.visible = true;
}
function getExistingColor() {
    existingcolors = findColors();
    
    var bubbletype = 0;
    if (existingcolors.length > 0) {
        bubbletype = existingcolors[randRange(0, existingcolors.length-1)];
    }
    
    return bubbletype;
}
function randRange(low, high) {
    return Math.floor(low + Math.random()*(high-low+1));
}
function shootBubble() {
    player.bubble.x = player.x;
    player.bubble.y = player.y;
    player.bubble.angle = player.angle;
    player.bubble.tiletype = player.tiletype;

    setGameState(gamestates.shootbubble);
}

function circleIntersection(x1, y1, r1, x2, y2, r2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    var len = Math.sqrt(dx * dx + dy * dy);
    
    if (len < r1 + r2) {
        // Circles intersect
        return true;
    }
    
    return false;
}

function radToDeg(angle) {
    return angle * (180 / Math.PI);
}

function degToRad(angle) {
    return angle * (Math.PI / 180);
}

function onMouseMove(e) {
    if(isShowInstall) return;
    var posGlobal = (detectMobile() === true) ? getTouchPos(canvas, e) : getMousePos(canvas, e);
    var pos = mcGame.globalToLocal(posGlobal.x, posGlobal.y);

    var mouseangle = radToDeg(Math.atan2((player.y+level.tileheight/2) - pos.y, pos.x - (player.x+level.tilewidth/2)));
    if (mouseangle < 0) {
        mouseangle = 180 + (180 + mouseangle);
    }
    var lbound = 8;
    var ubound = 172;
    if (mouseangle > 90 && mouseangle < 270) {
        // Left
        if (mouseangle > ubound) {
            mouseangle = ubound;
        }
    } else {
        // Right
        if (mouseangle < lbound || mouseangle >= 270) {
            mouseangle = lbound;
        }
    }

    player.angle = mouseangle;
}

function onMouseDown(e) {
    if(isShowInstall) return;
    var pos = getMousePos(canvas, e);
    if (gamestate == gamestates.ready) {
        countShooter--; 
        updateTxtShooter();
        shootBubble();
        if(countShooter === 0){
            showInstallGame();
        }
    } else if (gamestate == gamestates.gameover) {
        showInstallGame();
    }
}

function showInstallGame(){
    // createjs.Sound.play("sClear");
    // isShowInstall = true;
    // mcGame.btnInstall.visible = true;
    // var my = mcGame.btnInstall.y;
    // mcGame.btnInstall.y += 200;
    // createjs.Tween.get(mcGame.btnInstall, {override:true}).to({y:my}, 500);
    // mcGame.btnInstall.addEventListener("click", openGame);   
    if(mcMenu.visible === true) return;
    showContinue();
}

function detectMobile(){
    var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
    if(iOS){
        return true;
    }

    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1; 
    if( isAndroid ){
       true;
    }

    return false;
}

function openGame(){
    window.open("https://play.google.com/store/apps/details?id=com.panda.bubble.shooter.mania.free.puzzle.game&hl=vi&gl=US"); 
}

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
        y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
    };
}

function getTouchPos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.round((e.changedTouches[0].clientX - rect.left)/(rect.right - rect.left)*canvas.width),
        y: Math.round((e.changedTouches[0].clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
    };
}


    