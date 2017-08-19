/**
 * Created by PurpleUma on 8/20/17.
 */
import * as SVG from 'svg.js';

export default class AudioTimeLine {
    public audioContext:AudioContext = new AudioContext();
    public audioSouce:AudioBufferSourceNode;
    public audioBuffer:AudioBuffer;
    public audioGainNode:any;
    public replayTime:number = 0;
    public startTime:number = 0;
    public pausingTime:number = 0;
    public pauseTime:number = 0;
    public isPlayFirst:boolean = true;
    public isPause:boolean = true;

    public delay:number = 0;
    public pixelPerFrame:number = 0;

    public svg:SVG.Container;
    public svg_BG:SVG.Rect;

    constructor(url:string, delay:number, pixelPerFrame:number)
    {

        this.svg = SVG('drawing').size(700, 100).move(50,0);
        this.svg_BG = this.svg.rect(700,100).fill({color:"#2196F3",opacity:0.5});

        this.delay = delay;
        this.pixelPerFrame = pixelPerFrame;

        this.audioContext = new AudioContext();

        var xhr = new XMLHttpRequest();
        //読み込むデータのURLを書く
        xhr.open('GET', "sound/sample.mp3", true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = ()=> {
            if (xhr.status === 200) {
                var arrayBuffer = xhr.response;
                if (arrayBuffer instanceof ArrayBuffer) {
                    var successCallback = (audioBuffer)=> {


                        this.audioBuffer = audioBuffer;

                        this.svg.size(audioBuffer.duration*60*this.pixelPerFrame,100);
                        this.svg_BG.size(this.svg.width(),this.svg.height()).fill({color:"#2196F3",opacity:0.5});

                        let startX = this.delay*this.pixelPerFrame;

                        this.svg_BG.move(startX,0);
                        // this.audioTimeline.cx(1000).cy(60);
                        this.svg.fill("#444");

                        var channelLs = new Float32Array(audioBuffer.length);

                        //オーディオデータのチャンネル数が０以上のとき
                        if (audioBuffer.numberOfChannels > 0) {
                            //getChannelDataメソッドで波形データ取得
                            channelLs.set(audioBuffer.getChannelData(0));
                        }


                        //10ミリ秒
                        var n10msec = Math.floor(10 * Math.pow(10, -3) * this.audioContext.sampleRate);

                        for (var i = 0, len = channelLs.length; i < len; i++) {
                            //10ミリ秒ごとに描画
                            if ((i % n10msec) === 0) {
                                // console.log("count: " + _count + "  " + "c: " + channelLs[i]);
                                let adj_h = this.svg.height()*0.1;
                                let h = ((1 + channelLs[i]) / 2) * (this.svg.height())-this.svg.height()/2;
                                if(h < 0)
                                {
                                    h = 0;
                                }
                                let x = (i/len) * this.svg.width();
                                // console.log(c);

                                let y = this.svg.height()/2;


                                y -= h/2;
                                let rect = this.svg.rect(1, h).move(x+startX,  y).fill('#f06');
                                // _count++;
                            }


                        }




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

    public play =()=>
    {
        this.audioSouce = this.audioContext.createBufferSource();
        //bufferプロパティにAudioBufferインスタンスを設定
        this.audioSouce.buffer = this.audioBuffer;
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
        this.audioGainNode.gain.value = -0.4;


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

        var playTime = this.replayTime - this.startTime - this.pausingTime;

        this.audioSouce.start(0, playTime);

    }

    public pause = () =>
    {
        this.pauseTime = this.audioContext.currentTime;
        this.audioSouce.stop(0);

    }

}