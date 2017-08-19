declare function require(x: string): any;
import * as SVG from 'svg.js';
import * as $ from "jquery";
import * as Math from "mathjs";
import AudioTimeLine from "./AudioTimeLine";


class FlagValues
{
    public frag:SVG.Rect;
    public values:any = {name:"value"};
    public isSelected:boolean = false;
    public sendingOscTime:number = 30;
    public time:number = 0;
    public width:number = 4;
    public pixelPerFrame:number = 0.1;


    constructor(frag:SVG.Rect, time:number, pixelPerFrame:number)
    {
        this.frag = frag;
        this.time = time;
        this.pixelPerFrame = pixelPerFrame;

        // this.frag.id()

        // $("#" + this.frag.id()).on('click',this.select());

    }

    public select =()=>
    {

        console.log(this.frag.id());
        this.isSelected = true;
        this.frag.stroke({
            color: '#0d47a1',
            opacity: 1.0,
            width: 2
        });
        $(".inputFlagValue").val(JSON.stringify(this.values));
        $("#sendingFrames").val(this.sendingOscTime);



    }

    public diselect =()=>
    {
        this.isSelected = false;
        this.frag.stroke({opacity:0.0});


    }

    public setInputValues()
    {

        this.values = JSON.parse( $(".inputFlagValue").val());
        this.sendingOscTime = Number($("#sendingFrames").val());
        this.frag.width(this.sendingOscTime * this.pixelPerFrame);
        this.width = this.sendingOscTime * this.pixelPerFrame;
        // $(".inputFlagValue").addClass("hide");
        // $(".flagValueDebug").removeClass("hide");
    }
}

class Main
{
    public xhr:XMLHttpRequest;
    public audioContext:AudioContext;
    public audioBuffers:AudioBuffer[] = [];
    public audioSouce:AudioBufferSourceNode;
    public audioGainNode:any;
    private timeline:SVG.Container;
    private timelineScale:SVG.Container;
    private startTime:number = 0;
    private replayTime:number = 0;

    private pauseTime:number = 0;

    public timelineWidth:number = window.innerWidth*0.9;
    public timelineHeight:number = 300;
    public lineWidth:number = 2;
    public selectedLine:SVG.Line;
    public svg_timeline:any;

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

    public oscFrags:FlagValues[] = [];

    public isReadyDoubleClick:boolean = false;

    public isAudioDraggable:boolean = false;

    public audiolinetest:AudioTImeLIne;
    public isPointerDown = false;

    public moveStart = {x:0,y:0};
    public moveEnd = {x:0,y:0};
    constructor()
    {
        console.log("hello!");

        $("#playButton").on('click',this.play);
        $("#stopButton").on('click',this.pause);




        this.init();
    }
    public init()
    {

        this.timeline = SVG('timeline').size(this.timelineWidth,this.timelineHeight);
        this.timelineScale = SVG('timelineScale').size(this.timelineWidth,this.timelineHeight);


        console.log($('#min').val());
        this.duration_h = Number($('#hour').val());
        this.duration_m = Number($('#min').val());
        this.duration_s = Number($('#sec').val());
        this.duration_f = Number($('#frame').val());
        this.calDuration();



        let polyline = this.timeline.polyline
            ([
                this.lineWidth/2,this.lineWidth/2,
                this.lineWidth/2,this.timelineHeight-this.lineWidth/2,
                this.timelineWidth-this.lineWidth/2, this.timelineHeight-this.lineWidth/2,
                this.timelineWidth-this.lineWidth/2,this.lineWidth/2,
                this.lineWidth/2,this.lineWidth/2
            ]);
        polyline.fill('none');
        polyline.stroke({color:'#616161',width:this.lineWidth});

        this.playTimeLine = this.timeline.rect(this.lineWidth,this.timelineHeight-this.lineWidth).move(1,this.lineWidth/2).fill('#616161');
        this.selectedLine = this.timeline.rect(this.lineWidth,this.timelineHeight-this.lineWidth).move(1,this.lineWidth/2).fill('#f06');

        this.xhr = new XMLHttpRequest();
        this.audioContext = new AudioContext();








        this.svg_timeline = document.querySelector('#'+this.timeline.id());


        this.svg_timeline.addEventListener('mousemove',this.onMouseMove,false);
        this.svg_timeline.addEventListener('pointerdown',this.onPointerDown,false);
        this.svg_timeline.addEventListener('pointerup',this.onPointerUp,false);
        this.svg_timeline.addEventListener('mousemove',this.onMouseMove,false);
        this.svg_timeline.addEventListener('mouseup',this.addOsc,false);
        $(".durationValues").on('input',this.onDurationChange);



        this.audiolinetest = new AudioTimeLine("sound/sample.mp3",this.pixelPerFrame,this.timeline.width());

        this.update();


    }

