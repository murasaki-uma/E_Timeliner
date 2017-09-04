import OscFragTimeLine from "./OscFlagTimeLine";
declare function require(x: string): any;
import * as SVG from 'svg.js';
import * as $ from "jquery";
import * as Math from "mathjs";
import OscFlag from './OscFlag';
import TimeLine from './TimeLine';
import AudioTimeLine from "./AudioTimeLine";

class Main
{
    public xhr:XMLHttpRequest;


    private timeline:TimeLine;
    private startTime:number = 0;

    public lineWidth:number = 2;
    public selectedLine:SVG.Rect;
    public timelineQuery:any;

    public playTimeLine:SVG.Rect;

    public isPlay:boolean = false;

    public audioScale:any = {x:1,y:1.0};

    public duration_h:number = 0;
    public duration_m:number = 0;
    public duration_s:number = 0;
    public duration_f:number = 0;
    public fps:number = 60;

    public framePerPixel:number = 0;
    public pixelPerFrame:number = 0;
    public durationFrameNums:number;
    public preHour:number = 0;
    public preMin:number = 0;
    public preSec:number=0;
    public preFrame:number = 0;


    public updateStartTime:number = 0;
    public updateStopTime:number = 0;
    public updatePauseTime:number = 0;

    public startTime:number = 0;
    public replayTime:number = 0;
    public pausingTime:number = 0;
    public playingTime:number = 0;
    public nowTime:number;
    public audioStartTime:number = 60*30;

    // public time_update:number;

    public isPlayFirst:boolean = true;
    public isPause:boolean = false;


    public fragWidth:number = 6;
    public mousePosOnTimeline:any = {x:0,y:0};

    public oscFragTimeLine:OscFragTimeLine;

    public isReadyDoubleClick:boolean = false;

    public isAudioDraggable:boolean = false;

    public audiolinetest:AudioTimeLine;
    public isPointerDown = false;
    public isPointerDrag:boolean = false;

    public moveStart = {x:0,y:0};
    public moveEnd = {x:0,y:0};
    constructor()
    {
        console.log("hello!");

        $("#playButton").on('click',this.play);
        $("#stopButton").on('click',this.pause);
        $("#restartButton").on('click',this.restart);


        this.init();
    }
    public init()
    {

        this.timeline = new TimeLine(window.innerWidth*0.9,300);
        this.oscFragTimeLine = new OscFragTimeLine(this.timeline,this.lineWidth);


        console.log($('#min').val());
        this.duration_h = Number($('#hour').val());
        this.duration_m = Number($('#min').val());
        this.duration_s = Number($('#sec').val());
        this.duration_f = Number($('#frame').val());
        this.calDuration();



        let polyline = this.timeline.container.polyline
            ([
                this.lineWidth/2,this.lineWidth/2,
                this.lineWidth/2,this.timeline.height-this.lineWidth/2,
                this.timeline.width-this.lineWidth/2, this.timeline.height-this.lineWidth/2,
                this.timeline.width-this.lineWidth/2,this.lineWidth/2,
                this.lineWidth/2,this.lineWidth/2
            ]);
        polyline.fill('none');
        polyline.stroke({color:'#616161',width:this.lineWidth});

        this.playTimeLine = this.timeline.container.rect(this.lineWidth,this.timeline.height-this.lineWidth).move(1,this.lineWidth/2).fill('#616161');
        this.selectedLine = this.timeline.container.rect(this.lineWidth,this.timeline.height-this.lineWidth).move(1,this.lineWidth/2).fill('#ff0066');

        this.xhr = new XMLHttpRequest();

        this.timelineQuery = document.querySelector('#'+this.timeline.container.id());

        this.timelineQuery.addEventListener('mousemove',this.onMouseMove,false);
        this.timelineQuery.addEventListener('pointerdown',this.onPointerDown,false);
        this.timelineQuery.addEventListener('pointerup',this.onPointerUp,false);
        this.timelineQuery.addEventListener('mousemove',this.onMouseMove,false);
        this.timelineQuery.addEventListener('mouseup',this.addOsc,false);
        this.timelineQuery.addEventListener('dragstart',this.onDragStart,false);
        this.timelineQuery.addEventListener('dragend',this.onDragEnd,false);
        $(".durationValues").on('input',this.onDurationChange);


        this.audiolinetest = new AudioTimeLine("sound/sample.mp3",this.pixelPerFrame,this.framePerPixel,this.timeline.width);

        this.update();


    }

    public restart =()=>
    {
        this.updateStartTime = 0;
        this.updateStopTime = 0;
        this.updatePauseTime = 0;
        this.playingTime = 0;
        this.updateStartTime = new Date().getTime();
        this.audioReset();
        this.calTimelineBar();
    }

    public calTimelineBar()
    {
        let per = ((this.playingTime)*60) / this.durationFrameNums;
        this.playTimeLine.move(this.timeline.width*per,this.lineWidth/2);
    }



    public onPointerDown =(evt)=>
    {

        var loc= this.getCursor(evt,this.timelineQuery);

        this.playingTime = (loc.x * this.framePerPixel)/60;
        this.updateStartTime = new Date().getTime();
        this.calTimelineBar();
        this.pause();

        if(!this.isPointerDown)
        {
            this.moveStart.x = loc.x;
            this.moveStart.y = loc.y;
            console.log("start" + this.moveStart);
        }

        if(loc.x >= this.audiolinetest.startX && loc.x <= this.audiolinetest.width){
            this.isPointerDown = true;
        }
    }



