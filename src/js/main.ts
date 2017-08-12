declare function require(x: string): any;
import * as SVG from 'svg.js';
import * as $ from "jquery";

// console.log(SVG);

class Main
{
    public xhr:XMLHttpRequest;
    public audioContext:AudioContext;
    public  audioBuffers:ArrayBuffer[] = [];
    private draw:SVG;
    constructor()
    {
        console.log("hello!")
        this.init();
    }

    public init()
    {
        this.draw = SVG('drawing').size(700, 300);
        // let rect = this.draw.rect(100, 100);

        this.xhr = new XMLHttpRequest();
        this.audioContext = new AudioContext();

        this.soundOpen("sound/sample.mp3");
    }


    public soundOpen = (url:string) =>
    {



        var context = new AudioContext();


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
                        let buffer = audioBuffer;

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
                        var n10msec = Math.floor(10 * Math.pow(10, -3) * context.sampleRate);


                        let count = 0;
                        for (var i = 0, len = channelLs.length; i < len; i++) {
                            if ((i % n10msec) === 0) {
                                count ++;
                            }
                        }

                        let _count = 0;
                        let _widht = this.draw.width()/count;
                        console.log(_widht);
                        for (var i = 0, len = channelLs.length; i < len; i++) {
                            //10ミリ秒ごとに描画
                            if ((i % n10msec) === 0) {
                                // console.log("count: " + _count + "  " + "c: " + channelLs[i]);
                                let adj_h = this.draw.height()*0.1;
                                let h = ((1 - channelLs[i]) / 2) * (this.draw.height())-this.draw.height()/2;
                                let x = (i/len) * this.draw.width();
                                // console.log(c);

                                let y = this.draw.height()/2;


                                y -= h/2;
                                let rect = this.draw.rect(1, h).move(x,  y).fill('#f06');
                                _count++;
                            }



                            // if ((i % n10msec) === 0) {
                            //     var x = (i / len) * canvas.width;
                            //     var y = ((1 - channelLs[i]) / 2) * (canvas.height - 20) + 20;
                            //     if (i === 0) {
                            //         //canvasの描画初期位置
                            //         canvasContext.moveTo(x, y);
                            //     } else {
                            //         canvasContext.lineTo(x, y);
                            //     }
                            // }
                        }

                        // canvasContext.stroke();

                        //曲の秒数
                        let soundtime = Math.floor(audioBuffer.length / context.sampleRate);


                    };
                    var errorCallback = function() {
                        window.alert('読み込みに失敗しました');
                    };

                    context.decodeAudioData(arrayBuffer, successCallback, errorCallback);

                }
            }
        };
        xhr.send(null);


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