    public onFlagEdited =()=>
    {
        for(let i = 0; i < this.oscFrags.length; i++)
        {

        }
    }


    public onPointerDown =(evt)=>
    {

        var loc= this.getCursor(evt);
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
        var loc= this.getCursor(evt);
        this.moveEnd.x = loc.x;
        this.moveEnd.y = loc.y;

        if(this.isPointerDown)
        {
            this.audiolinetest.move(this.moveEnd.x- this.moveStart.x,0);
            this.isPointerDown = false;
        }


    }
    public onMouseMove =(evt)=>
    {
        var loc= this.getCursor(evt);
        this.mousePosOnTimeline.x = loc.x;
        this.mousePosOnTimeline.y = loc.y;
        this.selectedLine.move(loc.x+this.lineWidth/2,this.lineWidth/2);
        console.log(loc);
        let t = loc.x * this.framePerPixel;
        let _s = Math.floor((t)%60);
        let _m = Math.floor (t % 3600 / 60);
        console.log("m: " + _m + " s: " + _s);
        console.log("time: " + this.mousePosOnTimeline.x * this.framePerPixel);



            // Use loc.x and loc.y here
    }


    public addOsc =(evt)=>
    {

        console.log("onMouseUp");
        console.log(evt);





        if(evt.button == 0)
        {

            let selectNum = 0;

            if(this.oscFrags.length > 0 )
            {

                let isCheck = false;
                for(let i = 0; i < this.oscFrags.length; i++) {
                    if(this.oscFrags[i].isSelected)
                    {
                        this.oscFrags[i].setInputValues();
                    }
                    this.oscFrags[i].diselect();
                    if (this.oscFrags[i].frag.x() + this.oscFrags[i].width > this.mousePosOnTimeline.x && this.oscFrags[i].frag.x() <= this.mousePosOnTimeline.x)
                    {

                        isCheck = true;
                        this.oscFrags[i].select();
                        selectNum ++;
                        $(".inputFlagValue").addClass("edit");
                        $("#sendingFrames").addClass("edit");

                        // $(".flagValueDebug").addClass("hide");
                    }


                }
                if(!isCheck && this.isReadyDoubleClick)
                {
                    let frag = this.timeline.rect(this.fragWidth, this.timelineHeight - this.lineWidth).move(this.mousePosOnTimeline.x, this.lineWidth / 2).fill({color: "rgba(13, 71, 161,0.5)"}).stroke({
                        color: '#0d47a1',
                        opacity: 1.0,
                        width: 0
                    });

                    console.log(frag);
                    let f = new FlagValues(frag, this.mousePosOnTimeline.x * this.framePerPixel, this.pixelPerFrame);
                    this.oscFrags.push(f);
                }

                if(selectNum == 0)
                {
                    $(".inputFlagValue").removeClass("edit");
                    $('#sendingFrames').removeClass("edit");
                    $(".inputFlagValue").val("");
                    $('#sendingFrames').val("");
                    // $(".flagValueDebug").removeClass("hide");
                }
            } else
            {
                if(this.isReadyDoubleClick) {

                    let frag = this.timeline.rect(this.fragWidth, this.timelineHeight - this.lineWidth).move(this.mousePosOnTimeline.x, this.lineWidth / 2).fill({color: "rgba(13, 71, 161,0.5)"}).stroke({
                        color: '#0d47a1',
                        opacity: 1.0,
                        width: 0
                    });
                    console.log(frag);
                    let f = new FlagValues(frag, this.mousePosOnTimeline.x * this.framePerPixel, this.pixelPerFrame);
                    this.oscFrags.push(f);
                }

            }

            this.isReadyDoubleClick = false;
        }

        if(evt.button == 1)
        {
            for(let i = 0; i < this.oscFrags.length; i++)
            {
                if(this.oscFrags[i].frag.x()+this.oscFrags[i].width > this.mousePosOnTimeline.x && this.oscFrags[i].frag.x() <= this.mousePosOnTimeline.x)
                {
                    this.oscFrags[i].frag.remove();
                    this.oscFrags.splice(i,1);
                }
            }
        }


        // シングルクリックを受理、300ms間だけダブルクリック判定を残す
        this.isReadyDoubleClick = true;
        setTimeout( ()=> {
            // ダブルクリックによりclickedフラグがリセットされていない
            //     -> シングルクリックだった
            if (this.isReadyDoubleClick) {
                // alert("single click!");
            }

            this.isReadyDoubleClick = false;
        }, 300);


    }