    public onPointerUp =(evt)=>
    {
        console.log("up");
        var loc= this.getCursor(evt,this.timelineQuery);
        this.moveEnd.x = loc.x;
        this.moveEnd.y = loc.y;

        if(this.isPointerDrag)
        {
            this.audiolinetest.moveAudioDate(this.moveEnd.x- this.moveStart.x,0);
            this.audiolinetest.moveBG(loc.x- this.moveStart.x,0);

        }

        this.isPointerDown = false;
        this.isPointerDrag = false;


    }
    public onMouseMove =(evt)=>
    {
        var loc= this.getCursor(evt,this.timelineQuery);
        this.mousePosOnTimeline.x = loc.x;
        this.mousePosOnTimeline.y = loc.y;
        this.selectedLine.move(loc.x+this.lineWidth/2,this.lineWidth/2);
        console.log(loc);
        let t = loc.x * this.framePerPixel;
        let _s = Math.floor((t)%60);
        let _m = Math.floor (t % 3600 / 60);
        console.log("m: " + _m + " s: " + _s);
        console.log("time: " + this.mousePosOnTimeline.x * this.framePerPixel);

        if(this.isPointerDown)

        {
            this.isPointerDrag = true;
        }

    }

    public onDragStart =(event)=>
    {
        console.log("drag start!");
    }

    public onDragEnd =(event)=>
    {
        console.log("drag end!");
    }


    public addOsc =(evt)=>
    {

        this.oscFragTimeLine.addOsc(evt,this.mousePosOnTimeline,this.framePerPixel,this.pixelPerFrame);
        // o

    }


    public calDuration()
    {
        this.durationFrameNums = this.duration_f + this.duration_s*this.fps + this.duration_m * 60 * this.fps + this.duration_h * 60 * 60 * this.fps;
        console.log(this.durationFrameNums);
        this.framePerPixel =  this.durationFrameNums/this.timeline.width;
        console.log("frameperpixel: " + this.framePerPixel);
        this.pixelPerFrame = this.timeline.width/this.durationFrameNums;
        console.log("pixelPerFrame: " + this.pixelPerFrame);
    }

    public onDurationChange =()=>
    {
        this.calDuration();
    }

    public onWindowResize()
    {

    }

    public getCursor(evt,svgQuery) {
        var pt=svgQuery.createSVGPoint();
        pt.x=evt.clientX;
        pt.y=evt.clientY;
        return pt.matrixTransform(svgQuery.getScreenCTM().inverse());
    }
    public timeToDom()
    {
        $(".timeline_f").text(this.preFrame);
    }

    public resetTime()
    {
        this.preHour = new Date().getHours();
        this.preMin = new Date().getMinutes();
        this.preSec = new Date().getSeconds();
        this.preFrame = 0
    }

    public play = () =>
    {


        console.log("push play");

        if($('#playButton').hasClass('pause')){

            this.pause();

        }else if($('#playButton').hasClass('play')) {

            this.isPlay = true;

            this.updateStartTime = new Date().getTime();



                this.audioPlay();


            this.update();


            $('.play').removeClass('play').addClass('pause').val('PAUSE');

        }

    }

    public audioRestart =()=>
    {
        this.audiolinetest.restart();
    }


    public audioReset =()=>
    {
        this.audiolinetest.reset();
    }

    public audioPlay =()=>
    {
        this.audiolinetest.play(this.playTimeLine.x() * this.framePerPixel/60);
    }

    public resetTime =()=>
    {
        this.preFrame = 0;
        this.startTime = new Date().getTime();
        this.nowTime = new Date().getTime();
    }


    public pause=()=>
    {

        this.isPlay = false;
        $('#playButton').addClass('play');
        $('#playButton').removeClass('pause');
        $('#playButton').val('PLAY');

        this.updatePauseTime = new Date().getTime();
        this.isPause = true;


        this.playingTime +=  (new Date().getTime() - this.updateStartTime)/1000;


            this.audioPause();


    }

    public audioPause =()=>
    {

        this.audiolinetest.pause();
    }





    public update = (time?) =>
    {

        if(this.isPlay) {
            let dTime = (new Date().getTime() - this.updateStartTime)/1000;
            this.preSec = new Date().getSeconds();
            let mill = dTime - Math.floor(dTime);
            console.log("playingTIme: " + (dTime+this.playingTime)*60);
            let framenum = Math.floor(mill * 60);


            $('.timeline_f').text(framenum);
            let _s = Math.floor((this.playingTime+dTime)%60);
            $('.timeline_s').text(_s);


            let _m = Math.floor( (this.playingTime+dTime) % 3600 / 60 );
            console.log(_m);
            $('.timeline_m').text(_m);

            let h = Math.floor( (this.playingTime+dTime) / 3600);;
            $('.timeline_h').text(h);

            this.oscFragTimeLine.update(this.playingTime,dTime);

            if(this.audiolinetest.delay <= (this.playingTime+dTime)*60)
            {
                console.log("audio play!!");
                if(!this.audiolinetest.isTimelineStart)
                {

                    // this.audioPlay();
                    this.audioPlay();
                    this.audiolinetest.isTimelineStart = true;
                }

            } else {
                if(this.audiolinetest.isTimelineStart) {
                    this.audioReset();
                }

            }


            let per = ((this.playingTime+dTime)*60) / this.durationFrameNums;
            this.playTimeLine.move(this.timeline.width*per,this.lineWidth/2);

        }

        requestAnimationFrame(this.update);
    }
}

$(window).on("load",function () {
    const main = new Main();



});
