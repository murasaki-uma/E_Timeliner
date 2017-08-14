declare function require(x: string): any;
import * as SVG from 'svg.js';
import * as $ from "jquery";
import * as Math from "mathjs";
// console.log(SVG);


class FlagValues
{
    
    constructor()
    {

    }
}

class Main
{
    public xhr:XMLHttpRequest;
    public audioContext:AudioContext;
    public audioBuffers:AudioBuffer[] = [];
    public audioSouce:AudioBufferSourceNode;
    public audioGainNode:any;
    private draw:SVG.Container;
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

    // public time_update:number;

    public isPlayFirst:boolean = true;
    public isPause:boolean = false;


    public fragWidth:number = 6;
    public mousePosOnTimeline:any = {x:0,y:0};

    public oscFrags:SVG.Rect[] = [];

    constructor()
    {
        console.log("hello!");
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

        this.draw = SVG('drawing').size(700, this.timelineHeight);

        // let rect = this.timeline.rect(100,100).fill('#f06');

        // let p0_x = this.lineWidth
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




        this.soundOpen("sound/sample.mp3");

        $("#playButton").on('click',this.play);
        $("#stopButton").on('click',this.pause);
        $("#volume").on('input',this.setVolume);

        this.svg_timeline = document.querySelector('#'+this.timeline.id());




        this.svg_timeline.addEventListener('mousemove',(evt)=>{
            var loc= this.getCursor(evt);
            this.mousePosOnTimeline.x = loc.x;
            this.mousePosOnTimeline.y = loc.y;
            this.selectedLine.move(loc.x+this.lineWidth/2,this.lineWidth/2);
            console.log(loc);
            // Use loc.x and loc.y here
        },false);

        this.svg_timeline.addEventListener('mouseup',this.addOsc,false);



        this.update();

        $(".durationValues").on('input',this.onDurationChange);
    }

    public addOsc =(evt)=>
    {

        console.log("onMouseUp");
        console.log(evt);
        if(evt.button == 0)
        {
            let frag = this.timeline.rect(this.fragWidth, this.timelineHeight-this.lineWidth).move(this.mousePosOnTimeline.x,this.lineWidth/2).fill({color:"rgba(13, 71, 161,0.5)"});
            console.log(frag);
            this.oscFrags.push(frag);
        }

        if(evt.button == 1)
        {
            for(let i = 0; i < this.oscFrags.length; i++)
            {
                if(this.oscFrags[i].x()+this.fragWidth > this.mousePosOnTimeline.x && this.oscFrags[i].x() <= this.mousePosOnTimeline.x)
                {
                    this.oscFrags[i].remove();
                }
            }
        }


    }

