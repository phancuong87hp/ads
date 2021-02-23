var lib, canvas, mcGame, mcMenu, stage, mcLine, coordList = [];
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


var level = {
    x: 2,         
    y: 0,       
    width: 0,     
    height: 0,      
    columns: 11,   
    rows: 100,      
    tilewidth: 28, 
    tileheight: 30,
    rowheight: 25,
    radius: 15,     
    tiles: []      
};


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

var neighborsoffsets = [[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], 
                        [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]];  

var bubblecolors = 5;
var gamestates = { init: 0, ready: 1, shootbubble: 2, removecluster: 3, gameover: 4, idle:5 };
var gamestate = gamestates.init;
var turncounter = 0;
var rowoffset = 0;
var animationstate = 0;
var animationtime = 0;
var showcluster = false;
var cluster = [];
var floatingclusters = [];
var images = [];
var bubbleimage;
var loadcount = 0;
var loadtotal = 0;
var preloaded = false;
var isTouchStart = false;

function showGame(_lib, _canvas, _mcGame, _mcMenu, _stage){
    stage = _stage;
    lib = _lib;
    canvas = _canvas;
    mcGame = _mcGame;
    mcMenu = _mcMenu;

    mcGame.visible = true;
    mcMenu.visible = false;

    this.initgame();
    mcGame.btnInstall.addEventListener("click", openGame);   
    
	// loadAnim();
    
}

function showContinue(){
    TweenMax.to(mcGame.btnInstall, 0.5, {alpha:0, onComplete:function(){
       
    }.bind(this)});

   TweenMax.delayedCall(0.8, function(){
        mcGame.visible = false;
        mcMenu.visible = true;
        TweenMax.from(mcMenu.mcBubble, 1, {alpa:0, y:-50});

        TweenMax.from(mcMenu.btnContinue, 1.5, {alpha: 0, y:400});

        // mcMenu.mcBubble.gotoAndStop(0);
        mcMenu.mcOuter.gotoAndStop(0);
        mcMenu.btnContinue.addEventListener("click", onClickContinue);    
   })
    
}

function onClickContinue(){
    this.openGame();
}

function initgame() {
    mcGame.mcOuter.gotoAndStop(0);
    mcTempBubble = mcGame.mcBubble;
    mcTempBubble.gotoAndStop(0);
    mcTempBubble.visible = false;
    mcTempBubble.parent.removeChild(mcTempBubble);
    updateTxtShooter();

    mcGame.addChild(containerDot);
    mcGame.addChild(container);

    if(this.detectMobile()){
        canvas.addEventListener("touchstart", onTouchStart);
        canvas.addEventListener("touchmove", onMouseMove);
        canvas.addEventListener("touchend", onMouseDown);
    }else{
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
    }

    for (var i=0; i<level.columns; i++) {
        level.tiles[i] = [];
        for (var j=0; j<level.rows; j++) {
            level.tiles[i][j] = new Tile(i, j, 0, 0);
        }
    }
    
    level.width = level.columns * level.tilewidth + level.tilewidth/2;
    level.height = (level.rows-1) * level.rowheight + level.tileheight;
  
    player.x = mcTempBubble.x;
    player.y = mcTempBubble.y;
    player.angle = 90;
    player.tiletype = 0;
    
    player.nextbubble.x = 69;
    player.nextbubble.y = 414;
    
    newGame();
    main(0);
}

function onTouchStart(){
    isTouchStart = true;
    mcGame.mcTay.visible = false;
}

function  updateTxtShooter(){
    mcGame.txtShooter.text = countShooter;
    mcGame.txtShooter.visible = false;
}

function main(tframe) {
    window.requestAnimationFrame(main);
    update(tframe);
    render();
}

