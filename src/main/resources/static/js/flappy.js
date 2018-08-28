$(function () {
    var boxx=0;
    var boxy=0;
    var boxwidth=window.screen.width;//384
    var boxheight=window.screen.height;//512
    var backgroundwidth=boxwidth;
    var backgroundheight=boxheight*0.875;
    var groundwidth=18.5;
    var groundheight=boxheight*0.125;

    var	catwidth=boxwidth*0.12;
    var	catheight=catwidth*0.7;
    var	catx=(boxwidth/2)-catwidth;
    var	caty=(backgroundheight/2.5)-catheight;
    var catvy=0;        //猫初始的y轴速度
    var catimage;
    var gravity=0.85;		 //重力加速度
    var jumpvelocity=8;	 //跳跃时获得的向上速度
    var catstate;

    var upbackground;
    var bottombackground;
    var bottomstate;
    var pipeupimage;
    var pipedownimage;
    var pipewidth=boxwidth*0.19;	 //管道的宽度
    var blankwidth=catheight*3.9375;  //上下管道之间的间隔
    var pipeinterval=boxwidth*0.7;	//两个管道之间的间隔
    var pipenumber=0;		//当前已经读取管道高度的个数
    var fps=30;				//游戏的帧数，推荐在30~60之间
    var gamestate=0;		//游戏状态：0--未开始，1--已开始，2--已结束
    var times;				//地板图片的条数  Math.ceil(boxwidth/groundwidth)+1;
    var highscore=0;		//得到过的最高分
    var score=0				//目前得到的分数
    var movespeed=groundwidth/4;	//场景向左移动的速度，为底部场景的宽度的1/4

    var tipimage;				//开始的提示图片
    var tipwidth=boxwidth*0.4375;
    var tipheight=boxheight*0.265;

    var boardimage;				//分数板的图片
    var boardx;
    var boardy=boxheight*0.2734;
    var boardwidth=boxwidth*0.7343;
    var boardheight=boxheight*0.4785;

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
        catimage=new Image();
        catimage.src="images/cat.png";
        catstate=1;
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
        canvas.addEventListener("mousedown",mouseDown,false);
        window.addEventListener("keydown",keyDown,false);
        //window.addEventListener("keydown",getkeyAndMove,false);
        setInterval(run,1000/fps);
    }

    //随机生成管道高度数据
    function initPipe(){
        for(i=0;i<200;i++)
            pipeheight[i]=Math.ceil(Math.random()*(boxheight/2))+(boxheight*0.11);//高度范围从56~272
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
            drawCat();			//绘制猫
            drawTip(); 			//绘制提示
        }
        //游戏进行中
        if(gamestate==1){
            catvy=catvy+gravity;
            drawScene(); 		//绘制场景
            drawCat();			//绘制猫
            drawScore();		//绘制分数
            checkCat();		//检测猫是否与物体发生碰撞
        }
        //游戏结束
        if(gamestate==2){
            if(caty+catheight<backgroundheight)	//如果猫没有落地
                catvy=catvy+gravity;
            else {
                catvy=0;
                caty=backgroundheight-catheight;
            }
            drawEndScene();		//绘制结束场景
            drawCat();		    //绘制猫
            drawScoreBoard();   //绘制分数板
            //ctx.fillRect(boardx+14,boardy+boardheight-40,75,40); // 测试重新开始按钮的位置
        }
    }

    function drawTip(){
        ctx.drawImage(tipimage,catx-57,caty+catheight+10,tipwidth,tipheight);
    }

    //绘制分数板
    function drawScoreBoard(){
        //绘制分数板
        ctx.drawImage(boardimage,boardx,boardy,boardwidth,boardheight);
        //绘制当前的得分
        ctx.fillText(score,boardx+140,boardheight/2+boardy*0.95);//132
        //绘制最高分
        ctx.fillText(highscore,boardx+140,boardheight/2+boardy*1.314);//184
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

    function drawCat(){
        caty=caty+catvy;
        if(gamestate==0){
            drawMovingCat();
        }
        //根据猫的y轴速度来判断猫的朝向,只在游戏进行阶段生效
        else if(gamestate==1){
            ctx.save();
            if(catvy<=8){
                ctx.translate(catx+catwidth/2,caty+catheight/2);
                ctx.rotate(-Math.PI/6);
                ctx.translate(-catx-catwidth/2,-caty-catheight/2);
            }
            if(catvy>8&&catvy<=12){
                ctx.translate(catx+catwidth/2,caty+catheight/2);
                ctx.rotate(Math.PI/6);
                ctx.translate(-catx-catwidth/2,-caty-catheight/2);
            }
            if(catvy>12&&catvy<=16){
                ctx.translate(catx+catwidth/2,caty+catheight/2);
                ctx.rotate(Math.PI/3);
                ctx.translate(-catx-catwidth/2,-caty-catheight/2);
            }
            if(catvy>16){
                ctx.translate(catx+catwidth/2,caty+catheight/2);
                ctx.rotate(Math.PI/2);
                ctx.translate(-catx-catwidth/2,-caty-catheight/2);
            }
            drawMovingCat();
            ctx.restore();
        }
        //游戏结束后猫头向下并停止活动
        else if(gamestate==2){
            ctx.save();
            ctx.translate(catx+catwidth/2,caty+catheight/2);
            ctx.rotate(Math.PI/2);
            ctx.translate(-catx-catwidth/2,-caty-catheight/2);
            ctx.drawImage(catimage,0,0,92,64,catx,caty,catwidth,catheight);
            ctx.restore();
        }
    }
    //绘制扇动披风的猫
    function drawMovingCat(){
        if(catstate==1||catstate==2||catstate==3){
            ctx.drawImage(catimage,0,0,92,64,catx,caty,catwidth,catheight);
            catstate++;
        }
        else if(catstate==4||catstate==5||catstate==6){
            ctx.drawImage(catimage,92,0,92,64,catx,caty,catwidth,catheight);
            catstate++;
        }
        else if(catstate==7||catstate==8||catstate==9){
            ctx.drawImage(catimage,184,0,92,64,catx,caty,catwidth,catheight);
            catstate++;
            if(catstate==9) catstate=1;
        }
    }

    function drawScore(){
        ctx.fillText(score,boxwidth/2-2,120);
    }

    //检查猫是否与管道产生碰撞（不可能与第三组管道重合），以及猫是否碰撞地面
    function checkCat(){

        //通过了一根管道加一分
        if(catx>pipeoncanvas[0][0]&&catx<pipeoncanvas[0][0]+movespeed
            ||catx>pipeoncanvas[1][0]&&catx<pipeoncanvas[1][0]+movespeed){
            playSound(scoresound,"sounds/point.mp3");
            score++;
        }
        //先判断第一组管道
        //如果猫在x轴上与第一组管道重合
        if(catx+catwidth>pipeoncanvas[0][0]&&catx+catwidth<pipeoncanvas[0][0]+pipewidth+catwidth){
            //如果猫在y轴上与第一组管道上部或下部重合
            if(caty<backgroundheight-pipeoncanvas[0][1]-blankwidth||caty+catheight>backgroundheight-pipeoncanvas[0][1]){
                hitPipe();
            }
        }
        //判断第二组管道
        //如果猫在x轴上与第二组管道重合
        else if(catx+catwidth>pipeoncanvas[1][0]&&catx+catwidth<pipeoncanvas[1][0]+pipewidth+catwidth){
            //如果猫在y轴上与第二组管道上部或下部重合
            if(caty<backgroundheight-pipeoncanvas[1][1]-blankwidth||caty+catheight>backgroundheight-pipeoncanvas[1][1]){
                hitPipe();
            }
        }
        //判断是否碰撞地面
        else if(caty+catheight>backgroundheight){
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
            catvy=-jumpvelocity;
            gamestate=1;
        }
        else if(gamestate==1){
            playSound(flysound,"sounds/wing.mp3");
            catvy=-jumpvelocity;
        }
        else if(gamestate == 2) {
            playSound(swooshingsound,"sounds/swooshing.mp3");
            restart();
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
            catvy=-jumpvelocity;
            gamestate=1;
        }
        else if(gamestate==1){
            playSound(flysound,"sounds/wing.mp3");
            catvy=-jumpvelocity;
        }
        //游戏结束后判断是否点击了重新开始
        else if(gamestate==2){
            //ctx.fillRect(boardx+14,boardy+boardheight-40,75,40);
            //鼠标是否在重新开始按钮上
            // if(mx>boardx+14&&mx<boardx+89&&my>boardy+boardheight-40&&my<boardy+boardheight){
                playSound(swooshingsound,"sounds/swooshing.mp3");
                restart();
            // }
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
        catx=(boxwidth/2)-catwidth;	//猫的位置和速度回到初始值
        caty=(backgroundheight/2.5)-catheight;
        catvy=0;
    }

    function playSound(sound,src){
        if(src!='' && typeof src!=undefined){
            sound.src = src;
        }
    }
});