    public calDuration()
    {
        this.durationFrameNums = this.duration_f + this.duration_s*this.fps + this.duration_m * 60 * this.fps + this.duration_h * 60 * 60 * this.fps;
        console.log(this.durationFrameNums);
        this.framePerPixel = this.timeline.width() / this.durationFrameNums;
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
            //AudioBufferSourceNodeを作成する
            this.audioSouce = this.audioContext.createBufferSource();
            //bufferプロパティにAudioBufferインスタンスを設定
            this.audioSouce.buffer = this.audioBuffers[0];
            //ループ
            this.audioSouce.loop = false;
            //AudioBufferSourceNodeインスタンスをdestinationプロパティに接続
            this.audioSouce.connect(this.audioContext.destination);

            //GainNodeを作成する
            this.audioGainNode = this.audioContext.createGain();
            //sourceをGainNodeへ接続する
            this.audioSouce.connect(this.audioGainNode);
            //GainNodeをAudioDestinationNodeに接続
            this.audioGainNode.connect(this.audioContext.destination);
            // this.audioGainNode.gain.value = -0.4;


            this.setVolume();
            this.updateStartTime = new Date().getTime();


            if (this.isPlayFirst) {
                //スタート時間を変数startTimeに格納
                this.startTime = this.audioContext.currentTime;
                this.replayTime = this.startTime;
                //停止されている時間を初期は0にしておく
                this.pausingTime = 0;
                this.isPlayFirst = false;


            } else {
                //再スタート時間を変数replayTimeに格納
                this.replayTime = this.audioContext.currentTime;
                //再スタートの時間からpauseした時間を引いて、停止されている時間の合計に足していく
                this.pausingTime += this.replayTime - this.pauseTime;
                this.isPause = false;
            }

            //replayTimeからstartTimeとpausingTime引いた時間が曲のスタート時間
            var playTime = this.replayTime - this.startTime - this.pausingTime;

            //再生
            this.audioSouce.start(0, playTime);

            //クラスとテキスト変更
            $('.play').removeClass('play').addClass('pause').html('PAUSE');


        }

    }


    public resetTime =()=>
    {
        this.preFrame = 0;
        this.startTime = new Date().getTime();
        this.nowTime = new Date().getTime();
    }


    public pause=()=>
    {
        this.pauseTime = this.audioContext.currentTime;
        this.audioSouce.stop(0);

        //クラスとテキスト変更
        this.isPlay = false;
        $('#playButton').addClass('play');
        $('#playButton').removeClass('pause');
        $('#playButton').html('PLAY');

        this.updatePauseTime = new Date().getTime();
        this.isPause = true;

        this.playingTime +=  (new Date().getTime() - this.updateStartTime)/1000;

    }

    public setVolume =()=>
    {
        //range属性のvalue取得
        var value = document.getElementById( "volume" ).value / 100.0;
        //gainNodeの値に変更
        // var volume = ( value / 10 ) - 1;

        //gainNodeに代入
        this.audioGainNode.gain.value = value;
    }

    public soundOpen = (url:string) =>
    {
        this.audioContext = new AudioContext();

        var xhr = new XMLHttpRequest();
        //読み込むデータのURLを書く
        xhr.open('GET', "sound/sample.mp3", true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = ()=> {
            console.log(this.draw);
            if (xhr.status === 200) {
                var arrayBuffer = xhr.response;
                if (arrayBuffer instanceof ArrayBuffer) {
                    var successCallback = (audioBuffer)=> {

                        //AudioBufferインスタンスを変数へ格納
                        // let buffer = audioBuffer;
                        console.log(audioBuffer.duration);
                        this.draw.size(audioBuffer.duration*60/this.durationFrameNums * this.timeline.width(),this.timelineHeight);
                        // this.draw.scale(1.0,1.0);


                        this.audioBuffers.push(audioBuffer);
                        let source = this.audioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        // this.audioSouces.push(source);



                        var channelLs = new Float32Array(audioBuffer.length);

                        //オーディオデータのチャンネル数が０以上のとき
                        if (audioBuffer.numberOfChannels > 0) {
                            //getChannelDataメソッドで波形データ取得
                            channelLs.set(audioBuffer.getChannelData(0));
                        }

                        // var canvas = document.querySelector('canvas');
                        // var canvasContext = canvas.getContext('2d');
                        // //canvasをクリアにする
                        // canvasContext.clearRect(0, 0, canvas.width, canvas.height);

                        //10ミリ秒
                        var n10msec = Math.floor(10 * Math.pow(10, -3) * this.audioContext.sampleRate);

                        //
                        // let count = 0;
                        // for (var i = 0, len = channelLs.length; i < len; i++) {
                        //     if ((i % n10msec) === 0) {
                        //         count ++;
                        //     }
                        // }
                        //
                        // let _count = 0;
                        // let _widht = this.draw.width()/count;
                        // console.log(_widht);
                        for (var i = 0, len = channelLs.length; i < len; i++) {
                            //10ミリ秒ごとに描画
                            if ((i % n10msec) === 0) {
                                // console.log("count: " + _count + "  " + "c: " + channelLs[i]);
                                let adj_h = this.draw.height()*0.1;
                                let h = ((1 + channelLs[i]) / 2) * (this.draw.height())-this.draw.height()/2;
                                if(h < 0)
                                {
                                    h = 0;
                                }
                                let x = (i/len) * this.draw.width();
                                // console.log(c);

                                let y = this.draw.height()/2;


                                y -= h/2;
                                let rect = this.draw.rect(1, h).move(x,  y).fill('#f06');
                                // _count++;
                            }


                        }

                        // canvasContext.stroke();

                        //曲の秒数
                        let soundtime = Math.floor(audioBuffer.length / this.audioContext.sampleRate);


                    };
                    var errorCallback = function() {
                        window.alert('読み込みに失敗しました');
                    };

                    this.audioContext.decodeAudioData(arrayBuffer, successCallback, errorCallback);

                }
            }

        };
        xhr.send(null);


    }

    public update = (time) =>
    {



        if(this.isPlay) {



            let dTime = (new Date().getTime() - this.updateStartTime)/1000;



            this.preSec = new Date().getSeconds();


        // this.timeToDom();



            let mill = dTime - Math.floor(dTime);
            console.log(dTime);
            let framenum = Math.floor(mill * 60);


            $('.timeline_f').text(framenum);
            let _s = Math.floor((this.playingTime+dTime)%60);
            $('.timeline_s').text(_s);


            let _m = Math.floor( (this.playingTime+dTime) % 3600 / 60 );
            console.log(_m);
            $('.timeline_m').text(_m);

            let h = Math.floor( (this.playingTime+dTime) / 3600);;
            $('.timeline_h').text(h);



            let per = ((this.playingTime+dTime)*60) / this.durationFrameNums;
            this.playTimeLine.move(this.timeline.width()*per,this.lineWidth/2);

        }

        requestAnimationFrame(this.update);
    }
}

$(window).on("load",function () {
    const main = new Main();



});