function update(tframe) {
    var dt = (tframe - lastframe) / 1000;
    lastframe = tframe;
    if (gamestate == gamestates.ready) {
    } else if (gamestate == gamestates.shootbubble) {
        stateShootBubble(dt);
    } else if (gamestate == gamestates.removecluster) {
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
    player.bubble.x += dt * player.bubble.speed * Math.cos(degToRad(player.bubble.angle));
    player.bubble.y += dt * player.bubble.speed * -1*Math.sin(degToRad(player.bubble.angle));
    
    if (player.bubble.x <= level.x) {
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x;
    } else if (player.bubble.x + level.tilewidth >= level.x + level.width) {
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x + level.width - level.tilewidth;
    }

    if (player.bubble.y <= level.y) {
        player.bubble.y = level.y;
        snapBubble();
        return;
    }
    
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
                    var t = (i === 0) ? 1 : i  * 1.1; 
                    var al = dt * 15 / t;
                    tile.alpha -= al;
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

        for (var i=0; i<floatingclusters.length; i++) {
            for (var j=0; j<floatingclusters[i].length; j++) {
                var tile = floatingclusters[i][j];
                if (tile.type >= 0) {
                    tilesleft = true;
                    tile.velocity += dt * randRange(20, 1500);;
                    tile.shift += dt * tile.velocity;
                    if (tile.alpha == 0 || (tile.y * level.rowheight + tile.shift > canvas.height / 6)) {
                        tile.type = -1;
                        tile.shift = 0;
                        tile.alpha = 1;
                    }
                }

            }
        }
        
        if (!tilesleft) {
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
            TweenMax.delayedCall(0.05, function(){
                setGameState(gamestates.removecluster);
            }.bind(this));
           
            return;
        }
    }
    turncounter++;
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
    }else{
        TweenMax.delayedCall(0.36, function(){
            renderTiles();
        })
    }
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

        foundcluster.push(currenttile);
        var neighbors = getNeighbors(currenttile);
        for (var i=0; i<neighbors.length; i++) {
            if (!neighbors[i].processed) {
                toprocess.push(neighbors[i]);
                neighbors[i].processed = true;
            }
        }
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
    movie.mcOuter.alpha = 0;

    TweenMax.to(movie.mcOuter,0.2, {alpha:1, onComplete:function(){
        TweenMax.to(movie.mcOuter, 0.2, {alpha:0, onComplete:function(){
            movie.mcOuter.visible = false;
        }.bind(this)})
    }.bind(this)})

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
        var newx = mc.movie.x + direct.x * (Math.abs(near - 4) * 0.8);
        var newy = mc.movie.y + direct.y * (Math.abs(near - 4) * 0.8);
        mc.movie.tempX = mc.movie.x;
        mc.movie.tempY = mc.movie.y;

        TweenMax.to(mc.movie, 0.2, {x: newx, y: newy})
        TweenMax.to(mc.movie, 0.2, {x: mc.movie.tempX, y: mc.movie.tempY, delay: 0.2, ease:"power3.easeOut"});
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
    var tilerow = (tile.y + rowoffset) % 2;
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
        mcDot.angle = 180 - player.bubble.angle;
        mcDot.x = level.x;
    } else if (mcDot.x + level.tilewidth >= level.x + level.width) {
        mcDot.angle = 180 - mcDot.angle;
        mcDot.x = level.x + level.width - level.tilewidth;
    }
    if (mcDot.y <= level.y) {
        mcDot.y = level.y;
        return;
    }
    
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
    if(detectMobile() === true && isTouchStart === false) bubbleImg.visible = false;
    else bubbleImg.visible = true;
    
    
    return bubbleImg;
}

function drawAnimBubble(x, y, index){
    var bubble = this.drawBubble(x,y,index);
    var scale = bubble.scale + 0.07;
    TweenMax.to(bubble, 0.05, {scale: scale, alpa:0, onComplete:function(){
        container.removeChild(bubble);
    }})

    TweenMax.delayedCall(0.02, function(){
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
   })

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
    mcGame.mcTay.visible = false;
    if(isShowInstall) return;
    isTouchStart = false;
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
    if(isAndroid){
        return true;
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

//////////////////////////////////////SPINE////////////////////////////////

function loadAnim(){
    var xhr = new XMLHttpRequest();
	xhr.open("GET", "data/Dinobaby_green.atlas", true);
	xhr.onload = this.atlasLoadHandler.bind(this);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream;');
	xhr.send();

    this.dkm1 = TweenMax.delayedCall(0.5, this.reLoadAnim.bind(this))
}

function reLoadAnim() {
    this.loadAnim()
}

function atlasLoadHandler(event) {
    this.dkm1.kill(); 
	this.atlas = new spine.Atlas(event.target.response, {load:this.textureLoaderLoad.bind(this), unload:this.textureLoaderUnLoad.bind(this)});
}

function textureLoaderUnLoad(texture) {
	texture.destroy();
}

function textureLoaderLoad(page, path, atlas) {
    console.log("1111111111111111111")
	this.page = page;
	this.path = path;
	this.atlas = atlas;
	
	this.image = new Image();
	this.image.onload = this.imageLoadHandler.bind(this);
	this.image.src = "data/" + path;
    
    this.dkm2 = TweenMax.delayedCall(0.5, this.reTextureLoaderLoad.bind(this),[page, path, atlas])
}

function reTextureLoaderLoad(page, path, atlas) {
    this.textureLoaderLoad(page, path, atlas)
}

function imageLoadHandler() {
    console.log("222222222222222222222")
    this.dkm2.kill(); 
    if(this.dancerContainer !== undefined) return;
	this.dancerContainer = new createjs.Container();
    this.dancerContainer.x = 89;
    this.dancerContainer.y = 400;
    this.dancerContainer.visible = false;
	this.mcGame.addChild(this.dancerContainer);
	
	this.dancer = new createjs.Container();
	this.dancer.scaleX = this.dancer.scaleY = 0.30;
	this.dancerContainer.addChild(this.dancer);
	this.containers = [];
	for (var i = 0; i < this.atlas.regions.length; i++) {
		var region = this.atlas.regions[i];
		
		var canvas = document.createElement("canvas");
		canvas.id = region.name;
		canvas.width = region.width;
		canvas.height = region.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(image, -region.x, -region.y);
		
		var container = new createjs.Container();
		var rotationContainer = new createjs.Container();
		rotationContainer.name = "rotationContainer";
		container.addChild(rotationContainer);
		var bitmap = new createjs.Bitmap(canvas);
		bitmap.name = "bitmap";
		bitmap.x = region.width / -2;
		bitmap.y = region.height / -2;
		rotationContainer.addChild(bitmap);
		container.name = region.name;
		this.dancer.addChild(container);
		this.containers.push(container);
	}
    this.loadJsonAnim();
}

function loadJsonAnim() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "data/Dinobaby_green.json", true);
	xhr.onload = this.skeletonLoadHandler.bind(this);
    xhr.timeout = 2000;
	xhr.send();

    this.dkm3 = TweenMax.delayedCall(0.5, this.reLoadJsonAnim.bind(this))
}

