// Code: Alisa
// Code, Git wrangling: Jay
// Sounds, Eye Candy: Regi

require(['frozen/GameCore', 'frozen/ResourceManager', 'dojo/keys', 'frozen/Sprite'], function(GameCore, ResourceManager, keys, Sprite){

  var imgx = 0;
  var imgy = 0;
  var serenityspeed = 3.5;
  var bulletSpeed = 4;
  var attackSpeed = 2.5;
  var attackx = 0;
  var attacky = 0;
  var bulletArray = [];
  var attackArray = [];
  var kaboomArray = [];
  var serenityArray = [];
  var startx = 0;
  var starty = 0;
  var scorex = 0;
  var scorey = 0;
  var scoreAmt = 0;
  
  function collides(a, b) {
    return a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y;
  }
  
  //setup a ResourceManager to use in the game
  var rm = new ResourceManager({
    soundsDir: 'sound/',
    imageDir: 'images/'
  });

  //Images.
  var backImg = rm.loadImage('space2.jpg');
  var serenity = rm.loadImage('serenity.png');
  var bullet = rm.loadImage('bullet.png');
  var attack = rm.loadImage('enemyAttack.png');
  var start = rm.loadImage('start.png');
  var kaboom = rm.loadImage('kaboom.png')
  var score = rm.loadImage('score.png');
  var over = rm.loadImage('over.png')

  //Sounds.
  var music = rm.loadSound('music.ogg');
  var musicSource = null;
  var pewSound = rm.loadSound('pew.ogg');
  var dyingSound = rm.loadSound('die.ogg');
  var ricochetSound = rm.loadSound('ricochet.ogg');
  var whooshSound = rm.loadSound('whoosh.ogg');
  var veryAngrySound = rm.loadSound('veryAngry.ogg');
  
  var gameStarted = false;
  
  //Time accumulators.
  var timeSinceAngry = 0;
  var timeSinceAttack = 0;
  var timeSinceShot = 0;
  
  var game = new GameCore({
    canvasId: 'canvas',
    resourceManager: rm,
    drawidth: function(context){
      if (gameStarted===false){
        context.drawImage(start, startx, starty);
      }
      else if (scoreAmt < 0){
        context.drawImage(over, overx, overy);
      }
      else{
        context.drawImage(backImg, imgx, imgy);
        context.drawImage(score, scorex, scorey);
        serenityArray.forEach (function(serenityObj){
         context.drawImage(serenity, serenityObj.x, serenityObj.y);
        });
        bulletArray.forEach (function(bulletObj){
          context.drawImage(bullet, bulletObj.x, bulletObj.y);
        });
        attackArray.forEach (function(attackObj){
          context.drawImage(attack, attackObj.x, attackObj.y);
        });
        kaboomArray.forEach(function(kaboomObj){
          context.drawImage(kaboom, kaboomObj.x, kaboomObj.y);
        });
        context.strokeStyle = "#FDAD3A";
        context.font = "48px herculean";
        context.fillText(scoreAmt, 150, 50);
      }
    },
    initInput: function(){
      //tells the input manager to listen for key events
      this.inputManager.addKeyAction(keys.LEFT_ARROW);
      this.inputManager.addKeyAction(keys.RIGHT_ARROW);
      this.inputManager.addKeyAction(keys.DOWN_ARROW);
      this.inputManager.addKeyAction(keys.UP_ARROW)
      this.inputManager.addKeyAction(keys.SPACE, true);
      this.inputManager.addKeyAction(keys.ENTER);
    },
    update: function(millis){
      
      // --------------------------------------------------------
      // Game status.
      // --------------------------------------------------------
      
      if (gameStarted === false) {
        musicSource = rm.playSound(music, true); //Loop music.
        gameStarted = true;
      }
      else if (scoreAmt<0) {
        musicSource.noteOff();
        gameOver = true;
      }
      
        // --------------------------------------------------------
        // Enemy attacks.
        // --------------------------------------------------------
        timeSinceAttack += millis;
        if (timeSinceAttack > 100) {
          if (attackArray.length < 30){
            var attackObj = new Sprite({x:Math.random()*this.width, y:attacky, w:attack.width, h:attack.height, dx:0, dy:attackSpeed});
            attackArray.push(attackObj);
            var serenityObj = new Sprite({x:300, y:500, w:serenity.width, h:serenity.height, dx:0, dy:serenityspeed});
            serenityArray.push(serenityObj);
          }
          timeSinceAttack = 0;
        }
      
        bulletArray.forEach (function(bulletObj){
          bulletObj.y = bulletObj.y - bulletSpeed;
        });
      
        bulletArray = bulletArray.filter (function(bulletObj){
            if (bulletObj.y < 0 || bulletObj.destroy){
                return false;
            }
            else{
                return true;
            }
        });
      
        bulletArray.forEach (function(bulletObj){
            bulletObj.y = bulletObj.y - bulletSpeed;
            attackArray.forEach (function(attackObj){
                
                if (collides(bulletObj,attackObj)===true){
                    var kaboomObj = new Sprite({x:bulletObj.x - kaboom.width / 2, y:bulletObj.y - kaboom.height / 2, w:kaboom.width, h: kaboom.height, dx:0, dy:0});
                    kaboomArray.push(kaboomObj);
                    kaboomObj.countdown=500;
                    scoreAmt++;
                    bulletObj.destroy = true;
                    attackObj.destroy = true;
                }
                 if (collides(serenityObj, attackObj)===true){
                   var kaboomObj = new Sprite({x:serenityObj.x - kaboom.width / 2,y:serenityObj.y - kaboom.height / 2, w:kaboom.width, h: kaboom.height, dx:0, dy:0});
                   kaboomArray.push(kaboomObj);
                   kaboomObj.countdown=500;
                   scoreAmt--;
                   attackObj.destroy = true;
                 }
            });
        });
        
        attackArray.forEach (function(attackObj){
            attackObj.y = attackObj.y + attackSpeed;
        });
      
        attackArray = attackArray.filter (function(attackObj){
          if (attackObj.y > 700 || attackObj.destroy === true){
            return false;
          }
          else{
            return true;
          }
        }, this);
        
        kaboomArray.forEach (function(kaboomObj){
            if (kaboomObj.countdown>0){
                kaboomObj.countdown-=millis;
            }
        });

        kaboomArray = kaboomArray.filter (function(kaboomObj){
            if (kaboomObj.countdown <= 0){
                return false;
            }
            else{
                return true;
            }
        });
      
        // --------------------------------------------------------
        // Input.
        // --------------------------------------------------------
      
        if(this.inputManager.keyActions[keys.ENTER].isPressed()){
          gameStarted = true;
        }
        if(this.inputManager.keyActions[keys.LEFT_ARROW].isPressed() && serenityObj.x > 0){
          serenityObj.x-= serenityspeed; 
        }
        if(this.inputManager.keyActions[keys.RIGHT_ARROW].isPressed() && serenityObj.x < (this.width-serenityObj.width)){
          serenityObj.x+= serenityspeed;
        }
        if(this.inputManager.keyActions[keys.UP_ARROW].isPressed() && serenityObj.y > 0){
          serenityObj.y-=serenityspeed;
        }
        if(this.inputManager.keyActions[keys.DOWN_ARROW].isPressed() && serenityObj.y < (this.height-serenityObj.height)){
          serenityObj.y+=serenityspeed;
        }
      
        timeSinceShot += millis;
        if(this.inputManager.keyActions[keys.SPACE].getAmount()){
          if (timeSinceShot > 100) {
            bulletx = serenityObj.x+(serenityObj.width / 2);
            bullety = serenityObj.y+(serenityObj.height / 2);
            var bulletObj = new Sprite({x:bulletx,y:bullety, w:bullet.width, h: bullet.height, dx:0, dy: -bulletSpeed});
            bulletArray.push(bulletObj);
            rm.playSound(pewSound);
            timeSinceShot = 0;
          }
        }
      
      }
      
    }

  });

  //if you want to take a look at the game object in dev tools
  console.log(game);

  //launch the game!
  game.run();
});