/*
window.AudioContext = window.AudioContext || window.webkitAudioContext || mozAudioContext;
try {
    var context = new AudioContext();
} catch (error) {
    alert('このブラウザは未対応です');
}

var xhr = new XMLHttpRequest();
//読み込むデータのURLを書く
xhr.open('GET', 'sound/1830.mp3', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function() {
    if (xhr.status === 200) {
        var arrayBuffer = xhr.response;
        if (arrayBuffer instanceof ArrayBuffer) {
            var successCallback = function(audioBuffer) {

                //AudioBufferインスタンスを変数へ格納
                buffer = audioBuffer;

                var channelLs = new Float32Array(audioBuffer.length);

                //オーディオデータのチャンネル数が０以上のとき
                if (audioBuffer.numberOfChannels > 0) {
                    //getChannelDataメソッドで波形データ取得
                    channelLs.set(audioBuffer.getChannelData(0));
                }

                //10ミリ秒
                var n10msec = Math.floor(10 * Math.pow(10, -3) * context.sampleRate);

                var canvas = document.querySelector('canvas');
                var canvasContext = canvas.getContext('2d');
                //canvasをクリアにする
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);

                //描画色設定
                canvasContext.strokeStyle='#50EAFF';
                //channelLsの長さだけループ
                for (var i = 0, len = channelLs.length; i < len; i++) {
                    //10ミリ秒ごとに描画
                    if ((i % n10msec) === 0) {
                        var x = (i / len) * canvas.width;
                        var y = ((1 - channelLs[i]) / 2) * (canvas.height - 20) + 20;
                        if (i === 0) {
                            //canvasの描画初期位置
                            canvasContext.moveTo(x, y);
                        } else {
                            canvasContext.lineTo(x, y);
                        }
                    }
                }
                //描画
                canvasContext.stroke();


                //曲の秒数
                soundtime = Math.floor(audioBuffer.length / context.sampleRate);

                //目盛り表示欄
                canvasContext.fillStyle = '#6e6e6e';
                canvasContext.fillRect(0, 0, canvas.width, 20);

                //１秒あたりのX軸へ動く数値
                xRate = canvas.width / soundtime;
                canvasContext.fillStyle = '#eee';
                for(var i = 0; i < soundtime; i++){
                    var x = xRate * i;
                    if (i === 0) {
                        canvasContext.moveTo(x, canvas.height);
                    } else {
                        if( i % 10 === 0 ){
                            //10秒毎にグリッドを描画
                            canvasContext.fillRect(x, 10, 0.5, canvas.height - 10);
                            canvasContext.fillText(i, x-7, 10);
                        }else if(i % 2 === 0 ){
                            //2秒毎に目盛りを描画
                            canvasContext.fillRect(x, 15, 0.3, 5);
                        }
                    }
                }
                canvasContext.stroke();

            };
            var errorCallback = function() {
                window.alert('読み込みに失敗しました');
            };

            context.decodeAudioData(arrayBuffer, successCallback, errorCallback);

        }
    }
};
xhr.send(null);

var first_flg = true;
function play(){

    if($('#playBotton').hasClass('pause')){

        pause();

    }else if($('#playBotton').hasClass('play')){

        //AudioBufferSourceNodeを作成する
        source = context.createBufferSource();
        //bufferプロパティにAudioBufferインスタンスを設定
        source.buffer = buffer;
        //ループ
        source.loop = false;
        //AudioBufferSourceNodeインスタンスをdestinationプロパティに接続
        source.connect(context.destination);

        //GainNodeを作成する
        gainNode = context.createGain();
        //sourceをGainNodeへ接続する
        source.connect(gainNode);
        //GainNodeをAudioDestinationNodeに接続
        gainNode.connect(context.destination);
        gainNode.gain.value = 4;

        source.start = source.start || source.noteOn;
        source.stop  = source.stop  || source.noteOff;

        //始めからの再生の場合
        if(first_flg){
            //スタート時間を変数startTimeに格納
            startTime = context.currentTime;
            replayTime = startTime;
            //停止されている時間を初期は0にしておく
            pausingTime = 0;
            first_flg = false;
        }else{
            //再スタート時間を変数replayTimeに格納
            replayTime = context.currentTime;
            //再スタートの時間からpauseした時間を引いて、停止されている時間の合計に足していく
            pausingTime += replayTime - pauseTime;
        }

        //replayTimeからstartTimeとpausingTime引いた時間が曲のスタート時間
        var playTime = replayTime - startTime - pausingTime;

        //再生
        source.start(0,playTime);

        //クラスとテキスト変更
        $('.play').removeClass('play').addClass('pause').html('PAUSE');
    }
}

function pause() {

    //止めた時間を変数pauseTimeに格納
    pauseTime = context.currentTime;
    source.stop(0);

    //クラスとテキスト変更
    $('.pause').removeClass('pause').addClass('play').html('PLAY');

}


$(document).on('click', '.stop', function(){
    stop();
});
function stop(){
    source.stop();
    first_flg = true;
    //クラスとテキスト変更
    $('.pause').removeClass('pause').addClass('play').html('PLAY');
}


function volumeChange(){

    //range属性のvalue取得
    var value = document.getElementById( "volume" ).value;
    //gainNodeの値に変更
    var volume = ( value / 10 ) - 1;

    //gainNodeに代入
    gainNode.gain.value = volume;

}

*/