function reLoadJsonAnim() {
    this.loadJsonAnim();
}

function skeletonLoadHandler (event) {
    console.log("3333333333333333")
    this.dkm3.kill(); 
    this.dancerContainer.visible = true;
	var jsonSkeleton = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(this.atlas));
	this.skeletonData = jsonSkeleton.readSkeletonData(eval("(" + event.target.response + ")"));
	
	spine.Bone.yDown = true;

	this.skeleton = new spine.Skeleton(skeletonData);
	this.skeleton.updateWorldTransform();

	this.stateData = new spine.AnimationStateData(this.skeletonData);	
	this.state = new spine.AnimationState(this.stateData);
	
	var hiphop = {id:"hiphop", title:"Hip Hop", url:"", bpm:96, battleURL:""}
	hiphop.moves = ["hiphop01"];
	hiphop.idle = "hiphop01";
	
	this.danceMoveTimeOut = 0;
	var music = hiphop;
	var moves = music.moves.slice();
	moves.push(music.idle);
	for (j = 0; j < moves.length; j++) {
		for (k = 0; k < moves.length; k++) {
			if (j != k) {
				this.stateData.setMixByName(moves[j], moves[k], 0.2);
			}
		}
	}
	this.doRandomDanceMove(hiphop.moves.slice());
	createjs.Ticker.on("tick", function(e){
        this.updateSkeleton();
        // this.stage.update();
    }.bind(this))
}

function doRandomDanceMove(move) {
	this.state.addAnimationByName(0, move, true, 0);
}


function updateSkeleton(){
    if(this.skeleton === undefined) return;
    this.lastTime = this.lastTime || Date.now();
	var delta = (Date.now() - this.lastTime) * 0.001;
	this.lastTime = Date.now();
	this.state.update(delta);
	this.state.apply(this.skeleton);
	this.skeleton.updateWorldTransform();
	
	var invisibleContainers = this.containers.slice();
	var drawOrder = this.skeleton.drawOrder;
	for (var i = 0, n = drawOrder.length; i < n; i++) {
		var slot = drawOrder[i];
		var attachment = slot.attachment;
		var name = attachment.name;
		var bone = slot.bone;
		var container = this.dancer.getChildByName(name);
		if (container) {
			var rotationContainer = container.getChildByName("rotationContainer");
			var bitmap = rotationContainer.getChildByName("bitmap");
			container.visible = true;
			container.x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
			container.y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
			container.scaleX = bone.worldScaleX;
			container.scaleY = bone.worldScaleY;
			container.rotation = -slot.bone.worldRotation;
			rotationContainer.rotation = -attachment.rotation;
			this.dancer.addChild(container);
			invisibleContainers.splice(invisibleContainers.indexOf(container), 1);
		}
	}
	for (var k in invisibleContainers) {
		invisibleContainers[k].visible = false;
	}
}