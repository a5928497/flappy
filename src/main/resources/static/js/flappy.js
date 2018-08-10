$(function () {
    var boxx=0;
    var boxy=0;
    var boxwidth=window.screen.width;//384
    var boxheight=window.screen.height;//512
    var backgroundwidth=boxwidth;
    var backgroundheight=boxheight*0.875;
    var groundwidth=18.5;
    var groundheight=boxheight*0.125;

    var	birdwidth=46;
    var	birdheight=32;
    var	birdx=(boxwidth/2)-birdwidth;
    var	birdy=(backgroundheight/2)-birdheight;
    var birdvy=0;        //鸟初始的y轴速度
    var birdimage;
    var gravity=1;		 //重力加速度
    var jumpvelocity=11;	 //跳跃时获得的向上速度
    var birdstate;

    var upbackground;
    var bottombackground;
    var bottomstate;
    var pipeupimage;
    var pipedownimage;
    var pipewidth=69;	 //管道的宽度
    var blankwidth=126;  //上下管道之间的间隔
    var pipeinterval=pipewidth+120;	//两个管道之间的间隔
    var pipenumber=0;		//当前已经读取管道高度的个数
    var fps=30;				//游戏的帧数，推荐在30~60之间
    var gamestate=0;		//游戏状态：0--未开始，1--已开始，2--已结束
    var times;				//地板图片的条数  Math.ceil(boxwidth/groundwidth)+1;
    var highscore=0;		//得到过的最高分
    var score=0				//目前得到的分数
    var movespeed=groundwidth/4;	//场景向左移动的速度，为底部场景的宽度的1/4

    var tipimage;				//开始的提示图片
    var tipwidth=168;
    var tipheight=136;

    var boardimage;				//分数板的图片
    var boardx;
    var boardy=140;
    var boardwidth=282;
    var boardheight=245;

    var canvas;
    var ctx;
    var i;
    var pipeheight=[];
    //各种音效
    var flysound;		//飞翔的声音
    var scoresound;		//得分的声音
    var hitsound;		//撞到管道的声音
    var deadsound;		//死亡的声音
    var swooshingsound;		//切换界面时的声音

    var pipeoncanvas=[ 	 //要显示在Canvas上的管道的location和height
        [0,0],
        [0,0],
        [0,0]];
    //初始化游戏界面
    init();

    function init(){
        ctx=document.getElementById('canvas').getContext('2d');
        flysound = document.getElementById('flysound');
        scoresound = document.getElementById('scoresound');
        hitsound = document.getElementById('hitsound');
        deadsound = document.getElementById('deadsound');
        swooshingsound = document.getElementById('swooshingsound');
        ctx.lineWidth=2;
        //ctx.font="bold 40px HarlemNights";			//设置绘制分数的字体 Quartz Regular \HarlemNights
        ctx.font="bold 40px HirakakuProN-W6";	//绘制字体还原
        ctx.fillStyle="#FFFFFF";
        upbackground=new Image();
        upbackground.src="images/background.png";
        bottombackground=new Image();
        bottombackground.src="images/ground.png";
        bottomstate=1;
        birdimage=new Image();
        birdimage.src="images/bird.png";
        birdstate=1;
        tipimage=new Image();
        tipimage.src="images/space_tip.png";
        boardimage=new Image();
        boardimage.src="images/scoreboard.png";
        boardx=(backgroundwidth-boardwidth)/2;
        ///////////////////
        pipeupimage=new Image();
        pipeupimage.src="images/pipeup.png";
        pipedownimage=new Image();
        pipedownimage.src="images/pipedown.png";
        /////////////////////
        times=Math.ceil(boxwidth/groundwidth)+1;
        initPipe();
        canvas=document.getElementById("canvas");
        canvas.setAttribute("width",boxwidth);
        canvas.setAttribute("height",boxheight);
        // canvas.style.cssFloat = "left";
        canvas.addEventListener("mousedown",mouseDown,false);
        window.addEventListener("keydown",keyDown,false);
        //window.addEventListener("keydown",getkeyAndMove,false);
        setInterval(run,1000/fps);
    }

    //随机生成管道高度数据
    function initPipe(){
        for(i=0;i<200;i++)
            pipeheight[i]=Math.ceil(Math.random()*216)+56;//高度范围从56~272
        for(i=0;i<3;i++){
            pipeoncanvas[i][0]=boxwidth+i*pipeinterval;
            pipeoncanvas[i][1]=pipeheight[pipenumber];
            pipenumber++;
        }
    }

    //游戏的主要逻辑及绘制
    function run(){
        //游戏未开始
        if(gamestate==0){
            drawBeginScene();	//绘制开始场景
            drawBird();			//绘制鸟
            drawTip(); 			//绘制提示
        }
        //游戏进行中
        if(gamestate==1){
            birdvy=birdvy+gravity;
            drawScene(); 		//绘制场景
            drawBird();			//绘制鸟
            drawScore();		//绘制分数
            checkBird();		//检测鸟是否与物体发生碰撞
        }
        //游戏结束
        if(gamestate==2){
            if(birdy+birdheight<backgroundheight)	//如果鸟没有落地
                birdvy=birdvy+gravity;
            else {
                birdvy=0;
                birdy=backgroundheight-birdheight;
            }
            drawEndScene();		//绘制结束场景
            drawBird();		    //绘制鸟
            drawScoreBoard();   //绘制分数板
            //ctx.fillRect(boardx+14,boardy+boardheight-40,75,40); // 测试重新开始按钮的位置
        }
    }

    function drawTip(){
        ctx.drawImage(tipimage,birdx-57,birdy+birdheight+10,tipwidth,tipheight);
    }

    //绘制分数板
    function drawScoreBoard(){
        //绘制分数板
        ctx.drawImage(boardimage,boardx,boardy,boardwidth,boardheight);
        //绘制当前的得分
        ctx.fillText(score,boardx+140,boardheight/2+boardy-8);//132
        //绘制最高分
        ctx.fillText(highscore,boardx+140,boardheight/2+boardy+44);//184
    }
    //绘制开始场景(不包括管道)
    function drawBeginScene(){
        //清理画布上上一桢的画面
        ctx.clearRect(boxx,boxy,boxwidth,boxheight);
        //绘制上方静态背景
        ctx.drawImage(upbackground,0,0,backgroundwidth,backgroundheight);
        //绘制下方的动态背景
        drawmovingscene();
        //绘制边框线
        ctx.strokeRect(boxx+1,boxy+1,boxwidth-2,boxheight-2);
    }

    //绘制场景
    function drawScene(){
        ctx.clearRect(boxx,boxy,boxwidth,boxheight);	//清理画布上上一桢的画面
        ctx.drawImage(upbackground,0,0,backgroundwidth,backgroundheight);	//绘制上方静态背景
        drawmovingscene();	//绘制下方的动态背景
        drawAllPipe();	//绘制管道
        ctx.strokeRect(boxx+1,boxy+1,boxwidth-2,boxheight-2);	//绘制边框线
    }

    //绘制结束场景(不包括管道)
    function drawEndScene(){
        ctx.clearRect(boxx,boxy,boxwidth,boxheight);	//清理画布上上一桢的画面
        ctx.drawImage(upbackground,0,0,backgroundwidth,backgroundheight);	//绘制上方静态背景
        //绘制下方的静态背景，根据bottomstate来判断如何绘制静态地面
        switch(bottomstate){
            case 1:
                for(i=0;i<times;i++)
                    ctx.drawImage(bottombackground,groundwidth*(i-0.75),backgroundheight,groundwidth,groundheight);
                break;
            case 2:
                for(i=0;i<times;i++)
                    ctx.drawImage(bottombackground,groundwidth*i,backgroundheight,groundwidth,groundheight);
                break;
            case 3:
                for(i=0;i<times;i++)
                    ctx.drawImage(bottombackground,groundwidth*(i-0.25),backgroundheight,groundwidth,groundheight);
                break;
            case 4:
                for(i=0;i<times;i++)
                    ctx.drawImage(bottombackground,groundwidth*(i-0.5),backgroundheight,groundwidth,groundheight);
        }
        //绘制当前的柱子
        for(i=0;i<3;i++){
            drawPipe(pipeoncanvas[i][0],pipeoncanvas[i][1]);
        }
        ctx.strokeRect(boxx+1,boxy+1,boxwidth-2,boxheight-2);	//绘制边框线
    }

    //绘制下方的动态背景
    function drawmovingscene(){
        if(bottomstate==1){
            for(i=0;i<times;i++)
                ctx.drawImage(bottombackground,groundwidth*i,backgroundheight,groundwidth,groundheight);
            bottomstate=2;
        }
        else if(bottomstate==2){
            for(i=0;i<times;i++)
                ctx.drawImage(bottombackground,groundwidth*(i-0.25),backgroundheight,groundwidth,groundheight);
            bottomstate=3;
        }
        else if(bottomstate==3){
            for(i=0;i<times;i++)
                ctx.drawImage(bottombackground,groundwidth*(i-0.5),backgroundheight,groundwidth,groundheight);
            bottomstate=4;
        }
        else if(bottomstate==4){
            for(i=0;i<times;i++)
                ctx.drawImage(bottombackground,groundwidth*(i-0.75),backgroundheight,groundwidth,groundheight);
            bottomstate=1;
        }
    }

    //使用给定的高度和位置绘制上下两根管道
    function drawPipe(location,height){
        //绘制下方的管道
        ctx.drawImage(pipeupimage,0,0,pipewidth*2,height*2,location,boxheight-(height+groundheight),pipewidth,height);
        //绘制上方的管道
        ctx.drawImage(pipedownimage,0,793-(backgroundheight-height-blankwidth)*2,pipewidth*2,
            (backgroundheight-height-blankwidth)*2,location,0,pipewidth,backgroundheight-height-blankwidth);
    }

    //绘制需要显示的管道
    function drawAllPipe(){
        for(i=0;i<3;i++){
            pipeoncanvas[i][0]=pipeoncanvas[i][0]-movespeed;
        }
        if(pipeoncanvas[0][0]<=-pipewidth){
            pipeoncanvas[0][0]=pipeoncanvas[1][0];
            pipeoncanvas[0][1]=pipeoncanvas[1][1];
            pipeoncanvas[1][0]=pipeoncanvas[2][0];
            pipeoncanvas[1][1]=pipeoncanvas[2][1];
            pipeoncanvas[2][0]=pipeoncanvas[2][0]+pipeinterval;
            pipeoncanvas[2][1]=pipeheight[pipenumber];
            pipenumber++;
        }
        for(i=0;i<3;i++){
            drawPipe(pipeoncanvas[i][0],pipeoncanvas[i][1]);
        }
    }

    function drawBird(){
        birdy=birdy+birdvy;
        if(gamestate==0){
            drawMovingBird();
        }
        //根据鸟的y轴速度来判断鸟的朝向,只在游戏进行阶段生效
        else if(gamestate==1){
            ctx.save();
            if(birdvy<=8){
                ctx.translate(birdx+birdwidth/2,birdy+birdheight/2);
                ctx.rotate(-Math.PI/6);
                ctx.translate(-birdx-birdwidth/2,-birdy-birdheight/2);
            }
            if(birdvy>8&&birdvy<=12){
                ctx.translate(birdx+birdwidth/2,birdy+birdheight/2);
                ctx.rotate(Math.PI/6);
                ctx.translate(-birdx-birdwidth/2,-birdy-birdheight/2);
            }
            if(birdvy>12&&birdvy<=16){
                ctx.translate(birdx+birdwidth/2,birdy+birdheight/2);
                ctx.rotate(Math.PI/3);
                ctx.translate(-birdx-birdwidth/2,-birdy-birdheight/2);
            }
            if(birdvy>16){
                ctx.translate(birdx+birdwidth/2,birdy+birdheight/2);
                ctx.rotate(Math.PI/2);
                ctx.translate(-birdx-birdwidth/2,-birdy-birdheight/2);
            }
            drawMovingBird();
            ctx.restore();
        }
        //游戏结束后鸟头向下并停止活动
        else if(gamestate==2){
            ctx.save();
            ctx.translate(birdx+birdwidth/2,birdy+birdheight/2);
            ctx.rotate(Math.PI/2);
            ctx.translate(-birdx-birdwidth/2,-birdy-birdheight/2);
            ctx.drawImage(birdimage,0,0,92,64,birdx,birdy,birdwidth,birdheight);
            ctx.restore();
        }
    }
    //绘制扇动翅膀的鸟
    function drawMovingBird(){
        if(birdstate==1||birdstate==2||birdstate==3){
            ctx.drawImage(birdimage,0,0,92,64,birdx,birdy,birdwidth,birdheight);
            birdstate++;
        }
        else if(birdstate==4||birdstate==5||birdstate==6){
            ctx.drawImage(birdimage,92,0,92,64,birdx,birdy,birdwidth,birdheight);
            birdstate++;
        }
        else if(birdstate==7||birdstate==8||birdstate==9){
            ctx.drawImage(birdimage,184,0,92,64,birdx,birdy,birdwidth,birdheight);
            birdstate++;
            if(birdstate==9) birdstate=1;
        }
    }

    function drawScore(){
        ctx.fillText(score,boxwidth/2-2,120);
    }

    //检查鸟是否与管道产生碰撞（不可能与第三组管道重合），以及鸟是否碰撞地面
    function checkBird(){

        //通过了一根管道加一分
        if(birdx>pipeoncanvas[0][0]&&birdx<pipeoncanvas[0][0]+movespeed
            ||birdx>pipeoncanvas[1][0]&&birdx<pipeoncanvas[1][0]+movespeed){
            playSound(scoresound,"sounds/point.mp3");
            score++;
        }
        //先判断第一组管道
        //如果鸟在x轴上与第一组管道重合
        if(birdx+birdwidth>pipeoncanvas[0][0]&&birdx+birdwidth<pipeoncanvas[0][0]+pipewidth+birdwidth){
            //如果鸟在y轴上与第一组管道上部或下部重合
            if(birdy<backgroundheight-pipeoncanvas[0][1]-blankwidth||birdy+birdheight>backgroundheight-pipeoncanvas[0][1]){
                hitPipe();
            }
        }
        //判断第二组管道
        //如果鸟在x轴上与第二组管道重合
        //这里我原本使用else if出现了问题，但第一版中却没有问题，对比代码后发现原因是上方第一个if后没有加大括号，
        //这里的else无法区分对应哪一个if，加上大括号后问题解决，建议将if后的内容都加上大括号，养成良好的变成习惯
        else if(birdx+birdwidth>pipeoncanvas[1][0]&&birdx+birdwidth<pipeoncanvas[1][0]+pipewidth+birdwidth){
            //如果鸟在y轴上与第二组管道上部或下部重合
            if(birdy<backgroundheight-pipeoncanvas[1][1]-blankwidth||birdy+birdheight>backgroundheight-pipeoncanvas[1][1]){
                hitPipe();
            }
        }
        //判断是否碰撞地面
        else if(birdy+birdheight>backgroundheight){
            hitPipe();
        }
    }

    //撞击到管道或地面后的一些操作
    function hitPipe(){
        ctx.font="bold 40px HirakakuProN-W6";
        //ctx.font="bold 35px HarlemNights";
        ctx.fillStyle="#000000";
        playSound(hitsound,"sounds/hit.mp3");
        playSound(deadsound,"sounds/die.mp3");
        updateScore();
        gamestate=2;	//游戏结束
    }

    //刷新最好成绩
    function updateScore(){
        if(score>highscore)
            highscore=score;
    }

    //处理键盘事件
    function keyDown(){
        if(gamestate==0){
            playSound(swooshingsound,"sounds/swooshing.mp3");
            birdvy=-jumpvelocity;
            gamestate=1;
        }
        else if(gamestate==1){
            playSound(flysound,"sounds/wing.mp3");
            birdvy=-jumpvelocity;
        }
    }

    //处理鼠标点击事件，相比键盘多了位置判断
    function mouseDown(ev){
        var mx;			//存储鼠标横坐标
        var my;			//存储鼠标纵坐标
        if ( ev.layerX ||  ev.layerX == 0) { // Firefox
            mx= ev.layerX;
            my = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) { // Opera
            mx = ev.offsetX;
            my = ev.offsetY;
        }
        if(gamestate==0){
            playSound(swooshingsound,"sounds/swooshing.mp3");
            birdvy=-jumpvelocity;
            gamestate=1;
        }
        else if(gamestate==1){
            playSound(flysound,"sounds/wing.mp3");
            birdvy=-jumpvelocity;
        }
        //游戏结束后判断是否点击了重新开始
        else if(gamestate==2){
            //ctx.fillRect(boardx+14,boardy+boardheight-40,75,40);
            //鼠标是否在重新开始按钮上
            if(mx>boardx+14&&mx<boardx+89&&my>boardy+boardheight-40&&my<boardy+boardheight){
                playSound(swooshingsound,"sounds/swooshing.mp3");
                restart();
            }
        }
    }

    function restart(){
        gamestate=0;	//回到未开始状态
        //ctx.font="bold 40px HarlemNights";	//绘制字体还原
        ctx.font="bold 40px HirakakuProN-W6";	//绘制字体还原
        ctx.fillStyle="#FFFFFF";
        score=0;		//当前分数清零
        pipenumber=0;	//读取的管道数清零
        initPipe();		//重新初始化水管高度
        birdx=192-birdwidth;	//鸟的位置和速度回到初始值
        birdy=224-birdheight;
        birdvy=0;
    }

    function playSound(sound,src){
        if(src!='' && typeof src!=undefined){
            sound.src = src;
        }
    }
});