    public calDuration()
    {
        this.durationFrameNums = this.duration_f + this.duration_s*this.fps + this.duration_m * 60 * this.fps + this.duration_h * 60 * 60 * this.fps;
        console.log(this.durationFrameNums);
        this.framePerPixel =  this.durationFrameNums/this.timeline.width();
        console.log("frameperpixel: " + this.framePerPixel);
        this.pixelPerFrame = this.timeline.width()/this.durationFrameNums;
        console.log("pixelPerFrame: " + this.pixelPerFrame);
    }

    public onDurationChange =()=>
    {
        this.calDuration();
    }

    public onWindowResize()
    {
        // this.audioScale.x = this.timeline.width();


    }

    public getCursor(evt) {
        var pt=this.svg_timeline.createSVGPoint();
        pt.x=evt.clientX;
        pt.y=evt.clientY;
        return pt.matrixTransform(this.svg_timeline.getScreenCTM().inverse());
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

            // this.resetTime();
            this.isPlay = true;
            this.update();

            this.updateStartTime = new Date().getTime();

            this.audiolinetest.play();

            //クラスとテキスト変更

            $('.play').removeClass('play').addClass('pause').html('PAUSE');

        }

    }

    public audioPlay =()=>
    {
        
    }


    public resetTime =()=>
    {
        this.preFrame = 0;
        this.startTime = new Date().getTime();
        this.nowTime = new Date().getTime();
    }


    public pause=()=>
    {
        // this.pauseTime = this.audioContext.currentTime;
        // this.audioSouce.stop(0);

        //クラスとテキスト変更
        this.isPlay = false;
        $('#playButton').addClass('play');
        $('#playButton').removeClass('pause');
        $('#playButton').html('PLAY');

        this.updatePauseTime = new Date().getTime();
        this.isPause = true;

        this.playingTime +=  (new Date().getTime() - this.updateStartTime)/1000;
        this.audiolinetest.pause();

    }




    public update = (time) =>
    {



        if(this.isPlay) {



            let dTime = (new Date().getTime() - this.updateStartTime)/1000;



            this.preSec = new Date().getSeconds();


        // this.timeToDom();



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

            let oscNum = 0;
            for(let i = 0; i < this.oscFrags.length; i++)
            {
                let fragtime = this.oscFrags[i].time;
                let fragtime_floored = Math.floor(fragtime);
                let frameNum = fragtime - fragtime_floored;
                if((this.playingTime+dTime)*60 > fragtime && (this.playingTime+dTime)*60 < fragtime+this.oscFrags[i].sendingOscTime )
                {
                    $(".flagValueDebug").text(JSON.stringify(this.oscFrags[i].values));
                    oscNum++;
                }
            }

            if(oscNum == 0)
            {
                $(".flagValueDebug").text("");
            }





            let per = ((this.playingTime+dTime)*60) / this.durationFrameNums;
            this.playTimeLine.move(this.timeline.width()*per,this.lineWidth/2);

        }

        requestAnimationFrame(this.update);
    }
}

$(window).on("load",function () {
    const main = new Main();



});
